-- 多邻国克隆项目种子数据
-- 创建示例课程、技能和练习题

-- 插入示例课程
INSERT INTO courses (id, name, description, language_from, language_to, difficulty_level, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440001', '英语基础课程', '从零开始学习英语基础知识', 'zh-CN', 'en', 1, 1),
('550e8400-e29b-41d4-a716-446655440002', '英语进阶课程', '提升英语听说读写能力', 'zh-CN', 'en', 2, 2)
ON CONFLICT (id) DO NOTHING;

-- 插入示例单元 (英语基础课程)
INSERT INTO units (id, course_id, name, description, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', '基础词汇', '学习日常生活中的基础英语词汇', 1),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', '基础语法', '掌握英语基本语法规则', 2),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', '日常对话', '学习日常生活对话', 3)
ON CONFLICT (id) DO NOTHING;

-- 插入示例技能 (基础词汇单元)
INSERT INTO skills (id, unit_id, name, description, order_index, difficulty_level) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', '问候语', '学习基本的问候和告别用语', 1, 1),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440011', '数字', '学习英语数字1-100', 2, 1),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440011', '颜色', '学习基本颜色词汇', 3, 1),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440011', '家庭成员', '学习家庭成员称呼', 4, 1),
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440011', '食物', '学习基本食物词汇', 5, 1)
ON CONFLICT (id) DO NOTHING;

-- 插入示例课程 (问候语技能)
INSERT INTO lessons (id, skill_id, name, type, order_index, xp_reward) VALUES
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '基础问候', 'lesson', 1, 10),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440021', '告别用语', 'lesson', 2, 10),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440021', '问候练习', 'practice', 3, 5)
ON CONFLICT (id) DO NOTHING;

-- 插入示例练习题 (基础问候课程)
INSERT INTO exercises (id, lesson_id, type, question, correct_answer, options, order_index, difficulty_level) VALUES
-- 选择题
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440031', 'multiple_choice', '如何用英语说"你好"？', 'Hello', '["Hello", "Goodbye", "Thank you", "Sorry"]', 1, 1),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440031', 'multiple_choice', '"Good morning"的中文意思是？', '早上好', '["早上好", "晚上好", "下午好", "晚安"]', 2, 1),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440031', 'multiple_choice', '选择正确的英语问候语', 'How are you?', '["How are you?", "What are you?", "Where are you?", "Who are you?"]', 3, 1),

-- 翻译题
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440031', 'translation', '请翻译：你好吗？', 'How are you?', NULL, 4, 1),
('550e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440031', 'translation', '请翻译：很高兴见到你', 'Nice to meet you', NULL, 5, 1),

-- 填空题
('550e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440031', 'fill_blank', '填空：Good _____ (早上)', 'morning', NULL, 6, 1),
('550e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440031', 'fill_blank', '填空：_____ to meet you (很高兴见到你)', 'Nice', NULL, 7, 1)
ON CONFLICT (id) DO NOTHING;

-- 插入更多课程的练习题 (告别用语课程)
INSERT INTO exercises (id, lesson_id, type, question, correct_answer, options, order_index, difficulty_level) VALUES
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440032', 'multiple_choice', '"Goodbye"的中文意思是？', '再见', '["再见", "你好", "谢谢", "对不起"]', 1, 1),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440032', 'multiple_choice', '如何用英语说"晚安"？', 'Good night', '["Good night", "Good morning", "Good afternoon", "Good evening"]', 2, 1),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440032', 'translation', '请翻译：回头见', 'See you later', NULL, 3, 1),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440032', 'fill_blank', '填空：_____ you tomorrow (明天见)', 'See', NULL, 4, 1)
ON CONFLICT (id) DO NOTHING;

-- 插入数字技能的课程和练习
INSERT INTO lessons (id, skill_id, name, type, order_index, xp_reward) VALUES
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440022', '数字1-10', 'lesson', 1, 10),
('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440022', '数字11-20', 'lesson', 2, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, lesson_id, type, question, correct_answer, options, order_index, difficulty_level) VALUES
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440061', 'multiple_choice', '数字"5"用英语怎么说？', 'five', '["five", "four", "six", "seven"]', 1, 1),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440061', 'multiple_choice', '"eight"是数字几？', '8', '["6", "7", "8", "9"]', 2, 1),
('550e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440061', 'translation', '请翻译数字：三', 'three', NULL, 3, 1),
('550e8400-e29b-41d4-a716-446655440074', '550e8400-e29b-41d4-a716-446655440061', 'fill_blank', '填空：t___ (十)', 'ten', NULL, 4, 1)
ON CONFLICT (id) DO NOTHING;

-- 插入颜色技能的课程和练习
INSERT INTO lessons (id, skill_id, name, type, order_index, xp_reward) VALUES
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440023', '基本颜色', 'lesson', 1, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, lesson_id, type, question, correct_answer, options, order_index, difficulty_level) VALUES
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440081', 'multiple_choice', '"red"是什么颜色？', '红色', '["红色", "蓝色", "绿色", "黄色"]', 1, 1),
('550e8400-e29b-41d4-a716-446655440092', '550e8400-e29b-41d4-a716-446655440081', 'multiple_choice', '蓝色用英语怎么说？', 'blue', '["blue", "black", "brown", "purple"]', 2, 1),
('550e8400-e29b-41d4-a716-446655440093', '550e8400-e29b-41d4-a716-446655440081', 'translation', '请翻译：绿色', 'green', NULL, 3, 1),
('550e8400-e29b-41d4-a716-446655440094', '550e8400-e29b-41d4-a716-446655440081', 'fill_blank', '填空：y_____ (黄色)', 'yellow', NULL, 4, 1)
ON CONFLICT (id) DO NOTHING;

-- 插入练习题提示
INSERT INTO exercise_hints (exercise_id, hint_text, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440044', '提示：这是一个常见的问候语', 1),
('550e8400-e29b-41d4-a716-446655440045', '提示：初次见面时使用', 1),
('550e8400-e29b-41d4-a716-446655440073', '提示：发音类似"思瑞"', 1),
('550e8400-e29b-41d4-a716-446655440093', '提示：草和树叶的颜色', 1)
ON CONFLICT (exercise_id, order_index) DO NOTHING;

-- 插入成就数据
INSERT INTO achievements (id, name, description, type, requirement_value, xp_reward, gems_reward) VALUES
('550e8400-e29b-41d4-a716-446655440101', '初学者', '完成第一个练习', 'exercises', 1, 50, 10),
('550e8400-e29b-41d4-a716-446655440102', '坚持者', '连续学习3天', 'streak', 3, 100, 20),
('550e8400-e29b-41d4-a716-446655440103', '勤奋学习者', '连续学习7天', 'streak', 7, 200, 50),
('550e8400-e29b-41d4-a716-446655440104', '经验丰富', '获得100 XP', 'xp', 100, 0, 25),
('550e8400-e29b-41d4-a716-446655440105', '课程完成者', '完成10个课程', 'lessons', 10, 300, 75),
('550e8400-e29b-41d4-a716-446655440106', '完美主义者', '连续答对20题', 'perfect_streak', 20, 150, 30)
ON CONFLICT (id) DO NOTHING;

-- 插入商店物品
INSERT INTO shop_items (id, name, description, type, price_gems) VALUES
('550e8400-e29b-41d4-a716-446655440201', '生命值补充', '立即恢复所有生命值', 'heart_refill', 350),
('550e8400-e29b-41d4-a716-446655440202', '连击保护', '保护连击不被中断一次', 'streak_freeze', 200),
('550e8400-e29b-41d4-a716-446655440203', '双倍XP', '下一个课程获得双倍经验', 'xp_boost', 100),
('550e8400-e29b-41d4-a716-446655440204', '额外生命', '增加1个额外生命值', 'extra_heart', 500)
ON CONFLICT (id) DO NOTHING;

-- 插入示例用户（用于测试，密码为 'password123'）
INSERT INTO users (id, email, username, password_hash, native_language, learning_language, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'demo@example.com', 'demo_user', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8G', 'zh-CN', 'en', true)
ON CONFLICT (id) DO NOTHING;

-- 为示例用户插入资料和统计数据
INSERT INTO user_profiles (user_id, display_name, bio) VALUES
('550e8400-e29b-41d4-a716-446655440301', '演示用户', '这是一个演示账户，用于展示平台功能')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_stats (user_id, total_xp, current_streak, longest_streak, hearts, gems, level, lessons_completed) VALUES
('550e8400-e29b-41d4-a716-446655440301', 150, 5, 8, 5, 500, 2, 3)
ON CONFLICT (user_id) DO NOTHING;

-- 为示例用户插入课程进度
INSERT INTO user_course_progress (user_id, course_id, current_unit_id, total_xp, completion_percentage) VALUES
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 150, 15.50)
ON CONFLICT (user_id, course_id) DO NOTHING;

-- 为示例用户插入技能进度
INSERT INTO user_skill_progress (user_id, skill_id, level, xp_earned, lessons_completed, is_unlocked, strength) VALUES
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440021', 2, 50, 2, true, 0.85),
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440022', 1, 30, 1, true, 0.70),
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440023', 0, 0, 0, true, 1.00)
ON CONFLICT (user_id, skill_id) DO NOTHING;

-- 为示例用户插入成就
INSERT INTO user_achievements (user_id, achievement_id) VALUES
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440101'),
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440102'),
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440104')
ON CONFLICT (user_id, achievement_id) DO NOTHING;