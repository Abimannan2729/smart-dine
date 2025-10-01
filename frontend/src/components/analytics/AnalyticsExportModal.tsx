import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  FileText,
  BarChart3,
  Calendar,
  Eye,
  Users,
  Smartphone,
  TrendingUp,
  Star,
  Activity,
  CheckCircle2
} from 'lucide-react';
import Button from '../ui/Button';
import {
  exportAnalyticsToPDF,
  exportAnalyticsToJSON,
  exportAnalyticsToCSV,
  AnalyticsExportData,
  AnalyticsExportOptions
} from '../../utils/analyticsExportUtils';

interface AnalyticsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsData: AnalyticsExportData;
  restaurantName?: string;
}

type ExportFormat = 'pdf' | 'json' | 'csv';

const AnalyticsExportModal: React.FC<AnalyticsExportModalProps> = ({
  isOpen,
  onClose,
  analyticsData,
  restaurantName = 'Restaurant'
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [exportOptions, setExportOptions] = useState<AnalyticsExportOptions>({
    includeCharts: true,
    includeRawData: true,
    dateRange: 'Last 30 days',
    includeDeviceStats: true,
    includePopularItems: true,
    includeTrafficPatterns: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const formatOptions = [
    {
      id: 'pdf' as const,
      name: 'PDF Report',
      description: 'Professional report with charts and visualizations',
      icon: FileText,
      color: 'bg-red-100 text-red-600',
      features: ['Charts & Graphs', 'Formatted Tables', 'Professional Layout', 'Print Ready']
    },
    {
      id: 'json' as const,
      name: 'JSON Data',
      description: 'Structured data for developers and integrations',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
      features: ['Raw Data', 'API Compatible', 'Machine Readable', 'Lightweight']
    },
    {
      id: 'csv' as const,
      name: 'CSV Spreadsheet',
      description: 'Tabular data for Excel and spreadsheet applications',
      icon: Activity,
      color: 'bg-green-100 text-green-600',
      features: ['Excel Compatible', 'Easy Analysis', 'Structured Tables', 'Import Ready']
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // UI feedback

      switch (selectedFormat) {
        case 'pdf':
          await exportAnalyticsToPDF(analyticsData, exportOptions, restaurantName);
          break;
        case 'json':
          exportAnalyticsToJSON(analyticsData, exportOptions, restaurantName);
          break;
        case 'csv':
          exportAnalyticsToCSV(analyticsData, exportOptions, restaurantName);
          break;
      }

      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleOption = (key: keyof AnalyticsExportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Download className="mr-3 h-6 w-6 text-primary-600" />
                Export Analytics
              </h2>
              <p className="text-gray-600 mt-1">Download comprehensive analytics report</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Format Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary-600" />
                  Export Format
                </h3>
                <div className="space-y-3">
                  {formatOptions.map((format) => {
                    const Icon = format.icon;
                    return (
                      <motion.div
                        key={format.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedFormat === format.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedFormat(format.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${format.color}`}>
                            <Icon size={20} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{format.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {format.features.map((feature) => (
                                <span
                                  key={feature}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedFormat === format.id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedFormat === format.id && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-primary-600" />
                  Include Data
                </h3>
                
                {/* Date Range */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Date Range
                  </label>
                  <select
                    value={exportOptions.dateRange}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Last 7 days">Last 7 days</option>
                    <option value="Last 30 days">Last 30 days</option>
                    <option value="Last 90 days">Last 90 days</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: 'includeCharts' as const,
                      label: 'Charts & Visualizations',
                      description: 'Include visual charts and graphs',
                      icon: BarChart3,
                      pdfOnly: true
                    },
                    {
                      key: 'includeRawData' as const,
                      label: 'Raw Data Tables',
                      description: 'Include detailed data tables',
                      icon: Activity,
                      pdfOnly: false
                    },
                    {
                      key: 'includePopularItems' as const,
                      label: 'Popular Items',
                      description: 'Top performing menu items',
                      icon: Star,
                      pdfOnly: false
                    },
                    {
                      key: 'includeDeviceStats' as const,
                      label: 'Device Statistics',
                      description: 'Mobile, desktop, tablet breakdown',
                      icon: Smartphone,
                      pdfOnly: false
                    },
                    {
                      key: 'includeTrafficPatterns' as const,
                      label: 'Traffic Patterns',
                      description: 'Time-based usage analytics',
                      icon: TrendingUp,
                      pdfOnly: false
                    }
                  ].map((option) => {
                    const Icon = option.icon;
                    const isDisabled = option.pdfOnly && selectedFormat !== 'pdf';
                    return (
                      <div
                        key={option.key}
                        className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                          isDisabled ? 'bg-gray-100 opacity-50' : 'bg-white border hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center h-5">
                          <input
                            id={option.key}
                            type="checkbox"
                            checked={isDisabled ? false : exportOptions[option.key]}
                            onChange={() => !isDisabled && toggleOption(option.key)}
                            disabled={isDisabled}
                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Icon size={16} className="text-gray-600" />
                            <label
                              htmlFor={option.key}
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {option.label}
                            </label>
                            {option.pdfOnly && selectedFormat !== 'pdf' && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                PDF Only
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-gray-600">Total Views</div>
                <div className="font-semibold text-primary-600">{analyticsData.menuViews.total.toLocaleString()}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-gray-600">QR Scans</div>
                <div className="font-semibold text-green-600">{analyticsData.qrScans.total.toLocaleString()}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-gray-600">Popular Items</div>
                <div className="font-semibold text-yellow-600">{analyticsData.popularItems.length}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-gray-600">Categories</div>
                <div className="font-semibold text-purple-600">{analyticsData.categoryPerformance.length}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
            <div className="text-sm text-gray-600">
              Format: <span className="font-medium">{formatOptions.find(f => f.id === selectedFormat)?.name}</span> •{' '}
              Range: <span className="font-medium">{exportOptions.dateRange}</span>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={exportComplete ? <CheckCircle2 size={16} /> : <Download size={16} />}
                onClick={handleExport}
                disabled={isExporting}
                loading={isExporting}
              >
                {exportComplete ? 'Export Complete!' : isExporting ? 'Exporting...' : 'Export Report'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnalyticsExportModal;