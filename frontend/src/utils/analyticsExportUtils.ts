import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

export interface AnalyticsExportData {
  menuViews: {
    total: number;
    change: number;
    data: Array<{ date: string; views: number; scans: number }>;
  };
  qrScans: {
    total: number;
    change: number;
  };
  popularItems: Array<{
    name: string;
    views: number;
    category: string;
    change: number;
  }>;
  categoryPerformance: Array<{
    name: string;
    views: number;
    items: number;
    avgRating?: number;
  }>;
  timeDistribution: Array<{
    hour: string;
    views: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
}

export interface AnalyticsExportOptions {
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange: string;
  includeDeviceStats: boolean;
  includePopularItems: boolean;
  includeTrafficPatterns: boolean;
}

// Helper function to draw enhanced chart representations
const drawSimpleChart = (
  pdf: jsPDF,
  data: any[],
  x: number,
  y: number,
  width: number,
  height: number,
  type: 'bar' | 'line' | 'pie',
  title: string,
  colors: { primary: string; secondary: string; accent: string }
) => {
  // Add safe text function locally
  const addChartText = (text: string, xPos: number, yPos: number, options?: any) => {
    try {
      const cleanText = text.toString().replace(/[^\x00-\x7F]/g, '');
      pdf.text(cleanText, xPos, yPos, options);
    } catch (error) {
      pdf.text(text.replace(/[^a-zA-Z0-9\s\-.,()%]/g, ''), xPos, yPos, options);
    }
  };
  
  // Title with background
  pdf.setFillColor(248, 250, 252);
  pdf.rect(x, y - 12, width, 15, 'F');
  pdf.setDrawColor(203, 213, 225);
  pdf.rect(x, y - 12, width, 15);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(51, 65, 85);
  addChartText(title, x + 5, y - 4);

  // Chart area with shadow effect
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x + 1, y + 1, width, height, 'F'); // Shadow
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, width, height, 'F');
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(1);
  pdf.rect(x, y, width, height);

  if (type === 'bar' && data.length > 0) {
    // Bar chart representation
    const maxValue = Math.max(...data.map(d => d.views || d.count || d.value || 0));
    const barWidth = (width - 20) / data.length;
    
    data.slice(0, 10).forEach((item, index) => {
      const value = item.views || item.count || item.value || 0;
      const barHeight = (value / maxValue) * (height - 20);
      const barX = x + 10 + index * barWidth;
      const barY = y + height - 10 - barHeight;
      
      // Draw bar
      pdf.setFillColor(59, 130, 246); // Blue color
      pdf.rect(barX, barY, barWidth - 2, barHeight, 'F');
      
      // Add gradient effect by drawing multiple bars with decreasing opacity
      for (let i = 0; i < 3; i++) {
        pdf.setFillColor(59 + i * 20, 130 + i * 10, 246 - i * 20);
        pdf.rect(barX + i, barY + i, barWidth - 2 - i * 2, barHeight - i, 'F');
      }
      
      // Add value label with better positioning
      if (barWidth > 12 && value > 0) {
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        const label = value > 1000 ? `${(value/1000).toFixed(1)}k` : value.toString();
        const labelWidth = pdf.getTextWidth(label) * 7 / 12;
        addChartText(label, barX + (barWidth - labelWidth) / 2, barY + Math.max(barHeight / 2 + 2, 10));
      }
      
      // Add item name below bar if it's popular items chart
      if (item.name && barWidth > 8) {
        pdf.setFontSize(6);
        pdf.setTextColor(75, 85, 99);
        const itemName = item.name.substring(0, Math.floor(barWidth / 2));
        addChartText(itemName, barX + 1, y + height + 8);
      }
    });
  } else if (type === 'line' && data.length > 0) {
    // Line chart representation
    const maxValue = Math.max(...data.map(d => d.views || d.value || 0));
    const points: Array<{x: number, y: number}> = [];
    
    data.forEach((item, index) => {
      const value = item.views || item.value || 0;
      const pointX = x + 10 + (index / (data.length - 1)) * (width - 20);
      const pointY = y + height - 10 - ((value / maxValue) * (height - 20));
      points.push({ x: pointX, y: pointY });
    });
    
    // Draw area under the line (gradient effect)
    if (points.length > 1) {
      // Create area path
      let pathPoints = points.concat([{ x: points[points.length - 1].x, y: y + height - 10 }, { x: points[0].x, y: y + height - 10 }]);
      
      // Fill area with light blue
      pdf.setFillColor(219, 234, 254);
      // Simple polygon approximation
      for (let i = 0; i < pathPoints.length - 1; i++) {
        pdf.line(pathPoints[i].x, pathPoints[i].y, pathPoints[i + 1].x, pathPoints[i + 1].y);
      }
    }
    
    // Draw line with shadow effect
    pdf.setDrawColor(100, 116, 139);
    pdf.setLineWidth(1);
    for (let i = 1; i < points.length; i++) {
      pdf.line(points[i-1].x + 0.5, points[i-1].y + 0.5, points[i].x + 0.5, points[i].y + 0.5);
    }
    
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(2);
    for (let i = 1; i < points.length; i++) {
      pdf.line(points[i-1].x, points[i-1].y, points[i].x, points[i].y);
    }
    
    // Draw points with gradient effect
    points.forEach((point, index) => {
      pdf.setFillColor(255, 255, 255);
      pdf.circle(point.x, point.y, 2, 'F');
      pdf.setFillColor(59, 130, 246);
      pdf.circle(point.x, point.y, 1.5, 'F');
      
      // Add value labels at key points
      if (index % Math.ceil(points.length / 5) === 0) {
        const value = data[index]?.views || data[index]?.value || 0;
        pdf.setFontSize(6);
        pdf.setTextColor(75, 85, 99);
        addChartText(value.toString(), point.x - 3, point.y - 5);
      }
    });
  } else if (type === 'pie' && data.length > 0) {
    // Simple pie chart representation using rectangles as legend
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 3;
    
    // Draw circle outline
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.circle(centerX, centerY, radius);
    
    const colors = [
      [59, 130, 246],   // Blue
      [16, 185, 129],   // Green  
      [245, 158, 11],   // Orange
      [239, 68, 68],    // Red
      [139, 92, 246],   // Purple
      [6, 182, 212]     // Cyan
    ];
    
    // Draw legend
    let legendY = y + 10;
    data.forEach((item, index) => {
      if (index < colors.length) {
        const color = colors[index];
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(x + width - 40, legendY, 8, 6, 'F');
        
        pdf.setFontSize(8);
        pdf.setTextColor(75, 85, 99);
        pdf.setFont('helvetica', 'normal');
        const label = `${item.device || item.name || `Item ${index + 1}`}`;
        const percentage = item.percentage ? ` (${item.percentage}%)` : '';
        addChartText(`${label}${percentage}`, x + width - 28, legendY + 4);
        legendY += 12;
      }
    });
  }
};

// Export analytics to PDF with charts and visualizations
export const exportAnalyticsToPDF = async (
  data: AnalyticsExportData,
  options: AnalyticsExportOptions,
  restaurantName: string = 'Restaurant'
): Promise<void> => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Color palette
  const colors = {
    primary: '#3b82f6',
    secondary: '#10b981', 
    accent: '#f59e0b',
    text: '#374151',
    lightGray: '#f3f4f6'
  };
  
  let yPosition = 20;
  
  // Helper function to add safe text with proper encoding
  const addText = (text: string, x: number, y: number, options?: any) => {
    try {
      // Clean and encode text properly
      const cleanText = text.toString().replace(/[^\x00-\x7F]/g, '');
      pdf.text(cleanText, x, y, options);
    } catch (error) {
      // Fallback for problematic characters
      pdf.text(text.replace(/[^a-zA-Z0-9\s\-.,()%]/g, ''), x, y, options);
    }
  };
  
  // Cover Page with Gradient Effect
  pdf.setFillColor(59, 130, 246); // Primary blue
  pdf.rect(0, 0, pageWidth, 60, 'F');
  
  // Add subtle accent bar
  pdf.setFillColor(16, 185, 129); // Green accent
  pdf.rect(0, 55, pageWidth, 5, 'F');
  
  // Title with better spacing
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  addText('ANALYTICS REPORT', pageWidth / 2, 28, { align: 'center' });
  
  // Subtitle
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  addText('Performance & Insights Dashboard', pageWidth / 2, 45, { align: 'center' });
  
  // Restaurant name with styling
  yPosition = 80;
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  addText(restaurantName.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' });
  
  // Decorative line under restaurant name
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(2);
  const textWidth = pdf.getTextWidth(restaurantName.toUpperCase()) * 20 / 12;
  pdf.line(pageWidth / 2 - textWidth / 2, yPosition + 3, pageWidth / 2 + textWidth / 2, yPosition + 3);
  
  yPosition = 100;
  
  // Report info section with better formatting
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, yPosition, pageWidth - 40, 35, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.rect(20, yPosition, pageWidth - 40, 35);
  
  yPosition += 10;
  pdf.setTextColor(75, 85, 99);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  addText('REPORT DETAILS', 25, yPosition);
  
  yPosition += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const reportTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Two column layout for report details
  pdf.setFont('helvetica', 'bold');
  addText('Generated:', 25, yPosition);
  pdf.setFont('helvetica', 'normal');
  addText(`${reportDate} at ${reportTime}`, 65, yPosition);
  
  pdf.setFont('helvetica', 'bold');
  addText('Period:', 25, yPosition + 8);
  pdf.setFont('helvetica', 'normal');
  addText(options.dateRange, 65, yPosition + 8);
  
  pdf.setFont('helvetica', 'bold');
  addText('Type:', 25, yPosition + 16);
  pdf.setFont('helvetica', 'normal');
  addText('Complete Analytics Report', 65, yPosition + 16);
  
  yPosition += 45;
  
  // Overview Stats Section
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235); // Primary blue
  addText('KEY PERFORMANCE METRICS', 20, yPosition);
  
  // Add underline for section header
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(1);
  pdf.line(20, yPosition + 2, 120, yPosition + 2);
  
  yPosition += 20;
  
  // Stats cards
  const statsData = [
    { label: 'Total Menu Views', value: data.menuViews.total.toLocaleString(), change: data.menuViews.change },
    { label: 'QR Code Scans', value: data.qrScans.total.toLocaleString(), change: data.qrScans.change },
    { label: 'Popular Items', value: data.popularItems.length.toString(), change: null },
    { label: 'Categories', value: data.categoryPerformance.length.toString(), change: null }
  ];
  
  statsData.forEach((stat, index) => {
    const cardX = 20 + (index % 2) * 90;
    const cardY = yPosition + Math.floor(index / 2) * 25;
    
    // Card background
    pdf.setFillColor(248, 250, 252);
    pdf.rect(cardX, cardY, 80, 20, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(cardX, cardY, 80, 20);
    
    // Value
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    addText(stat.value, cardX + 5, cardY + 10);
    
    // Label
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    addText(stat.label, cardX + 5, cardY + 18);
    
    // Change indicator with better styling
    if (stat.change !== null) {
      const changeText = `${stat.change >= 0 ? '+' : ''}${stat.change.toFixed(1)}%`;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      if (stat.change >= 0) {
        pdf.setTextColor(34, 197, 94); // Green
        addText('↗ ' + changeText, cardX + 5, cardY + 26);
      } else {
        pdf.setTextColor(239, 68, 68); // Red
        addText('↘ ' + changeText.replace('-', ''), cardX + 5, cardY + 26);
      }
    }
  });
  
  yPosition += 60;
  
  if (options.includeCharts) {
    // Menu Views Trend Chart
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Section header with better styling
    pdf.setFillColor(239, 246, 255);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 18, 'F');
    pdf.setDrawColor(59, 130, 246);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 18);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 58, 138);
    addText('MENU VIEWS & SCANS TREND', 25, yPosition + 5);
    yPosition += 20;
    
    drawSimpleChart(
      pdf,
      data.menuViews.data.slice(-15), // Last 15 days
      20,
      yPosition,
      160,
      50,
      'line',
      'Daily Views & Scans',
      colors
    );
    
    yPosition += 65;
    
    // Popular Items Chart
    if (options.includePopularItems) {
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Popular Items section header
      pdf.setFillColor(254, 249, 195);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 18, 'F');
      pdf.setDrawColor(245, 158, 11);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 18);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 64, 14);
      addText('TOP PERFORMING ITEMS', 25, yPosition + 5);
      yPosition += 20;
      
      drawSimpleChart(
        pdf,
        data.popularItems,
        20,
        yPosition,
        160,
        50,
        'bar',
        'Views by Item',
        colors
      );
      
      yPosition += 65;
    }
    
    // Category Performance Chart
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Category Performance section header
    pdf.setFillColor(240, 253, 244);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 18, 'F');
    pdf.setDrawColor(16, 185, 129);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 18);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(6, 95, 70);
    addText('CATEGORY PERFORMANCE', 25, yPosition + 5);
    yPosition += 20;
    
    drawSimpleChart(
      pdf,
      data.categoryPerformance,
      20,
      yPosition,
      160,
      50,
      'bar',
      'Views by Category',
      colors
    );
    
    yPosition += 65;
    
    // Device Breakdown Chart
    if (options.includeDeviceStats) {
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Device Breakdown section header
      pdf.setFillColor(245, 243, 255);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 18, 'F');
      pdf.setDrawColor(139, 92, 246);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 18);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(91, 33, 182);
      addText('DEVICE BREAKDOWN', 25, yPosition + 5);
      yPosition += 20;
      
      drawSimpleChart(
        pdf,
        data.deviceBreakdown,
        20,
        yPosition,
        160,
        50,
        'pie',
        'Usage by Device Type',
        colors
      );
      
      yPosition += 65;
    }
  }
  
  // Data Tables Section
  if (options.includeRawData) {
    pdf.addPage();
    yPosition = 20;
    
    pdf.setFillColor(254, 242, 242);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 22, 'F');
    pdf.setDrawColor(239, 68, 68);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 22);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(153, 27, 27);
    addText('DETAILED DATA TABLES', 25, yPosition + 7);
    yPosition += 25;
    
    // Popular Items Table
    if (options.includePopularItems) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      addText('Most Popular Items', 20, yPosition);
      yPosition += 15;
      
      // Table headers with background
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, yPosition - 3, pageWidth - 40, 12, 'F');
      pdf.setDrawColor(209, 213, 219);
      pdf.rect(20, yPosition - 3, pageWidth - 40, 12);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(75, 85, 99);
      addText('Rank', 25, yPosition + 4);
      addText('Item Name', 40, yPosition + 4);
      addText('Category', 95, yPosition + 4);
      addText('Views', 135, yPosition + 4);
      addText('Change', 160, yPosition + 4);
      yPosition += 15;
      
      // Underline
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, yPosition, 180, yPosition);
      yPosition += 8;
      
      // Table data
      pdf.setFont('helvetica', 'normal');
      data.popularItems.forEach((item, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setTextColor(60, 60, 60);
        addText((index + 1).toString(), 25, yPosition);
        addText(item.name.substring(0, 22), 40, yPosition);
        addText(item.category.substring(0, 12), 95, yPosition);
        addText(item.views.toString(), 135, yPosition);
        
        const changeText = `${item.change >= 0 ? '+' : ''}${item.change}%`;
        if (item.change >= 0) {
          pdf.setTextColor(34, 197, 94); // Green
        } else {
          pdf.setTextColor(239, 68, 68); // Red
        }
        addText(changeText, 160, yPosition);
        pdf.setTextColor(60, 60, 60);
        
        yPosition += 8;
      });
      
      yPosition += 10;
    }
    
    // Category Performance Table
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(60, 60, 60);
    addText('Category Performance', 20, yPosition);
    yPosition += 15;
    
    // Table headers with background
    pdf.setFillColor(249, 250, 251);
    pdf.rect(20, yPosition - 3, pageWidth - 40, 12, 'F');
    pdf.setDrawColor(209, 213, 219);
    pdf.rect(20, yPosition - 3, pageWidth - 40, 12);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(75, 85, 99);
    addText('Category', 25, yPosition + 4);
    addText('Views', 85, yPosition + 4);
    addText('Items', 115, yPosition + 4);
    addText('Avg Rating', 145, yPosition + 4);
    yPosition += 15;
    
    // Table data
    pdf.setFont('helvetica', 'normal');
    data.categoryPerformance.forEach((category) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setTextColor(60, 60, 60);
      addText(category.name.substring(0, 22), 25, yPosition);
      addText(category.views.toString(), 85, yPosition);
      addText(category.items.toString(), 115, yPosition);
      addText(category.avgRating ? category.avgRating.toFixed(1) : 'N/A', 145, yPosition);
      yPosition += 8;
    });
  }
  
  // Footer on last page with better styling
  pdf.setDrawColor(226, 232, 240);
  pdf.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
  
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  const footerY = pageHeight - 18;
  
  const reportDateFooter = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  addText(`Generated by Smart Dine Analytics Dashboard on ${reportDateFooter}`, 20, footerY);
  addText(`Total Views: ${data.menuViews.total.toLocaleString()} | QR Scans: ${data.qrScans.total.toLocaleString()} | Categories: ${data.categoryPerformance.length}`, 20, footerY + 8);
  
  // Save PDF
  const fileName = `analytics-report-${restaurantName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

// Export analytics to JSON
export const exportAnalyticsToJSON = (
  data: AnalyticsExportData,
  options: AnalyticsExportOptions,
  restaurantName: string = 'Restaurant'
): void => {
  const exportData = {
    restaurant: restaurantName,
    generatedAt: new Date().toISOString(),
    dateRange: options.dateRange,
    summary: {
      totalMenuViews: data.menuViews.total,
      totalQRScans: data.qrScans.total,
      viewsChange: data.menuViews.change,
      scansChange: data.qrScans.change,
      totalPopularItems: data.popularItems.length,
      totalCategories: data.categoryPerformance.length
    },
    ...(options.includeRawData && {
      viewsTrend: data.menuViews.data,
      popularItems: data.popularItems,
      categoryPerformance: data.categoryPerformance,
      ...(options.includeTrafficPatterns && { timeDistribution: data.timeDistribution }),
      ...(options.includeDeviceStats && { deviceBreakdown: data.deviceBreakdown })
    })
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const fileName = `analytics-${restaurantName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
  saveAs(blob, fileName);
};

