// PDF导出功能

async function exportToPDF() {
    const reportContent = document.getElementById('report-content');
    
    try {
        // 显示加载提示
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>正在生成PDF，请稍候...</p>
        `;
        document.body.appendChild(loadingDiv);
        
        // 使用html2canvas截图
        const canvas = await html2canvas(reportContent, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // 创建PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = 210; // A4宽度
        const pageHeight = 297; // A4高度
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // 添加第一页
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // 如果内容超过一页，添加更多页
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // 生成文件名
        const reportNumber = document.querySelector('.report-meta p:last-child strong + span').textContent;
        const fileName = `VW_信审报告_${reportNumber}.pdf`;
        
        // 保存PDF
        pdf.save(fileName);
        
        // 移除加载提示
        document.body.removeChild(loadingDiv);
        
        // 显示成功提示
        alert('PDF导出成功！');
        
    } catch (error) {
        console.error('PDF导出失败:', error);
        alert('PDF导出失败，请重试');
        
        // 移除加载提示
        const loadingDiv = document.querySelector('.loading-overlay');
        if (loadingDiv) {
            document.body.removeChild(loadingDiv);
        }
    }
}

// 打印功能
function printReport() {
    window.print();
}

// 导出函数
window.exportToPDF = exportToPDF;
window.printReport = printReport;
