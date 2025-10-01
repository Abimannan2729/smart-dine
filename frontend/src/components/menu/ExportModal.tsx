import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Code2,
  Check,
  X,
  Settings,
  Eye,
  Image,
  DollarSign,
  Utensils,
  AlertTriangle,
  Flame,
  Tags,
  Layers,
  Loader
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Menu } from '../../types/menu';
import {
  ExportOptions,
  ExportFormat,
  defaultExportOptions,
  exportMenu,
  getExportFormats
} from '../../utils/exportUtils';
import notifications from '../../utils/notifications';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: Menu | null;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, menu }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>(defaultExportOptions);
  const [isExporting, setIsExporting] = useState(false);
  const [activeStep, setActiveStep] = useState<'format' | 'options' | 'preview'>('format');

  const formats = getExportFormats();

  const handleFormatSelect = (format: ExportFormat) => {
    setExportOptions({ ...exportOptions, format });
    setActiveStep('options');
  };

  const handleOptionChange = (key: keyof ExportOptions, value: boolean | string) => {
    setExportOptions({
      ...exportOptions,
      [key]: value,
    });
  };

  const handleExport = async () => {
    if (!menu) {
      notifications.error('No menu data available for export');
      return;
    }

    try {
      setIsExporting(true);
      await exportMenu(menu, exportOptions);
      notifications.success(`Menu exported successfully as ${exportOptions.format.toUpperCase()}`);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      notifications.error('Failed to export menu. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-8 h-8" />;
      case 'csv':
        return <FileSpreadsheet className="w-8 h-8" />;
      case 'json':
        return <Code2 className="w-8 h-8" />;
      default:
        return <Download className="w-8 h-8" />;
    }
  };

  const renderFormatSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Export Format</h3>
        <p className="text-gray-600">Select the format you'd like to export your menu to</p>
      </div>

      <div className="grid gap-4">
        {formats.map((format) => (
          <motion.div
            key={format.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${ 
              exportOptions.format === format.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleFormatSelect(format.id as ExportFormat)}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${ 
                exportOptions.format === format.id 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getFormatIcon(format.id)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-semibold text-gray-900">{format.name}</h4>
                  {format.recommended && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{format.description}</p>
              </div>
              <div className="text-2xl">{format.icon}</div>
            </div>

            {exportOptions.format === format.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center"
              >
                <Check size={16} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderExportOptions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Options</h3>
        <p className="text-gray-600">Customize what information to include in your export</p>
      </div>

      <div className="space-y-4">
        {/* Content Options */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Content Options
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeDescriptions}
                onChange={(e) => handleOptionChange('includeDescriptions', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Descriptions</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeImages}
                onChange={(e) => handleOptionChange('includeImages', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={exportOptions.format === 'pdf'} // PDF doesn't support images yet
              />
              <span className={`text-sm ${exportOptions.format === 'pdf' ? 'text-gray-400' : 'text-gray-700'}`}>
                Images {exportOptions.format === 'pdf' && '(PDF N/A)'}
              </span>
            </label>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing Information
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includePricing}
                onChange={(e) => handleOptionChange('includePricing', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Include all pricing information</span>
            </label>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Additional Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeIngredients}
                onChange={(e) => handleOptionChange('includeIngredients', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-1">
                <Utensils className="w-3 h-3" />
                <span className="text-sm text-gray-700">Ingredients</span>
              </div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeAllergens}
                onChange={(e) => handleOptionChange('includeAllergens', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-sm text-gray-700">Allergens</span>
              </div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeNutrition}
                onChange={(e) => handleOptionChange('includeNutrition', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-1">
                <Flame className="w-3 h-3" />
                <span className="text-sm text-gray-700">Nutrition Info</span>
              </div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeDietaryTags}
                onChange={(e) => handleOptionChange('includeDietaryTags', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-1">
                <Tags className="w-3 h-3" />
                <span className="text-sm text-gray-700">Dietary Tags</span>
              </div>
            </label>
          </div>
        </div>

        {/* Layout Options */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            Layout Options
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.categorySeparation}
                onChange={(e) => handleOptionChange('categorySeparation', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Clear category separation</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Preview</h3>
        <p className="text-gray-600">Review your export settings before downloading</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Format</h4>
            <div className="flex items-center space-x-2">
              {getFormatIcon(exportOptions.format)}
              <span className="text-sm font-medium text-gray-700">
                {formats.find(f => f.id === exportOptions.format)?.name}
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">File Name</h4>
            <p className="text-sm text-gray-600">
              {`${(menu?.restaurant?.name || menu?.name || 'menu').replace(/[^a-zA-Z0-9]/g, '_')}_menu.${exportOptions.format}`}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Included Content</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={`flex items-center space-x-2 ${exportOptions.includeDescriptions ? 'text-green-600' : 'text-gray-400'}`}>
              <Check size={14} className={exportOptions.includeDescriptions ? '' : 'opacity-30'} />
              <span>Descriptions</span>
            </div>
            <div className={`flex items-center space-x-2 ${exportOptions.includePricing ? 'text-green-600' : 'text-gray-400'}`}>
              <Check size={14} className={exportOptions.includePricing ? '' : 'opacity-30'} />
              <span>Pricing</span>
            </div>
            <div className={`flex items-center space-x-2 ${exportOptions.includeIngredients ? 'text-green-600' : 'text-gray-400'}`}>
              <Check size={14} className={exportOptions.includeIngredients ? '' : 'opacity-30'} />
              <span>Ingredients</span>
            </div>
            <div className={`flex items-center space-x-2 ${exportOptions.includeAllergens ? 'text-green-600' : 'text-gray-400'}`}>
              <Check size={14} className={exportOptions.includeAllergens ? '' : 'opacity-30'} />
              <span>Allergens</span>
            </div>
            <div className={`flex items-center space-x-2 ${exportOptions.includeNutrition ? 'text-green-600' : 'text-gray-400'}`}>
              <Check size={14} className={exportOptions.includeNutrition ? '' : 'opacity-30'} />
              <span>Nutrition Info</span>
            </div>
            <div className={`flex items-center space-x-2 ${exportOptions.includeDietaryTags ? 'text-green-600' : 'text-gray-400'}`}>
              <Check size={14} className={exportOptions.includeDietaryTags ? '' : 'opacity-30'} />
              <span>Dietary Tags</span>
            </div>
          </div>
        </div>

        {menu && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Export Statistics</h4>
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900">{menu.categories.length}</div>
                <div>Categories</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900">
                  {menu.categories.reduce((total, cat) => total + (cat.items?.length || 0), 0)}
                </div>
                <div>Total Items</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900">
                  {menu.categories.reduce((total, cat) => 
                    total + (cat.items?.filter(item => item.isAvailable).length || 0), 0
                  )}
                </div>
                <div>Available Items</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 'format':
        return renderFormatSelection();
      case 'options':
        return renderExportOptions();
      case 'preview':
        return renderPreview();
      default:
        return renderFormatSelection();
    }
  };

  const getStepButtons = () => {
    switch (activeStep) {
      case 'format':
        return (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        );
      case 'options':
        return (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveStep('format')}>
              Back
            </Button>
            <Button onClick={() => setActiveStep('preview')}>
              Preview Export
            </Button>
          </div>
        );
      case 'preview':
        return (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveStep('options')}>
              Back
            </Button>
            <Button 
              onClick={handleExport} 
              loading={isExporting}
              icon={isExporting ? <Loader className="animate-spin" size={16} /> : <Download size={16} />}
            >
              {isExporting ? 'Exporting...' : 'Download Export'}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Export Menu" 
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[
            { key: 'format', label: 'Format', icon: FileText },
            { key: 'options', label: 'Options', icon: Settings },
            { key: 'preview', label: 'Preview', icon: Eye },
          ].map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === step.key;
            const isCompleted = ['format', 'options'].indexOf(activeStep) > ['format', 'options'].indexOf(step.key);
            
            return (
              <React.Fragment key={step.key}>
                <div className={`flex flex-col items-center space-y-2 ${
                  isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive ? 'border-primary-600 bg-primary-50' : 
                    isCompleted ? 'border-green-600 bg-green-50' : 'border-gray-300'
                  }`}>
                    {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <span className="text-xs font-medium">{step.label}</span>
                </div>
                {index < 2 && (
                  <div className={`w-12 h-0.5 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-4">
          {getStepButtons()}
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;