/**
 * 关卡系统 (Level System)
 * 坦克大战游戏的关卡管理和游戏进度系统
 */

// 关卡类型枚举
const LevelType = {
    NORMAL: 'normal',           // 普通关卡
    BOSS: 'boss',              // Boss关卡
    SURVIVAL: 'survival',       // 生存模式
    ESCORT: 'escort',          // 护送任务
    DEFENSE: 'defense',        // 防守任务
    SPEED_RUN: 'speed_run',    // 限时挑战
    PUZZLE: 'puzzle'           // 解谜关卡
};

// 关卡难度
const LevelDifficulty = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard',
    EXPERT: 'expert',
    NIGHTMARE: 'nightmare'
};

// 关卡目标类型
const ObjectiveType = {
    DESTROY_ALL_ENEMIES: 'destroy_all_enemies',
    SURVIVE_TIME: 'survive_time',
    PROTECT_BASE: 'protect_base',
    COLLECT_ITEMS: 'collect_items',
    REACH_DESTINATION: 'reach_destination',
    DEFEAT_BOSS: 'defeat_boss',
    SCORE_TARGET: 'score_target'
};

// 关卡奖励类型
const RewardType = {
    SCORE: 'score',
    LIVES: 'lives',
    POWERUP: 'powerup',
    WEAPON_UPGRADE: 'weapon_upgrade',
    UNLOCK_LEVEL: 'unlock_level',
    UNLOCK_MODE: 'unlock_mode'
};

// 关卡数据类
class LevelData {
    constructor(id, config = {}) {
        this.id = id;
        this.name = config.name || `关卡 ${id}`;
        this.description = config.description || '';
        this.type = config.type || LevelType.NORMAL;
        this.difficulty = config.difficulty || LevelDifficulty.NORMAL;
        
        // 地图配置
        this.mapName = config.mapName || 'default';
        this.mapData = config.mapData || null;
        
        // 敌人配置
        this.enemies = config.enemies || [];
        this.enemySpawnDelay = config.enemySpawnDelay || 2000;
        this.maxSimultaneousEnemies = config.maxSimultaneousEnemies || 4;
        
        // 关卡目标
        this.objectives = config.objectives || [];
        this.primaryObjective = config.primaryObjective || null;
        this.secondaryObjectives = config.secondaryObjectives || [];
        
        // 时间限制
        this.timeLimit = config.timeLimit || 0; // 0表示无限制
        this.timeBonusThreshold = config.timeBonusThreshold || 0;
        
        // 奖励配置
        this.rewards = config.rewards || [];
        this.completionRewards = config.completionRewards || [];
        this.perfectRewards = config.perfectRewards || [];
        
        // 解锁条件
        this.unlockConditions = config.unlockConditions || [];
        this.isUnlocked = config.isUnlocked || false;
        
        // 统计数据
        this.bestScore = 0;
        this.bestTime = Infinity;
        this.completionCount = 0;
        this.perfectCount = 0;
        this.lastPlayed = null;
        
        // 关卡状态
        this.isCompleted = false;
        this.isPerfect = false;
        this.stars = 0; // 0-3星评级
    }

    // 添加敌人配置
    addEnemy(enemyType, count = 1, spawnDelay = 0, spawnPattern = 'random') {
        this.enemies.push({
            type: enemyType,
            count: count,
            spawnDelay: spawnDelay,
            spawnPattern: spawnPattern,
            spawned: 0
        });
    }

    // 添加目标
    addObjective(type, target, description = '') {
        const objective = {
            id: this.objectives.length,
            type: type,
            target: target,
            current: 0,
            description: description,
            completed: false,
            required: true
        };
        
        this.objectives.push(objective);
        return objective;
    }

    // 添加奖励
    addReward(type, value, condition = 'completion') {
        const reward = {
            type: type,
            value: value,
            condition: condition, // completion, perfect, time_bonus
            claimed: false
        };
        
        this.rewards.push(reward);
        return reward;
    }

    // 检查解锁条件
    checkUnlockConditions(gameProgress) {
        if (this.isUnlocked) return true;
        
        for (const condition of this.unlockConditions) {
            if (!this.evaluateCondition(condition, gameProgress)) {
                return false;
            }
        }
        
        this.isUnlocked = true;
        return true;
    }

    // 评估条件
    evaluateCondition(condition, gameProgress) {
        switch (condition.type) {
            case 'level_completed':
                return gameProgress.completedLevels.includes(condition.levelId);
            case 'total_score':
                return gameProgress.totalScore >= condition.score;
            case 'levels_completed':
                return gameProgress.completedLevels.length >= condition.count;
            case 'perfect_levels':
                return gameProgress.perfectLevels.length >= condition.count;
            default:
                return true;
        }
    }

    // 更新统计数据
    updateStats(score, time, objectives) {
        this.lastPlayed = Date.now();
        this.completionCount++;
        
        if (score > this.bestScore) {
            this.bestScore = score;
        }
        
        if (time < this.bestTime) {
            this.bestTime = time;
        }
        
        // 检查是否完美完成
        const allObjectivesCompleted = objectives.every(obj => obj.completed);
        const timeBonus = this.timeLimit > 0 && time <= this.timeBonusThreshold;
        
        if (allObjectivesCompleted && timeBonus) {
            this.isPerfect = true;
            this.perfectCount++;
        }
        
        this.isCompleted = true;
        this.calculateStars(score, time, objectives);
    }

    // 计算星级评价
    calculateStars(score, time, objectives) {
        let stars = 1; // 基础完成1星
        
        // 完成所有目标+1星
        if (objectives.every(obj => obj.completed)) {
            stars++;
        }
        
        // 时间奖励+1星
        if (this.timeLimit > 0 && time <= this.timeBonusThreshold) {
            stars++;
        }
        
        this.stars = Math.max(this.stars, stars);
    }

    // 获取关卡进度
    getProgress() {
        const totalObjectives = this.objectives.length;
        const completedObjectives = this.objectives.filter(obj => obj.completed).length;
        
        return {
            objectiveProgress: totalObjectives > 0 ? completedObjectives / totalObjectives : 0,
            isCompleted: this.isCompleted,
            isPerfect: this.isPerfect,
            stars: this.stars,
            bestScore: this.bestScore,
            bestTime: this.bestTime,
            completionCount: this.completionCount
        };
    }

    // 导出数据
    exportData() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            difficulty: this.difficulty,
            mapName: this.mapName,
            enemies: this.enemies,
            objectives: this.objectives,
            rewards: this.rewards,
            isUnlocked: this.isUnlocked,
            isCompleted: this.isCompleted,
            isPerfect: this.isPerfect,
            stars: this.stars,
            bestScore: this.bestScore,
            bestTime: this.bestTime,
            completionCount: this.completionCount,
            perfectCount: this.perfectCount
        };
    }
}

// 关卡管理器
class LevelManager {
    constructor() {
        this.levels = new Map();
        this.currentLevel = null;
        this.currentLevelId = 1;
        
        // 游戏进度
        this.gameProgress = {
            currentLevel: 1,
            maxUnlockedLevel: 1,
            completedLevels: [],
            perfectLevels: [],
            totalScore: 0,
            totalPlayTime: 0,
            achievements: []
        };
        
        // 关卡生成器
        this.levelGenerator = new LevelGenerator();
        
        // 初始化默认关卡
        this.initializeDefaultLevels();
        this.loadProgress();
    }

