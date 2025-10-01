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
  Edit2, 
  Trash2, 
  GripVertical,
  Eye,
  EyeOff,
  Image,
  X,
  Save,
  Upload
} from 'lucide-react';
import { MenuCategory, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/menu';
import { menuService } from '../../services/menuService';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import notifications from '../../utils/notifications';

interface CategoryManagerProps {
  menuId: string;
  restaurantId: string;
  categories: MenuCategory[];
  onCategoriesUpdate: (categories: MenuCategory[]) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  menuId,
  restaurantId,
  categories,
  onCategoriesUpdate,
}) => {
  const [localCategories, setLocalCategories] = useState<MenuCategory[]>(categories);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    console.log('CategoryManager: Categories updated:', categories);
    categories.forEach((cat, index) => {
      if (!cat._id) {
        console.warn(`CategoryManager: Category at index ${index} has no _id:`, cat);
      }
    });
    setLocalCategories(categories);
  }, [categories]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localCategories.findIndex(cat => cat._id === active.id);
      const newIndex = localCategories.findIndex(cat => cat._id === over.id);

      const newCategories = arrayMove(localCategories, oldIndex, newIndex);
      setLocalCategories(newCategories);

      // Update sort orders and sync with server
      const updatedCategories = newCategories.map((cat, index) => ({
        ...cat,
        sortOrder: index
      }));

      try {
        await menuService.reorderCategories({
          menuId,
          categoryIds: updatedCategories.map(cat => cat._id!)
        });
        onCategoriesUpdate(updatedCategories);
        notifications.success('Categories reordered successfully');
      } catch (error) {
        console.error('Failed to reorder categories:', error);
        notifications.error('Failed to reorder categories');
        setLocalCategories(categories); // Revert on error
      }
    }
  };

  const handleCreateCategory = async (categoryData: CreateCategoryRequest) => {
    try {
      setLoading(true);
      const newCategory = await menuService.createCategory(categoryData);
      const updatedCategories = [...localCategories, newCategory];
      setLocalCategories(updatedCategories);
      onCategoriesUpdate(updatedCategories);
      setShowCreateModal(false);
      notifications.success('Category created successfully');
    } catch (error) {
      console.error('Failed to create category:', error);
      notifications.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryId: string, categoryData: UpdateCategoryRequest) => {
    try {
      setLoading(true);
      
      // If no new image is provided, preserve the existing image
      const existingCategory = localCategories.find(cat => cat._id === categoryId);
      const updateData = {
        ...categoryData,
        // Only update image if a new one is provided, otherwise keep existing
        image: categoryData.image?.trim() || existingCategory?.image || ''
      };
      
      const updatedCategory = await menuService.updateCategory(categoryId, updateData);
      const updatedCategories = localCategories.map(cat =>
        cat._id === categoryId ? updatedCategory : cat
      );
      setLocalCategories(updatedCategories);
      onCategoriesUpdate(updatedCategories);
      setEditingCategory(null);
      notifications.success('Category updated successfully');
    } catch (error) {
      console.error('Failed to update category:', error);
      notifications.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all items in this category.')) {
      return;
    }

    try {
      setLoading(true);
      await menuService.deleteCategory(categoryId);
      const updatedCategories = localCategories.filter(cat => cat._id !== categoryId);
      setLocalCategories(updatedCategories);
      onCategoriesUpdate(updatedCategories);
      notifications.success('Category deleted successfully');
    } catch (error) {
      console.error('Failed to delete category:', error);
      notifications.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (categoryId: string, isActive: boolean) => {
    if (!categoryId) {
      console.error('Category ID is required for toggle visibility');
      notifications.error('Invalid category ID');
      return;
    }
    
    // Store the original state for rollback
    const originalCategories = [...localCategories];
    
    // Optimistically update the UI
    const optimisticCategories = localCategories.map(cat =>
      cat._id === categoryId ? { ...cat, isActive } : cat
    );
    setLocalCategories(optimisticCategories);
    
    try {
      const updatedCategory = await menuService.updateCategory(categoryId, { isActive });
      const finalCategories = localCategories.map(cat =>
        cat._id === categoryId ? updatedCategory : cat
      );
      setLocalCategories(finalCategories);
      onCategoriesUpdate(finalCategories);
      notifications.success(`Category ${isActive ? 'enabled' : 'disabled'} successfully`);
    } catch (error: any) {
      console.error('Failed to toggle category visibility:', error);
      console.error('Error details:', error);
      
      // Rollback to original state on error
      setLocalCategories(originalCategories);
      onCategoriesUpdate(originalCategories);
      
      notifications.error(`Failed to update category. Changes have been reverted.`);
      
      // If the error is due to undefined ID, suggest refreshing
      if (error?.response?.config?.url?.includes('undefined')) {
        notifications.error('Data synchronization issue detected. Please refresh the page.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600">Organize your menu items into categories</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus size={20} />}
        >
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      {localCategories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No categories yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first category to organize your menu items.
          </p>
          <Button 
            variant="primary" 
            size="lg" 
            icon={<Plus size={20} />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Your First Category
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={localCategories.filter(cat => cat._id).map(cat => cat._id!)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              <AnimatePresence>
                {localCategories.map((category, index) => (
                  <SortableCategoryItem
                    key={category._id}
                    category={category}
                    index={index}
                    onEdit={setEditingCategory}
                    onDelete={handleDeleteCategory}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateCategory}
        menuId={menuId}
        restaurantId={restaurantId}
        loading={loading}
      />

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          isOpen={true}
          onClose={() => setEditingCategory(null)}
          onSave={(data) => handleUpdateCategory(editingCategory._id!, data)}
          category={editingCategory}
          loading={loading}
        />
      )}
    </div>
  );
};

// Sortable Category Item Component
interface SortableCategoryItemProps {
  category: MenuCategory;
  index: number;
  onEdit: (category: MenuCategory) => void;
  onDelete: (categoryId: string) => void;
  onToggleVisibility: (categoryId: string, isActive: boolean) => void;
}

const SortableCategoryItem: React.FC<SortableCategoryItemProps> = ({
  category,
  index,
  onEdit,
  onDelete,
  onToggleVisibility,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
        isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
      } ${!category.isActive ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center space-x-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <GripVertical size={20} className="text-gray-400" />
        </div>

        {/* Category Image */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image size={20} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {category.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                category.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-sm text-gray-500">
                {category.items?.length || 0} items
              </span>
            </div>
          </div>
          {category.description && (
            <p className="text-gray-600 text-sm truncate">
              {category.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (category._id) {
                onToggleVisibility(category._id, !category.isActive);
              } else {
                console.error('Category ID is missing for toggle visibility');
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={category.isActive ? 'Hide category' : 'Show category'}
            disabled={!category._id}
          >
            {category.isActive ? (
              <Eye size={18} className="text-gray-600" />
            ) : (
              <EyeOff size={18} className="text-gray-400" />
            )}
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit category"
            disabled={!category._id}
          >
            <Edit2 size={18} className="text-gray-600" />
          </button>
          <button
            onClick={() => {
              if (category._id) {
                onDelete(category._id);
              } else {
                console.error('Category ID is missing for delete');
              }
            }}
            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
            title="Delete category"
            disabled={!category._id}
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Create Category Modal Component
interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCategoryRequest) => void;
  menuId: string;
  restaurantId: string;
  loading: boolean;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  menuId,
  restaurantId,
  loading,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...formData,
      menuId,
      restaurantId,
    });
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
    });
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Category">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="floating-input">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder=" "
            className="peer"
            required
          />
          <label>Category Name</label>
        </div>

        <div className="floating-input">
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder=" "
            rows={3}
            className="peer resize-none"
          />
          <label>Description (optional)</label>
        </div>

        <div className="floating-input">
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder=" "
            className="peer"
          />
          <label>Image URL (optional)</label>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading}
            icon={<Save size={18} />}
          >
            Create Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Edit Category Modal Component
interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateCategoryRequest) => void;
  category: MenuCategory;
  loading: boolean;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  loading,
}) => {
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || '',
    image: category.image || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Category">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="floating-input">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder=" "
            className="peer"
            required
          />
          <label>Category Name</label>
        </div>

        <div className="floating-input">
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder=" "
            rows={3}
            className="peer resize-none"
          />
          <label>Description (optional)</label>
        </div>

        <div className="space-y-2">
          <div className="floating-input">
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder=" "
              className="peer"
            />
            <label>Image URL (optional)</label>
          </div>
          {category.image && (
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <img 
                src={category.image} 
                alt="Current category" 
                className="w-8 h-8 rounded object-cover"
              />
              <span className="text-sm text-gray-600">Current image will be kept if no new URL is provided</span>
            </div>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading}
            icon={<Save size={18} />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryManager;