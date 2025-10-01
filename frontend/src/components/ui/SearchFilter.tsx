import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  SlidersHorizontal,
  Star,
  DollarSign,
  Clock,
  Flame,
  Check
} from 'lucide-react';
import { DIETARY_TAGS } from '../../types/menu';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: Array<{ _id: string; name: string }>;
  showAdvanced?: boolean;
}

export interface FilterState {
  category: string;
  availability: 'all' | 'available' | 'unavailable';
  priceRange: string;
  dietaryTags: string[];
  isPopular?: boolean;
  isFeatured?: boolean;
  spicyLevel?: number[];
  preparationTime?: number[];
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  categories,
  showAdvanced = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Auto-focus search when expanded
  useEffect(() => {
    if (isExpanded && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isExpanded]);

  // Click outside to close filters
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  const clearSearch = () => {
    onSearchChange('');
    setIsExpanded(false);
  };

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      availability: 'all',
      priceRange: 'all',
      dietaryTags: [],
      isPopular: false,
      isFeatured: false,
      spicyLevel: [],
      preparationTime: [],
    });
    setShowFilters(false);
  };

  const toggleDietaryTag = (tagId: string) => {
    const updatedTags = filters.dietaryTags.includes(tagId)
      ? filters.dietaryTags.filter(id => id !== tagId)
      : [...filters.dietaryTags, tagId];
    
    onFiltersChange({ ...filters, dietaryTags: updatedTags });
  };

  const hasActiveFilters = 
    filters.category !== '' ||
    filters.availability !== 'all' ||
    filters.priceRange !== 'all' ||
    filters.dietaryTags.length > 0 ||
    filters.isPopular ||
    filters.isFeatured;

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-10', label: 'Under $10' },
    { value: '10-20', label: '$10 - $20' },
    { value: '20-30', label: '$20 - $30' },
    { value: '30+', label: '$30+' },
  ];

  const spicyLevels = [
    { value: 0, label: 'Not Spicy', emoji: '😊' },
    { value: 1, label: 'Mild', emoji: '🌶️' },
    { value: 2, label: 'Medium', emoji: '🌶️🌶️' },
    { value: 3, label: 'Hot', emoji: '🌶️🌶️🌶️' },
  ];

  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <AnimatePresence>
            {!isExpanded ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExpanded(true)}
                className="flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Search size={20} className="text-gray-400 mr-3" />
                <span className="text-gray-500 text-left flex-1">Search menu items...</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-primary-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Button */}
        {showAdvanced && (
          <div className="relative" ref={filtersRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                hasActiveFilters
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <Filter size={16} className="mr-2" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                  {[
                    filters.category && 1,
                    filters.availability !== 'all' && 1,
                    filters.priceRange !== 'all' && 1,
                    filters.dietaryTags.length,
                    filters.isPopular && 1,
                    filters.isFeatured && 1,
                  ].filter(Boolean).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 1), 0)}
                </span>
              )}
              <ChevronDown 
                size={16} 
                className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Filter Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-6 z-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <SlidersHorizontal size={18} className="mr-2" />
                      Filters
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Availability Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'all' as const, label: 'All' },
                          { value: 'available' as const, label: 'Available' },
                          { value: 'unavailable' as const, label: 'Unavailable' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => onFiltersChange({ ...filters, availability: option.value })}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                              filters.availability === option.value
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
                      </label>
                      <select
                        value={filters.priceRange}
                        onChange={(e) => onFiltersChange({ ...filters, priceRange: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {priceRanges.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Special Flags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Items
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.isPopular || false}
                            onChange={(e) => onFiltersChange({ ...filters, isPopular: e.target.checked })}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 flex items-center">
                            <Star size={14} className="mr-1 text-yellow-500" />
                            Popular Items
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.isFeatured || false}
                            onChange={(e) => onFiltersChange({ ...filters, isFeatured: e.target.checked })}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Featured Items
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Dietary Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dietary Preferences
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {DIETARY_TAGS.slice(0, 8).map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => toggleDietaryTag(tag.id)}
                            className={`flex items-center px-3 py-2 text-sm rounded-lg border transition-colors ${
                              filters.dietaryTags.includes(tag.id)
                                ? `border-${tag.color}-500 bg-${tag.color}-50 text-${tag.color}-700`
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <span className="mr-2">{tag.icon}</span>
                            <span className="truncate">{tag.name}</span>
                            {filters.dietaryTags.includes(tag.id) && (
                              <Check size={14} className="ml-1 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Search Results Count */}
      {(searchQuery || hasActiveFilters) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-gray-500"
        >
          {searchQuery && (
            <span>Searching for "{searchQuery}"</span>
          )}
          {hasActiveFilters && (
            <span className="ml-2">
              • {Object.values(filters).filter(v => 
                Array.isArray(v) ? v.length > 0 : v && v !== 'all'
              ).length} filter{Object.values(filters).filter(v => 
                Array.isArray(v) ? v.length > 0 : v && v !== 'all'
              ).length !== 1 ? 's' : ''} applied
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SearchFilter;