    // 初始化默认关卡
    initializeDefaultLevels() {
        // 关卡1-5：新手教程
        for (let i = 1; i <= 5; i++) {
            const level = new LevelData(i, {
                name: `新手关卡 ${i}`,
                description: `学习基础操作的关卡`,
                difficulty: LevelDifficulty.EASY,
                mapName: `tutorial_${i}`,
                timeLimit: 180000, // 3分钟
                timeBonusThreshold: 120000 // 2分钟内完成有奖励
            });
            
            // 添加敌人
            level.addEnemy('ENEMY_BASIC', Math.min(3 + i, 8));
            
            // 添加目标
            level.addObjective(ObjectiveType.DESTROY_ALL_ENEMIES, level.enemies[0].count, '消灭所有敌人');
            
            // 添加奖励
            level.addReward(RewardType.SCORE, 1000 * i);
            if (i === 5) {
                level.addReward(RewardType.UNLOCK_LEVEL, 6);
            }
            
            // 第一关默认解锁
            if (i === 1) {
                level.isUnlocked = true;
            } else {
                level.unlockConditions.push({
                    type: 'level_completed',
                    levelId: i - 1
                });
            }
            
            this.levels.set(i, level);
        }
        
        // 关卡6-10：基础挑战
        for (let i = 6; i <= 10; i++) {
            const level = new LevelData(i, {
                name: `挑战关卡 ${i - 5}`,
                description: `更具挑战性的关卡`,
                difficulty: LevelDifficulty.NORMAL,
                mapName: `challenge_${i - 5}`,
                timeLimit: 240000, // 4分钟
                timeBonusThreshold: 180000
            });
            
            // 混合敌人类型
            level.addEnemy('ENEMY_BASIC', 5);
            level.addEnemy('ENEMY_FAST', 3);
            if (i >= 8) {
                level.addEnemy('ENEMY_HEAVY', 2);
            }
            
            // 多个目标
            level.addObjective(ObjectiveType.DESTROY_ALL_ENEMIES, 
                level.enemies.reduce((sum, enemy) => sum + enemy.count, 0), '消灭所有敌人');
            level.addObjective(ObjectiveType.SURVIVE_TIME, 120000, '生存2分钟');
            
            // 奖励
            level.addReward(RewardType.SCORE, 2000 * (i - 5));
            level.addReward(RewardType.POWERUP, 'random', 'perfect');
            
            level.unlockConditions.push({
                type: 'level_completed',
                levelId: i - 1
            });
            
            this.levels.set(i, level);
        }
        
        // 关卡11-15：困难关卡
        for (let i = 11; i <= 15; i++) {
            const level = new LevelData(i, {
                name: `困难关卡 ${i - 10}`,
                description: `高难度挑战关卡`,
                difficulty: LevelDifficulty.HARD,
                mapName: `hard_${i - 10}`,
                timeLimit: 300000, // 5分钟
                timeBonusThreshold: 240000
            });
            
            // 大量敌人
            level.addEnemy('ENEMY_BASIC', 8);
            level.addEnemy('ENEMY_FAST', 5);
            level.addEnemy('ENEMY_HEAVY', 4);
            
            // 复杂目标
            level.addObjective(ObjectiveType.DESTROY_ALL_ENEMIES, 
                level.enemies.reduce((sum, enemy) => sum + enemy.count, 0), '消灭所有敌人');
            level.addObjective(ObjectiveType.SCORE_TARGET, 10000 * (i - 10), `达到${10000 * (i - 10)}分`);
            
            // 丰厚奖励
            level.addReward(RewardType.SCORE, 5000 * (i - 10));
            level.addReward(RewardType.LIVES, 1, 'perfect');
            
            level.unlockConditions.push({
                type: 'level_completed',
                levelId: i - 1
            });
            
            this.levels.set(i, level);
        }
        
        // Boss关卡
        const bossLevel = new LevelData(16, {
            name: 'Boss挑战',
            description: '面对强大的Boss敌人',
            type: LevelType.BOSS,
            difficulty: LevelDifficulty.EXPERT,
            mapName: 'boss_arena',
            timeLimit: 600000, // 10分钟
            timeBonusThreshold: 480000
        });
        
        bossLevel.addEnemy('ENEMY_BOSS', 1);
        bossLevel.addEnemy('ENEMY_HEAVY', 4);
        bossLevel.addObjective(ObjectiveType.DEFEAT_BOSS, 1, '击败Boss');
        bossLevel.addReward(RewardType.SCORE, 50000);
        bossLevel.addReward(RewardType.UNLOCK_MODE, 'survival');
        
        bossLevel.unlockConditions.push({
            type: 'levels_completed',
            count: 15
        });
        
        this.levels.set(16, bossLevel);
        
        console.log(`📚 初始化了${this.levels.size}个关卡`);
    }

    // 加载关卡
    loadLevel(levelId) {
        const level = this.levels.get(levelId);
        if (!level) {
            console.error(`❌ 关卡${levelId}不存在`);
            return null;
        }
        
        if (!level.isUnlocked) {
            console.error(`🔒 关卡${levelId}未解锁`);
            return null;
        }
        
        this.currentLevel = level;
        this.currentLevelId = levelId;
        
        console.log(`📖 加载关卡: ${level.name}`);
        return level;
    }

    // 开始关卡
    startLevel(levelId) {
        const level = this.loadLevel(levelId);
        if (!level) return false;
        
        // 重置关卡状态
        level.objectives.forEach(obj => {
            obj.current = 0;
            obj.completed = false;
        });
        
        level.enemies.forEach(enemy => {
            enemy.spawned = 0;
        });
        
        // 更新游戏进度
        this.gameProgress.currentLevel = levelId;
        
        console.log(`🎯 开始关卡${levelId}: ${level.name}`);
        return true;
    }

    // 完成关卡
    completeLevel(score, time, objectives) {
        if (!this.currentLevel) return false;
        
        const level = this.currentLevel;
        
        // 更新关卡统计
        level.updateStats(score, time, objectives);
        
        // 更新游戏进度
        if (!this.gameProgress.completedLevels.includes(level.id)) {
            this.gameProgress.completedLevels.push(level.id);
        }
        
        if (level.isPerfect && !this.gameProgress.perfectLevels.includes(level.id)) {
            this.gameProgress.perfectLevels.push(level.id);
        }
        
        this.gameProgress.totalScore += score;
        this.gameProgress.maxUnlockedLevel = Math.max(
            this.gameProgress.maxUnlockedLevel, 
            level.id + 1
        );
        
        // 解锁下一关卡
        this.unlockNextLevels();
        
        // 保存进度
        this.saveProgress();
        
        console.log(`🎉 完成关卡${level.id}: ${level.stars}星`);
        return true;
    }

    // 解锁下一关卡
    unlockNextLevels() {
        for (const [id, level] of this.levels) {
            if (!level.isUnlocked) {
                level.checkUnlockConditions(this.gameProgress);
            }
        }
    }

    // 获取关卡列表
    getLevelList(includeUnlocked = false) {
        const levels = [];
        
        for (const [id, level] of this.levels) {
            if (includeUnlocked || level.isUnlocked) {
                levels.push({
                    id: id,
                    name: level.name,
                    description: level.description,
                    type: level.type,
                    difficulty: level.difficulty,
                    isUnlocked: level.isUnlocked,
                    isCompleted: level.isCompleted,
                    isPerfect: level.isPerfect,
                    stars: level.stars,
                    bestScore: level.bestScore
                });
            }
        }
        
        return levels.sort((a, b) => a.id - b.id);
    }

    // 获取关卡进度统计
    getProgressStats() {
        const totalLevels = this.levels.size;
        const unlockedLevels = Array.from(this.levels.values()).filter(l => l.isUnlocked).length;
        const completedLevels = this.gameProgress.completedLevels.length;
        const perfectLevels = this.gameProgress.perfectLevels.length;
        const totalStars = Array.from(this.levels.values()).reduce((sum, level) => sum + level.stars, 0);
        const maxStars = totalLevels * 3;
        
        return {
            totalLevels,
            unlockedLevels,
            completedLevels,
            perfectLevels,
            totalStars,
            maxStars,
            completionRate: totalLevels > 0 ? completedLevels / totalLevels : 0,
            perfectRate: totalLevels > 0 ? perfectLevels / totalLevels : 0,
            starRate: maxStars > 0 ? totalStars / maxStars : 0,
            totalScore: this.gameProgress.totalScore,
            currentLevel: this.gameProgress.currentLevel,
            maxUnlockedLevel: this.gameProgress.maxUnlockedLevel
        };
    }

    // 更新关卡目标
    updateObjective(objectiveId, progress) {
        if (!this.currentLevel) return false;
        
        const objective = this.currentLevel.objectives.find(obj => obj.id === objectiveId);
        if (!objective) return false;
        
        objective.current = Math.max(objective.current, progress);
        
        if (objective.current >= objective.target) {
            objective.completed = true;
            console.log(`✅ 目标完成: ${objective.description}`);
        }
        
        return objective.completed;
    }

    // 检查关卡完成条件
    checkLevelComplete() {
        if (!this.currentLevel) return false;
        
        // 检查主要目标
        const primaryObjectives = this.currentLevel.objectives.filter(obj => obj.required);
        return primaryObjectives.every(obj => obj.completed);
    }

    // 获取当前关卡状态
    getCurrentLevelStatus() {
        if (!this.currentLevel) return null;
        
        const level = this.currentLevel;
        const totalEnemies = level.enemies.reduce((sum, enemy) => sum + enemy.count, 0);
        const spawnedEnemies = level.enemies.reduce((sum, enemy) => sum + enemy.spawned, 0);
        
        return {
            id: level.id,
            name: level.name,
            type: level.type,
            difficulty: level.difficulty,
            objectives: level.objectives.map(obj => ({
                id: obj.id,
                description: obj.description,
                current: obj.current,
                target: obj.target,
                completed: obj.completed,
                progress: obj.target > 0 ? obj.current / obj.target : 0
            })),
            enemies: {
                total: totalEnemies,
                spawned: spawnedEnemies,
                remaining: totalEnemies - spawnedEnemies
            },
            timeLimit: level.timeLimit,
            isComplete: this.checkLevelComplete()
        };
    }

    // 保存进度
    saveProgress() {
        try {
            const saveData = {
                gameProgress: this.gameProgress,
                levelStats: {}
            };
            
            // 保存关卡统计
            for (const [id, level] of this.levels) {
                saveData.levelStats[id] = {
                    isUnlocked: level.isUnlocked,
                    isCompleted: level.isCompleted,
                    isPerfect: level.isPerfect,
                    stars: level.stars,
                    bestScore: level.bestScore,
                    bestTime: level.bestTime,
                    completionCount: level.completionCount,
                    perfectCount: level.perfectCount
                };
            }
            
            localStorage.setItem('tankBattle_levelProgress', JSON.stringify(saveData));
            console.log('💾 关卡进度已保存');
        } catch (e) {
            console.warn('⚠️ 无法保存关卡进度:', e);
        }
    }

    // 加载进度
    loadProgress() {
        try {
            const saveData = JSON.parse(localStorage.getItem('tankBattle_levelProgress') || '{}');
            
            if (saveData.gameProgress) {
                Object.assign(this.gameProgress, saveData.gameProgress);
            }
            
            if (saveData.levelStats) {
                for (const [id, stats] of Object.entries(saveData.levelStats)) {
                    const level = this.levels.get(parseInt(id));
                    if (level) {
                        Object.assign(level, stats);
                    }
                }
            }
            
            console.log('📂 关卡进度已加载');
        } catch (e) {
            console.warn('⚠️ 无法加载关卡进度:', e);
        }
    }

    // 重置进度
    resetProgress() {
        this.gameProgress = {
            currentLevel: 1,
            maxUnlockedLevel: 1,
            completedLevels: [],
            perfectLevels: [],
            totalScore: 0,
            totalPlayTime: 0,
            achievements: []
        };
        
        // 重置所有关卡
        for (const [id, level] of this.levels) {
            level.isUnlocked = (id === 1);
            level.isCompleted = false;
            level.isPerfect = false;
            level.stars = 0;
            level.bestScore = 0;
            level.bestTime = Infinity;
            level.completionCount = 0;
            level.perfectCount = 0;
        }
        
        this.saveProgress();
        console.log('🔄 关卡进度已重置');
    }
}

// 关卡生成器
class LevelGenerator {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
    }

    // 初始化关卡模板
    initializeTemplates() {
        // 基础模板
        this.templates.set('basic', {
            enemyTypes: ['ENEMY_BASIC'],
            enemyCount: [3, 8],
            objectives: [ObjectiveType.DESTROY_ALL_ENEMIES],
            timeLimit: [120000, 300000]
        });
        
        // 混合模板
        this.templates.set('mixed', {
            enemyTypes: ['ENEMY_BASIC', 'ENEMY_FAST', 'ENEMY_HEAVY'],
            enemyCount: [5, 15],
            objectives: [ObjectiveType.DESTROY_ALL_ENEMIES, ObjectiveType.SURVIVE_TIME],
            timeLimit: [180000, 420000]
        });
        
        // 生存模板
        this.templates.set('survival', {
            enemyTypes: ['ENEMY_BASIC', 'ENEMY_FAST'],
            enemyCount: [20, 50],
            objectives: [ObjectiveType.SURVIVE_TIME],
            timeLimit: [300000, 600000],
            continuousSpawn: true
        });
    }

    // 生成随机关卡
    generateLevel(id, template = 'basic', difficulty = LevelDifficulty.NORMAL) {
        const templateData = this.templates.get(template);
        if (!templateData) return null;
        
        const level = new LevelData(id, {
            name: `生成关卡 ${id}`,
            description: `随机生成的${template}类型关卡`,
            difficulty: difficulty,
            mapName: 'generated'
        });
        
        // 根据难度调整参数
        const difficultyMultiplier = this.getDifficultyMultiplier(difficulty);
        
        // 添加敌人
        for (const enemyType of templateData.enemyTypes) {
            const baseCount = Math.floor(Math.random() * 
                (templateData.enemyCount[1] - templateData.enemyCount[0])) + templateData.enemyCount[0];
            const count = Math.floor(baseCount * difficultyMultiplier);
            
            if (count > 0) {
                level.addEnemy(enemyType, count);
            }
        }
        
        // 添加目标
        for (const objectiveType of templateData.objectives) {
            switch (objectiveType) {
                case ObjectiveType.DESTROY_ALL_ENEMIES:
                    const totalEnemies = level.enemies.reduce((sum, enemy) => sum + enemy.count, 0);
                    level.addObjective(objectiveType, totalEnemies, '消灭所有敌人');
                    break;
                case ObjectiveType.SURVIVE_TIME:
                    const surviveTime = Math.floor(Math.random() * 
                        (templateData.timeLimit[1] - templateData.timeLimit[0])) + templateData.timeLimit[0];
                    level.addObjective(objectiveType, surviveTime, `生存${Math.floor(surviveTime/1000)}秒`);
                    break;
            }
        }
        
        // 设置时间限制
        if (templateData.timeLimit) {
            level.timeLimit = Math.floor(Math.random() * 
                (templateData.timeLimit[1] - templateData.timeLimit[0])) + templateData.timeLimit[0];
            level.timeBonusThreshold = level.timeLimit * 0.7;
        }
        
        return level;
    }

    // 获取难度倍数
    getDifficultyMultiplier(difficulty) {
        switch (difficulty) {
            case LevelDifficulty.EASY: return 0.7;
            case LevelDifficulty.NORMAL: return 1.0;
            case LevelDifficulty.HARD: return 1.5;
            case LevelDifficulty.EXPERT: return 2.0;
            case LevelDifficulty.NIGHTMARE: return 3.0;
            default: return 1.0;
        }
    }
}

// 导出关卡系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LevelType,
        LevelDifficulty,
        ObjectiveType,
        RewardType,
        LevelData,
        LevelManager,
        LevelGenerator
    };
} else {
    // 浏览器环境
    window.LevelSystem = {
        LevelType,
        LevelDifficulty,
        ObjectiveType,
        RewardType,
        LevelData,
        LevelManager,
        LevelGenerator
    };
}