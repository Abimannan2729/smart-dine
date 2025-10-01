import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Edit2, 
  Trash2, 
  GripVertical,
  Eye,
  EyeOff,
  Clock,
  Flame,
  Image as ImageIcon,
  Star,
  TrendingUp,
  X
} from 'lucide-react';
import { 
  MenuItem, 
  MenuCategory, 
  CreateMenuItemRequest, 
  UpdateMenuItemRequest,
  DIETARY_TAGS 
} from '../../types/menu';
import { menuService } from '../../services/menuService';
import Button from '../ui/Button';
import MenuItemForm from './MenuItemForm';
import notifications from '../../utils/notifications';
import { formatPrice } from '../../utils/currency';

interface MenuItemManagerProps {
  menuId: string;
  restaurantId: string;
  categories: MenuCategory[];
  onMenuItemsUpdate: (categoryId: string, items: MenuItem[]) => void;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'available' | 'unavailable' | 'popular' | 'featured';

const MenuItemManager: React.FC<MenuItemManagerProps> = ({
  menuId,
  restaurantId,
  categories,
  onMenuItemsUpdate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Get all items from all categories
  const allItems = categories.flatMap(category => 
    (category.items || []).map(item => ({ ...item, categoryName: category.name }))
  );

  // Debug: Log items to inspect image data structure
  useEffect(() => {
    if (allItems.length > 0) {
      console.log('MenuItemManager: All items:', allItems);
      console.log('MenuItemManager: Sample item structure:', allItems[0]);
      console.log('MenuItemManager: Sample item image field:', allItems[0]?.image);
      console.log('MenuItemManager: Sample item images field:', (allItems[0] as any)?.images);
    }
  }, [allItems.length]);

  // Helper function to get image URL from item
  const getItemImageUrl = (item: MenuItem): string | null => {
    // First try the direct image field
    if (item.image && typeof item.image === 'string') {
      return item.image;
    }
    
    // Fallback to images array if available
    const itemWithImages = item as any;
    if (itemWithImages.images && Array.isArray(itemWithImages.images) && itemWithImages.images.length > 0) {
      const firstImage = itemWithImages.images[0];
      return typeof firstImage === 'string' ? firstImage : null;
    }
    
    return null;
  };

  // Filter items based on search and filters
  const filteredItems = allItems.filter(item => {
    // Text search
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    // Status filter
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'available' && item.isAvailable) ||
      (filter === 'unavailable' && !item.isAvailable) ||
      (filter === 'popular' && item.isPopular) ||
      (filter === 'featured' && item.isFeatured);

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Find the items and their categories
    const activeItem = allItems.find(item => item._id === active.id);
    const overItem = allItems.find(item => item._id === over.id);

    if (!activeItem || !overItem) return;

    // If items are in different categories, don't allow reordering
    if (activeItem.category !== overItem.category) {
      notifications.error('Cannot reorder items across different categories');
      return;
    }

    const categoryItems = allItems.filter(item => item.category === activeItem.category);
    const oldIndex = categoryItems.findIndex(item => item._id === active.id);
    const newIndex = categoryItems.findIndex(item => item._id === over.id);

    const newItems = arrayMove(categoryItems, oldIndex, newIndex);
    
    // Update sort orders
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sortOrder: index
    }));

