// 模拟数据 - 5个不同风险等级的案例

const mockCases = {
    case1: {
        customer: {
            name: "张**",
            gender: "男",
            age: 35,
            product: "新车贷款",
            amount: 300000,
            term: 36,
            vehicle: "大众途观L 2024款 380TSI"
        },
        riskAssessment: {
            score: 850,
            level: "A",
            dimensions: {
                repaymentAbility: 90,
                creditHistory: 95,
                debtLevel: 85,
                stability: 88,
                other: 87
            }
        },
        keyIndicators: {
            dsr: 28,
            ltv: 65,
            monthlyIncome: 35000,
            creditScore: 780,
            overdueCount: 0
        },
        ragSummary: {
            financial: "企业营收稳定增长，近三年年均增长率15%，现金流充裕，资产负债率健康",
            thirdParty: "征信记录优秀，无逾期记录，社保公积金连续缴纳60个月，收入稳定可靠",
            sentiment: "未发现负面新闻，所在行业发展稳定，企业信誉良好，无司法诉讼记录"
        },
        aiRecommendations: {
            directions: [
                {
                    priority: 1,
                    text: "客户资质优秀，建议快速审批通过，可作为优质客户重点维护"
                },
                {
                    priority: 2,
                    text: "收入稳定且负债率低，建议提供优惠利率以增强客户粘性"
                },
                {
                    priority: 3,
                    text: "可推荐其他金融产品，如信用卡、理财等增值服务"
                }
            ],
            questions: [
                {
                    category: "购车计划",
                    question: "请问您选择这款车型的主要考虑因素是什么？",
                    priority: 3
                },
                {
                    category: "还款计划",
                    question: "您计划使用哪个账户进行月供还款？",
                    priority: 3
                },
                {
                    category: "增值服务",
                    question: "是否需要了解我们的车辆保险和延保服务？",
                    priority: 3
                }
            ]
        },
        recommendation: {
            decision: "approve",
            loanAmountMin: 300000,
            loanAmountMax: 350000,
            interestRateMin: 3.5,
            interestRateMax: 4.0,
            defaultProbability: 0.3,
            conditions: []
        },
        riskAlerts: {
            high: [],
            medium: [],
            low: [
                "建议定期跟进客户还款情况",
                "可推荐增值服务提升客户价值"
            ]
        },
        decisionBasis: {
            dataSources: ["CRM系统", "人行征信", "社保公积金", "银行流水", "车辆评估系统"],
            modelVersion: "v2.1.0",
            confidence: 96
        }
    },
    
    case2: {
        customer: {
            name: "李**",
            gender: "女",
            age: 32,
            product: "新车贷款",
            amount: 250000,
            term: 36,
            vehicle: "大众帕萨特 2024款 330TSI"
        },
        riskAssessment: {
            score: 720,
            level: "B",
            dimensions: {
                repaymentAbility: 75,
                creditHistory: 80,
                debtLevel: 65,
                stability: 72,
                other: 70
            }
        },
        keyIndicators: {
            dsr: 42,
            ltv: 75,
            monthlyIncome: 22000,
            creditScore: 690,
            overdueCount: 0
        },
        ragSummary: {
            financial: "企业经营稳定，营收略有波动但整体向好，现金流基本满足需求",
            thirdParty: "征信记录良好，无逾期，社保公积金连续缴纳36个月，收入来源稳定",
            sentiment: "未发现重大负面信息，行业发展平稳，企业运营正常"
        },
        aiRecommendations: {
            directions: [
                {
                    priority: 1,
                    text: "负债率偏高(42%)，需重点核实其他贷款的真实情况和月供金额"
                },
                {
                    priority: 2,
                    text: "工作年限较短(3年)，建议评估收入稳定性和职业发展前景"
                },
                {
                    priority: 3,
                    text: "首次购车，需了解购车用途和详细的还款计划"
                }
            ],
            questions: [
                {
                    category: "负债情况",
                    question: "您目前名下其他贷款的月供总额是多少？",
                    priority: 1
                },
                {
                    category: "收入来源",
                    question: "您的收入来源是否稳定？是否有其他收入来源？",
                    priority: 1
                },
                {
                    category: "还款能力",
                    question: "除了工资收入，您是否有其他资产或收入可以用于还款？",
                    priority: 2
                },
                {
                    category: "购车用途",
                    question: "请说明您的购车用途和还款计划？",
                    priority: 2
                },
                {
                    category: "职业发展",
                    question: "您目前的工作是否稳定？未来是否有晋升或加薪计划？",
                    priority: 2
                }
            ]
        },
        recommendation: {
            decision: "conditional",
            loanAmountMin: 200000,
            loanAmountMax: 250000,
            interestRateMin: 4.5,
            interestRateMax: 5.5,
            defaultProbability: 1.8,
            conditions: [
                "建议降低贷款金额至20万元，以降低月供压力",
                "需提供额外的收入证明或资产证明",
                "建议增加首付比例至40%以上"
            ]
        },
        riskAlerts: {
            high: [],
            medium: [
                "负债率偏高，需关注还款能力",
                "工作年限较短，收入稳定性需进一步确认"
            ],
            low: [
                "征信记录良好，无逾期历史",
                "社保公积金正常缴纳"
            ]
        },
        decisionBasis: {
            dataSources: ["CRM系统", "人行征信", "社保公积金", "银行流水"],
            modelVersion: "v2.1.0",
            confidence: 85
        }
    },
    
    case3: {
        customer: {
            name: "王**",
            gender: "男",
            age: 28,
            product: "二手车贷款",
            amount: 150000,
            term: 24,
            vehicle: "大众迈腾 2021款 330TSI"
        },
        riskAssessment: {
            score: 580,
            level: "C",
            dimensions: {
                repaymentAbility: 60,
                creditHistory: 65,
                debtLevel: 50,
                stability: 58,
                other: 55
            }
        },
        keyIndicators: {
            dsr: 55,
            ltv: 85,
            monthlyIncome: 15000,
            creditScore: 620,
            overdueCount: 2
        },
        ragSummary: {
            financial: "收入水平一般，存在一定波动，储蓄较少，抗风险能力有限",
            thirdParty: "征信记录一般，存在2次逾期记录(已结清)，社保缴纳18个月",
            sentiment: "未发现重大负面信息，但所在行业竞争激烈，就业稳定性一般"
        },
        aiRecommendations: {
            directions: [
                {
                    priority: 1,
                    text: "负债率过高(55%)，严重超标，需详细核实所有负债情况"
                },
                {
                    priority: 1,
                    text: "存在逾期记录，需了解逾期原因和当前还款能力改善情况"
                },
                {
                    priority: 2,
                    text: "LTV比例过高(85%)，建议要求增加首付或降低贷款金额"
                },
                {
                    priority: 3,
                    text: "工作稳定性较差，需评估职业前景和收入增长潜力"
                }
            ],
            questions: [
                {
                    category: "逾期原因",
                    question: "请详细说明您之前两次逾期的具体原因？",
                    priority: 1
                },
                {
                    category: "负债情况",
                    question: "请列出您目前所有的贷款和信用卡负债明细？",
                    priority: 1
                },
                {
                    category: "还款能力",
                    question: "您目前的月收入是否足以覆盖所有月供？",
                    priority: 1
                },
                {
                    category: "资产情况",
                    question: "您是否有房产、存款或其他资产可以作为还款保障？",
                    priority: 2
                },
                {
                    category: "担保人",
                    question: "是否可以提供有稳定收入的担保人？",
                    priority: 2
                }
            ]
        },
        recommendation: {
            decision: "conditional",
            loanAmountMin: 100000,
            loanAmountMax: 120000,
            interestRateMin: 6.0,
            interestRateMax: 7.5,
            defaultProbability: 4.2,
            conditions: [
                "必须降低贷款金额至12万元以下",
                "必须提供有效担保人或抵押物",
                "需要提供额外的收入证明和资产证明",
                "建议缩短贷款期限至18个月",
                "需要主管级别审批"
            ]
        },
        riskAlerts: {
            high: [
                "负债率严重超标(55%)，远超安全线",
                "存在逾期记录，信用风险较高"
            ],
            medium: [
                "LTV比例过高，车辆贬值风险大",
                "工作年限短，收入稳定性存疑",
                "储蓄不足，抗风险能力弱"
            ],
            low: []
        },
        decisionBasis: {
            dataSources: ["CRM系统", "人行征信", "社保公积金"],
            modelVersion: "v2.1.0",
            confidence: 78
        }
    },
    
    case4: {
        customer: {
            name: "赵**",
            gender: "男",
            age: 45,
            product: "新车贷款",
            amount: 400000,
            term: 48,
            vehicle: "大众途锐 2024款 3.0TSI"
        },
        riskAssessment: {
            score: 420,
            level: "D",
            dimensions: {
                repaymentAbility: 45,
                creditHistory: 40,
                debtLevel: 35,
                stability: 50,
                other: 42
            }
        },
        keyIndicators: {
            dsr: 68,
            ltv: 90,
            monthlyIncome: 18000,
            creditScore: 550,
            overdueCount: 5
        },
        ragSummary: {
            financial: "收入不稳定，存在明显下降趋势，负债沉重，现金流紧张",
            thirdParty: "征信记录较差，多次逾期(5次)，部分逾期未结清，社保断缴",
            sentiment: "发现多条负面信息，涉及民事诉讼，所在企业经营困难"
        },
        aiRecommendations: {
            directions: [
                {
                    priority: 1,
                    text: "多次逾期且部分未结清，信用风险极高，强烈建议拒绝"
                },
                {
                    priority: 1,
                    text: "负债率严重超标(68%)，已无还款能力，违约风险极大"
                },
                {
                    priority: 1,
                    text: "存在民事诉讼，法律风险高，可能影响还款"
                },
                {
                    priority: 2,
                    text: "申请金额与收入严重不匹配，存在欺诈嫌疑"
                },
                {
                    priority: 2,
                    text: "社保断缴，就业状况不明，收入来源存疑"
                }
            ],
            questions: [
                {
                    category: "逾期情况",
                    question: "请说明您目前未结清的逾期贷款情况？",
                    priority: 1
                },
                {
                    category: "诉讼情况",
                    question: "请说明您目前涉及的民事诉讼详情？",
                    priority: 1
                },
                {
                    category: "收入来源",
                    question: "您目前的真实收入来源是什么？为何社保断缴？",
                    priority: 1
                },
                {
                    category: "购车目的",
                    question: "以您目前的收入状况，为何要购买如此高价的车辆？",
                    priority: 1
                }
            ]
        },
        recommendation: {
            decision: "reject",
            loanAmountMin: 0,
            loanAmountMax: 0,
            interestRateMin: 0,
            interestRateMax: 0,
            defaultProbability: 8.5,
            conditions: [
                "建议拒绝本次申请",
                "如客户坚持申请，需提供充足抵押物",
                "需要企业法人或高净值人士担保",
                "必须先结清所有逾期款项"
            ]
        },
        riskAlerts: {
            high: [
                "多次逾期且部分未结清，违约风险极高",
                "负债率68%，严重超标，无还款能力",
                "存在民事诉讼，法律风险高",
                "社保断缴，就业状况不明",
                "申请金额与收入严重不匹配"
            ],
            medium: [
                "LTV比例过高(90%)，抵押物不足",
                "年龄偏大，还款期限过长"
            ],
            low: []
        },
        decisionBasis: {
            dataSources: ["CRM系统", "人行征信", "司法记录"],
            modelVersion: "v2.1.0",
            confidence: 92
        }
    },
    
    case5: {
        customer: {
            name: "刘**",
            gender: "女",
            age: 38,
            product: "新车贷款",
            amount: 350000,
            term: 36,
            vehicle: "大众途昂 2024款 380TSI"
        },
        riskAssessment: {
            score: 280,
            level: "E",
            dimensions: {
                repaymentAbility: 30,
                creditHistory: 25,
                debtLevel: 20,
                stability: 35,
                other: 28
            }
        },
        keyIndicators: {
            dsr: 85,
            ltv: 95,
            monthlyIncome: 12000,
            creditScore: 480,
            overdueCount: 12
        },
        ragSummary: {
            financial: "收入极低且不稳定，负债累累，已资不抵债，现金流断裂",
            thirdParty: "征信记录极差，长期多次逾期(12次)，多笔贷款逾期未还，被列入失信名单",
            sentiment: "发现大量负面信息，涉及多起诉讼和强制执行，企业已破产清算"
        },
        aiRecommendations: {
            directions: [
                {
                    priority: 1,
                    text: "客户已被列入失信名单，严禁放贷，立即拒绝"
                },
                {
                    priority: 1,
                    text: "负债率85%，已完全丧失还款能力，违约概率接近100%"
                },
                {
                    priority: 1,
                    text: "涉及多起诉讼和强制执行，存在严重法律风险"
                },
                {
                    priority: 1,
                    text: "疑似欺诈行为，申请金额与实际能力严重不符"
                },
                {
                    priority: 1,
                    text: "建议将客户列入黑名单，永久拒绝业务往来"
                }
            ],
            questions: []
        },
        recommendation: {
            decision: "reject",
            loanAmountMin: 0,
            loanAmountMax: 0,
            interestRateMin: 0,
            interestRateMax: 0,
            defaultProbability: 15.8,
            conditions: [
                "立即拒绝申请",
                "将客户列入黑名单",
                "上报风控部门进行欺诈调查",
                "通知相关部门注意防范"
            ]
        },
        riskAlerts: {
            high: [
                "⚠️ 客户已被列入失信名单，严禁放贷",
                "⚠️ 负债率85%，完全丧失还款能力",
                "⚠️ 长期多次逾期，信用极差",
                "⚠️ 涉及多起诉讼和强制执行",
                "⚠️ 疑似欺诈行为，需上报调查",
                "⚠️ 申请金额与收入严重不匹配",
                "⚠️ 所在企业已破产清算"
            ],
            medium: [],
            low: []
        },
        decisionBasis: {
            dataSources: ["CRM系统", "人行征信", "司法记录", "失信名单"],
            modelVersion: "v2.1.0",
            confidence: 98
        }
    }
};

// 导出数据
window.mockCases = mockCases;
