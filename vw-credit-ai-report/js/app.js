// Vue 3 应用

const { createApp } = Vue;

createApp({
    data() {
        return {
            loading: true,
            isPrinting: false,
            selectedCase: 'case1',
            showQuestions: false,
            
            // 报告数据
            reportDate: '',
            reportNumber: '',
            customer: {},
            riskAssessment: {},
            keyIndicators: {},
            ragSummary: {},
            aiRecommendations: {},
            recommendation: {},
            riskAlerts: {},
            decisionBasis: {},
            
            // 图表实例
            radarChart: null
        };
    },
    
    mounted() {
        // 初始化
        this.initReport();
    },
    
    methods: {
        // 初始化报告
        initReport() {
            // 设置报告日期和编号
            const now = new Date();
            this.reportDate = now.toLocaleDateString('zh-CN');
            this.reportNumber = `CA${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
            
            // 加载案例数据
            this.loadCase();
        },
        
        // 加载案例数据
        loadCase() {
            this.loading = true;
            
            // 模拟加载延迟
            setTimeout(() => {
                const caseData = window.mockCases[this.selectedCase];
                
                if (caseData) {
                    this.customer = caseData.customer;
                    this.riskAssessment = caseData.riskAssessment;
                    this.keyIndicators = caseData.keyIndicators;
                    this.ragSummary = caseData.ragSummary;
                    this.aiRecommendations = caseData.aiRecommendations;
                    this.recommendation = caseData.recommendation;
                    this.riskAlerts = caseData.riskAlerts;
                    this.decisionBasis = caseData.decisionBasis;
                    
                    this.loading = false;
                    
                    // 等待DOM更新后创建图表
                    this.$nextTick(() => {
                        this.createCharts();
                    });
                }
            }, 800);
        },
        
        // 创建图表
        createCharts() {
            // 销毁旧图表
            if (this.radarChart) {
                this.radarChart.dispose();
            }
            
            // 创建雷达图
            this.radarChart = window.createRiskRadar('riskRadar', this.riskAssessment.dimensions);
        },
        
        // 格式化数字
        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        
        // 获取风险等级文本
        getRiskLevelText(level) {
            const levelMap = {
                'A': '优质客户',
                'B': '良好客户',
                'C': '一般客户',
                'D': '关注客户',
                'E': '拒绝客户'
            };
            return levelMap[level] || level;
        },
        
        // 获取决策文本
        getDecisionText(decision) {
            const decisionMap = {
                'approve': '✅ 批准',
                'conditional': '⚠️ 有条件批准',
                'reject': '❌ 拒绝'
            };
            return decisionMap[decision] || decision;
        },
        
        // 获取指标样式类
        getIndicatorClass(type, value) {
            if (type === 'dsr') {
                if (value <= 40) return 'good';
                if (value <= 60) return 'warning';
                return 'danger';
            }
            if (type === 'ltv') {
                if (value <= 70) return 'good';
                if (value <= 85) return 'warning';
                return 'danger';
            }
            return 'good';
        },
        
        // 切换问题显示
        toggleQuestions() {
            this.showQuestions = !this.showQuestions;
        },
        
        // 打印报告
        printReport() {
            this.isPrinting = true;
            setTimeout(() => {
                window.printReport();
                this.isPrinting = false;
            }, 100);
        },
        
        // 导出PDF
        async exportPDF() {
            await window.exportToPDF();
        }
    },
    
    // 监听打印事件
    beforeMount() {
        window.addEventListener('beforeprint', () => {
            this.isPrinting = true;
        });
        
        window.addEventListener('afterprint', () => {
            this.isPrinting = false;
        });
    }
}).mount('#app');