    try {
      await menuService.reorderMenuItems({
        categoryId: activeItem.category,
        itemIds: updatedItems.map(item => item._id!)
      });
      
      onMenuItemsUpdate(activeItem.category, updatedItems);
      notifications.success('Items reordered successfully');
    } catch (error) {
      console.error('Failed to reorder items:', error);
      notifications.error('Failed to reorder items');
    }
  };

  const handleCreateItem = async (itemData: CreateMenuItemRequest) => {
    try {
      setLoading(true);
      console.log('HandleCreateItem: Original itemData:', itemData);
      console.log('HandleCreateItem: itemData.image:', itemData.image);
      const dataToSend = { ...itemData, restaurantId };
      console.log('HandleCreateItem: Final data being sent:', dataToSend);
      const newItem = await menuService.createMenuItem(dataToSend);
      
      // Update the items in the category
      const category = categories.find(cat => cat._id === itemData.categoryId);
      if (category) {
        const updatedItems = [...(category.items || []), newItem];
        onMenuItemsUpdate(itemData.categoryId, updatedItems);
      }
      
      setShowItemForm(false);
      notifications.success('Menu item created successfully');
    } catch (error) {
      console.error('Failed to create menu item:', error);
      notifications.error('Failed to create menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (itemData: UpdateMenuItemRequest) => {
    if (!editingItem) return;

    try {
      setLoading(true);
      const updatedItem = await menuService.updateMenuItem(editingItem._id!, itemData);
      
      // Update the items in the category
      const category = categories.find(cat => cat._id === editingItem.category);
      if (category) {
        const updatedItems = (category.items || []).map(item =>
          item._id === editingItem._id ? updatedItem : item
        );
        onMenuItemsUpdate(editingItem.category, updatedItems);
      }
      
      setEditingItem(null);
      notifications.success('Menu item updated successfully');
    } catch (error) {
      console.error('Failed to update menu item:', error);
      notifications.error('Failed to update menu item');
    } finally {
      setLoading(false);
    }
  };

  // Unified save handler that handles both create and update
  const handleSave = async (data: CreateMenuItemRequest | UpdateMenuItemRequest) => {
    if (editingItem) {
      return handleUpdateItem(data as UpdateMenuItemRequest);
    } else {
      return handleCreateItem(data as CreateMenuItemRequest);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = allItems.find(item => item._id === itemId);
    if (!item) return;

    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      setLoading(true);
      await menuService.deleteMenuItem(itemId);
      
      // Update the items in the category
      const category = categories.find(cat => cat._id === item.category);
      if (category) {
        const updatedItems = (category.items || []).filter(i => i._id !== itemId);
        onMenuItemsUpdate(item.category, updatedItems);
      }
      
      notifications.success('Menu item deleted successfully');
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      notifications.error('Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId: string, isAvailable: boolean) => {
    const item = allItems.find(item => item._id === itemId);
    if (!item) return;

    try {
      const updatedItem = await menuService.toggleMenuItemAvailability(itemId, isAvailable);
      
      // Update the items in the category
      const category = categories.find(cat => cat._id === item.category);
      if (category) {
        const updatedItems = (category.items || []).map(i =>
          i._id === itemId ? updatedItem : i
        );
        onMenuItemsUpdate(item.category, updatedItems);
      }
      
      notifications.success(`Item ${isAvailable ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Failed to toggle item availability:', error);
      notifications.error('Failed to update item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
          <p className="text-gray-600">Manage your menu items with drag-and-drop organization</p>
        </div>
        <Button
          onClick={() => setShowItemForm(true)}
          icon={<Plus size={20} />}
        >
          Add Item
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Items</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="popular">Popular</option>
            <option value="featured">Featured</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 p-2 flex items-center justify-center rounded-l-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-500 text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 p-2 flex items-center justify-center rounded-r-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-500 text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500">
          Showing {filteredItems.length} of {allItems.length} items
        </div>
      </div>

      {/* Items Display */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' || filter !== 'all' 
              ? 'No items match your filters' 
              : 'No menu items yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedCategory !== 'all' || filter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Add your first menu item to get started.'}
          </p>
          {!searchQuery && selectedCategory === 'all' && filter === 'all' && (
            <Button 
              variant="primary" 
              size="lg" 
              icon={<Plus size={20} />}
              onClick={() => setShowItemForm(true)}
            >
              Add Your First Item
            </Button>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItems.map(item => item._id!)}
            strategy={verticalListSortingStrategy}
          >
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <SortableMenuItemCard
                    key={item._id}
                    item={item}
                    index={index}
                    viewMode={viewMode}
                    onEdit={setEditingItem}
                    onDelete={handleDeleteItem}
                    onToggleAvailability={handleToggleAvailability}
                    getItemImageUrl={getItemImageUrl}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Item Form */}
      <MenuItemForm
        isOpen={showItemForm || !!editingItem}
        onClose={() => {
          setShowItemForm(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        categories={categories}
        item={editingItem}
        loading={loading}
      />
    </div>
  );
};

// Sortable Menu Item Card Component
interface SortableMenuItemCardProps {
  item: MenuItem & { categoryName: string };
  index: number;
  viewMode: ViewMode;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onToggleAvailability: (itemId: string, isAvailable: boolean) => void;
  getItemImageUrl: (item: MenuItem) => string | null;
}

const SortableMenuItemCard: React.FC<SortableMenuItemCardProps> = ({
  item,
  index,
  viewMode,
  onEdit,
  onDelete,
  onToggleAvailability,
  getItemImageUrl,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getDietaryTagsDisplay = () => {
    if (!item.dietaryTags || !Array.isArray(item.dietaryTags)) {
      return '';
    }
    return item.dietaryTags.slice(0, 3).map(tag => {
      // Handle both string IDs and tag objects
      const tagId = typeof tag === 'string' ? tag : tag?.id || tag;
      const dietaryTag = DIETARY_TAGS.find(dt => dt.id === tagId);
      return dietaryTag ? dietaryTag.icon : '';
    }).join(' ');
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.1 }}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${
          isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
        } ${!item.isAvailable ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center space-x-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <GripVertical size={16} className="text-gray-400" />
          </div>

          {/* Item Image */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {getItemImageUrl(item) ? (
              <img
                src={getItemImageUrl(item)!}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('MenuItemManager: Image failed to load:', getItemImageUrl(item));
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center ${getItemImageUrl(item) ? 'hidden' : ''}`}>
              <ImageIcon size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {item.name}
              </h3>
              <div className="flex items-center space-x-1">
                {item.isPopular && (
                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                )}
                {item.isFeatured && (
                  <TrendingUp size={14} className="text-purple-500" />
                )}
                {getDietaryTagsDisplay() && (
                  <span className="text-sm">{getDietaryTagsDisplay()}</span>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{item.categoryName}</p>
            {item.description && (
              <p className="text-gray-500 text-sm line-clamp-1">
                {item.description}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <div className="flex items-center">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm text-gray-500 line-through mr-2">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
              <span className="text-lg font-semibold text-gray-900">
                {formatPrice(item.price)}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              {item.preparationTime && (
                <>
                  <Clock size={12} className="mr-1" />
                  <span>{item.preparationTime}m</span>
                </>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex-shrink-0">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => onToggleAvailability(item._id!, !item.isAvailable)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
            >
              {item.isAvailable ? (
                <Eye size={16} className="text-gray-600" />
              ) : (
                <EyeOff size={16} className="text-gray-400" />
              )}
            </button>
            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Edit item"
            >
              <Edit2 size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => onDelete(item._id!)}
              className="p-2 rounded-lg hover:bg-red-100 transition-colors"
              title="Delete item"
            >
              <Trash2 size={16} className="text-red-600" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${
        isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
      } ${!item.isAvailable ? 'opacity-60' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 cursor-grab active:cursor-grabbing p-2 rounded-lg bg-white/80 hover:bg-white transition-colors"
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {/* Item Image */}
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {getItemImageUrl(item) ? (
          <img
            src={getItemImageUrl(item)!}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('MenuItemManager: Image failed to load:', getItemImageUrl(item));
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center ${getItemImageUrl(item) ? 'hidden' : ''}`}>
          <ImageIcon size={32} className="text-gray-400" />
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Badges */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          {item.isPopular && (
            <div className="p-1 bg-yellow-100 rounded-full">
              <Star size={12} className="text-yellow-600" fill="currentColor" />
            </div>
          )}
          {item.isFeatured && (
            <div className="p-1 bg-purple-100 rounded-full">
              <TrendingUp size={12} className="text-purple-600" />
            </div>
          )}
        </div>
      </div>

      {/* Item Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {item.name}
            </h3>
            <p className="text-sm text-gray-500">{item.categoryName}</p>
          </div>
          <div className="text-right ml-3">
            {item.originalPrice && item.originalPrice > item.price && (
              <div className="text-xs text-gray-500 line-through">
                {formatPrice(item.originalPrice)}
              </div>
            )}
            <div className="text-lg font-semibold text-gray-900">
              {formatPrice(item.price)}
            </div>
          </div>
        </div>

        {item.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            {item.preparationTime && (
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                <span>{item.preparationTime}m</span>
              </div>
            )}
            {item.spicyLevel && item.spicyLevel > 0 && (
              <div className="flex items-center">
                <Flame size={12} className="mr-1" />
                <span>{'🌶️'.repeat(item.spicyLevel)}</span>
              </div>
            )}
          </div>
          {getDietaryTagsDisplay() && (
            <span>{getDietaryTagsDisplay()}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleAvailability(item._id!, !item.isAvailable)}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              item.isAvailable
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {item.isAvailable ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => onEdit(item)}
            className="px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item._id!)}
            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemManager;