const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aws-event-manager-secret-key';

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 中间件配置
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
        },
    },
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// 速率限制
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 100, // 限制每个IP每分钟100个请求
    message: { success: false, message: '请求过于频繁，请稍后再试' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5, // 限制每个IP每15分钟5次登录尝试
    message: { success: false, message: '登录尝试过于频繁，请15分钟后再试' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

// Session配置
app.use(session({
    secret: process.env.SESSION_SECRET || 'aws-event-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24小时
    }
}));

// 数据库初始化
const db = new sqlite3.Database('event-manager.db');

// 创建数据表
db.serialize(() => {
    // 管理员表
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 活动表
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_time TIME NOT NULL,
        location VARCHAR(500) NOT NULL,
        speaker_name VARCHAR(100),
        speaker_title VARCHAR(100),
        speaker_company VARCHAR(100),
        speaker_bio TEXT,
        speaker_avatar VARCHAR(255),
        max_attendees INTEGER DEFAULT 100,
        status VARCHAR(20) DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 报名表
    db.run(`CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        company VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        age INTEGER,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        notes TEXT,
        status VARCHAR(20) DEFAULT 'registered',
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
    )`);

    // 签到表
    db.run(`CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registration_id INTEGER NOT NULL,
        checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        checked_by VARCHAR(100),
        FOREIGN KEY (registration_id) REFERENCES registrations(id)
    )`);

    // 照片表
    db.run(`CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        description TEXT,
        file_size INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
    )`);

    // 活动总结表
    db.run(`CREATE TABLE IF NOT EXISTS summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
    )`);

    // 创建默认管理员账户
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO admins (username, password_hash, email) 
            VALUES ('admin', ?, 'admin@aws-community.com')`, [defaultPassword]);
});

// JWT认证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: '访问令牌缺失' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: '访问令牌无效' });
        }
        req.user = user;
        next();
    });
};

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB限制
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'));
        }
    }
});

// API路由

// 认证相关
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    db.get('SELECT * FROM admins WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            },
            message: '登录成功'
        });
    });
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, username, email FROM admins WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        res.json({
            success: true,
            data: user,
            message: '获取用户信息成功'
        });
    });
});

// 活动管理
app.get('/api/events', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM events';
    let params = [];

    if (status && status !== 'all') {
        query += ' WHERE status = ?';
        params.push(status);
    }

    query += ' ORDER BY event_date DESC, event_time DESC';

    db.all(query, params, (err, events) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        res.json({
            success: true,
            data: events,
            message: '获取活动列表成功'
        });
    });
});

app.get('/api/events/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        if (!event) {
            return res.status(404).json({ success: false, message: '活动不存在' });
        }

        res.json({
            success: true,
            data: event,
            message: '获取活动详情成功'
        });
    });
});

app.post('/api/events', authenticateToken, (req, res) => {
    const {
        title, description, event_date, event_time, location,
        speaker_name, speaker_title, speaker_company, speaker_bio,
        max_attendees
    } = req.body;

    if (!title || !event_date || !event_time || !location) {
        return res.status(400).json({ success: false, message: '必填字段不能为空' });
    }

    const query = `INSERT INTO events (
        title, description, event_date, event_time, location,
        speaker_name, speaker_title, speaker_company, speaker_bio,
        max_attendees, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

    const params = [
        title, description, event_date, event_time, location,
        speaker_name, speaker_title, speaker_company, speaker_bio,
        max_attendees || 100
    ];

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: '创建活动失败' });
        }

        res.json({
            success: true,
            data: { id: this.lastID },
            message: '创建活动成功'
        });
    });
});

app.put('/api/events/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const {
        title, description, event_date, event_time, location,
        speaker_name, speaker_title, speaker_company, speaker_bio,
        max_attendees
    } = req.body;

    const query = `UPDATE events SET 
        title = ?, description = ?, event_date = ?, event_time = ?, location = ?,
        speaker_name = ?, speaker_title = ?, speaker_company = ?, speaker_bio = ?,
        max_attendees = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`;

    const params = [
        title, description, event_date, event_time, location,
        speaker_name, speaker_title, speaker_company, speaker_bio,
        max_attendees || 100, id
    ];

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: '更新活动失败' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: '活动不存在' });
        }

        res.json({
            success: true,
            message: '更新活动成功'
        });
    });
});

app.put('/api/events/:id/status', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'ongoing', 'completed'].includes(status)) {
        return res.status(400).json({ success: false, message: '无效的状态值' });
    }

    db.run('UPDATE events SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
           [status, id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: '更新状态失败' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: '活动不存在' });
        }

        res.json({
            success: true,
            message: '更新状态成功'
        });
    });
});

// 报名管理
app.get('/api/events/:id/registrations', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT r.*, c.checked_in_at, c.checked_by
        FROM registrations r
        LEFT JOIN checkins c ON r.id = c.registration_id
        WHERE r.event_id = ?
        ORDER BY r.registered_at DESC
    `;

    db.all(query, [id], (err, registrations) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        res.json({
            success: true,
            data: registrations,
            message: '获取报名列表成功'
        });
    });
});

app.post('/api/events/:id/registrations', (req, res) => {
    const { id } = req.params;
    const { name, company, position, age, phone, email, notes } = req.body;

    if (!name || !company || !position || !phone) {
        return res.status(400).json({ success: false, message: '必填字段不能为空' });
    }

    // 检查是否重复报名
    db.get('SELECT id FROM registrations WHERE event_id = ? AND phone = ?', 
           [id, phone], (err, existing) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        if (existing) {
            return res.status(400).json({ success: false, message: '该手机号已报名此活动' });
        }

        const query = `INSERT INTO registrations (
            event_id, name, company, position, age, phone, email, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [id, name, company, position, age, phone, email, notes];

        db.run(query, params, function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: '报名失败' });
            }

            res.json({
                success: true,
                data: { id: this.lastID },
                message: '报名成功'
            });
        });
    });
});

// 签到管理
app.post('/api/registrations/:id/checkin', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { checked_by } = req.body;

    // 检查是否已签到
    db.get('SELECT id FROM checkins WHERE registration_id = ?', [id], (err, existing) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        if (existing) {
            return res.status(400).json({ success: false, message: '该参会者已签到' });
        }

        db.run('INSERT INTO checkins (registration_id, checked_by) VALUES (?, ?)', 
               [id, checked_by || req.user.username], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: '签到失败' });
            }

            res.json({
                success: true,
                message: '签到成功'
            });
        });
    });
});

app.get('/api/events/:id/checkin-stats', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            COUNT(r.id) as total_registrations,
            COUNT(c.id) as checked_in_count,
            (COUNT(r.id) - COUNT(c.id)) as not_checked_in_count
        FROM registrations r
        LEFT JOIN checkins c ON r.id = c.registration_id
        WHERE r.event_id = ?
    `;

    db.get(query, [id], (err, stats) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        res.json({
            success: true,
            data: stats,
            message: '获取签到统计成功'
        });
    });
});

// 照片管理
app.post('/api/events/:id/photos', authenticateToken, upload.array('photos', 10), async (req, res) => {
    const { id } = req.params;
    const { descriptions } = req.body;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要上传的照片' });
    }

    try {
        const photoPromises = req.files.map(async (file, index) => {
            // 压缩图片
            const compressedPath = path.join('uploads', 'compressed-' + file.filename);
            
            try {
                const image = await Jimp.read(file.path);
                await image
                    .scaleToFit(1200, 800)
                    .quality(80)
                    .writeAsync(compressedPath);

                // 删除原文件
                fs.unlinkSync(file.path);
            } catch (error) {
                console.error('图片压缩失败:', error);
                // 如果压缩失败，直接使用原文件
                fs.renameSync(file.path, compressedPath);
            }

            const description = Array.isArray(descriptions) ? descriptions[index] : descriptions;

            return new Promise((resolve, reject) => {
                const query = `INSERT INTO photos (
                    event_id, filename, original_name, description, file_size
                ) VALUES (?, ?, ?, ?, ?)`;

                const params = [
                    id, 
                    'compressed-' + file.filename, 
                    file.originalname, 
                    description || '', 
                    file.size
                ];

                db.run(query, params, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID });
                    }
                });
            });
        });

        const results = await Promise.all(photoPromises);

        res.json({
            success: true,
            data: results,
            message: '照片上传成功'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: '照片处理失败' });
    }
});

app.get('/api/events/:id/photos', (req, res) => {
    const { id } = req.params;

    db.all('SELECT * FROM photos WHERE event_id = ? ORDER BY uploaded_at DESC', 
           [id], (err, photos) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        res.json({
            success: true,
            data: photos,
            message: '获取照片列表成功'
        });
    });
});

// 活动总结
app.get('/api/events/:id/summary', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM summaries WHERE event_id = ?', [id], (err, summary) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        res.json({
            success: true,
            data: summary,
            message: summary ? '获取活动总结成功' : '暂无活动总结'
        });
    });
});

app.post('/api/events/:id/summary', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ success: false, message: '总结内容不能为空' });
    }

    // 检查是否已存在总结
    db.get('SELECT id FROM summaries WHERE event_id = ?', [id], (err, existing) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }

        if (existing) {
            // 更新现有总结
            db.run('UPDATE summaries SET content = ?, published_at = CURRENT_TIMESTAMP WHERE event_id = ?', 
                   [content, id], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: '更新总结失败' });
                }

                res.json({
                    success: true,
                    message: '更新活动总结成功'
                });
            });
        } else {
            // 创建新总结
            db.run('INSERT INTO summaries (event_id, content) VALUES (?, ?)', 
                   [id, content], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: '创建总结失败' });
                }

                res.json({
                    success: true,
                    data: { id: this.lastID },
                    message: '创建活动总结成功'
                });
            });
        }
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: '文件大小超过限制(5MB)' });
        }
    }
    
    console.error('服务器错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ success: false, message: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 AWS活动管理系统服务器运行在端口 ${PORT}`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`🔑 默认管理员账户: admin / admin123`);
});

module.exports = app;