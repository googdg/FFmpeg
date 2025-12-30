// ECharts 图表配置

// 创建风险雷达图
function createRiskRadar(elementId, dimensions) {
    const chart = echarts.init(document.getElementById(elementId));
    
    const option = {
        radar: {
            indicator: [
                { name: '还款能力', max: 100 },
                { name: '信用历史', max: 100 },
                { name: '负债情况', max: 100 },
                { name: '稳定性', max: 100 },
                { name: '其他因素', max: 100 }
            ],
            radius: '65%',
            splitNumber: 4,
            axisName: {
                color: '#666',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            splitArea: {
                areaStyle: {
                    color: ['#f5f5f5', '#fafafa']
                }
            }
        },
        series: [{
            type: 'radar',
            data: [{
                value: [
                    dimensions.repaymentAbility,
                    dimensions.creditHistory,
                    dimensions.debtLevel,
                    dimensions.stability,
                    dimensions.other
                ],
                name: '风险评估',
                areaStyle: {
                    color: 'rgba(0, 176, 240, 0.3)'
                },
                lineStyle: {
                    color: '#00b0f0',
                    width: 2
                },
                itemStyle: {
                    color: '#00b0f0'
                }
            }]
        }]
    };
    
    chart.setOption(option);
    
    // 响应式
    window.addEventListener('resize', () => {
        chart.resize();
    });
    
    return chart;
}

// 导出函数
window.createRiskRadar = createRiskRadar;