// Export analytics to CSV
export const exportAnalyticsToCSV = (
  data: AnalyticsExportData,
  options: AnalyticsExportOptions,
  restaurantName: string = 'Restaurant'
): void => {
  const csvData: any[] = [];
  
  // Summary data
  csvData.push(['ANALYTICS SUMMARY', '']);
  csvData.push(['Restaurant', restaurantName]);
  csvData.push(['Generated At', new Date().toLocaleString('en-IN')]);
  csvData.push(['Date Range', options.dateRange]);
  csvData.push(['Total Menu Views', data.menuViews.total]);
  csvData.push(['Menu Views Change', `${data.menuViews.change}%`]);
  csvData.push(['Total QR Scans', data.qrScans.total]);
  csvData.push(['QR Scans Change', `${data.qrScans.change}%`]);
  csvData.push(['']);
  
  // Popular Items
  if (options.includePopularItems) {
    csvData.push(['POPULAR ITEMS', '', '', '']);
    csvData.push(['Rank', 'Item Name', 'Category', 'Views', 'Change %']);
    data.popularItems.forEach((item, index) => {
      csvData.push([
        index + 1,
        item.name,
        item.category,
        item.views,
        `${item.change}%`
      ]);
    });
    csvData.push(['']);
  }
  
  // Category Performance
  csvData.push(['CATEGORY PERFORMANCE', '', '', '']);
  csvData.push(['Category Name', 'Views', 'Total Items', 'Average Rating']);
  data.categoryPerformance.forEach((category) => {
    csvData.push([
      category.name,
      category.views,
      category.items,
      category.avgRating || 'N/A'
    ]);
  });
  csvData.push(['']);
  
  // Traffic Patterns
  if (options.includeTrafficPatterns) {
    csvData.push(['TRAFFIC BY TIME OF DAY', '']);
    csvData.push(['Hour', 'Views']);
    data.timeDistribution.forEach((time) => {
      csvData.push([time.hour, time.views]);
    });
    csvData.push(['']);
  }
  
  // Device Stats
  if (options.includeDeviceStats) {
    csvData.push(['DEVICE BREAKDOWN', '', '']);
    csvData.push(['Device Type', 'Count', 'Percentage']);
    data.deviceBreakdown.forEach((device) => {
      csvData.push([device.device, device.count, `${device.percentage}%`]);
    });
  }
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const fileName = `analytics-${restaurantName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
  saveAs(blob, fileName);
};