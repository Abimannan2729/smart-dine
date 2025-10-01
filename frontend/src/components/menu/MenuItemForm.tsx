import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Upload, 
  Clock, 
  Flame, 
  Camera,
  X,
  Plus,
  Minus,
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import { 
  MenuItem, 
  MenuCategory, 
  CreateMenuItemRequest, 
  UpdateMenuItemRequest,
  DIETARY_TAGS,
  DietaryTag
} from '../../types/menu';
import { menuService } from '../../services/menuService';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import notifications from '../../utils/notifications';

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateMenuItemRequest | UpdateMenuItemRequest) => Promise<void>;
  categories: MenuCategory[];
  item?: MenuItem | null; // null for create, MenuItem for edit
  loading?: boolean;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  item,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    categoryId: '',
    dietaryTags: [] as string[],
    ingredients: [] as string[],
    allergens: [] as string[],
    preparationTime: '',
    calories: '',
    spicyLevel: 0 as 0 | 1 | 2 | 3,
    isPopular: false,
    isFeatured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [newAllergen, setNewAllergen] = useState('');

  const isEditMode = !!item;

  // Initialize form with item data if editing
  useEffect(() => {
    if (isEditMode && item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        originalPrice: item.originalPrice?.toString() || '',
        image: item.image || '',
        categoryId: item.category,
        dietaryTags: item.dietaryTags?.map(tag => 
          typeof tag === 'string' ? tag : tag.id
        ) || [],
        ingredients: item.ingredients || [],
        allergens: item.allergens || [],
        preparationTime: item.preparationTime?.toString() || '',
        calories: item.calories?.toString() || '',
        spicyLevel: item.spicyLevel || 0,
        isPopular: item.isPopular || false,
        isFeatured: item.isFeatured || false,
      });
    } else if (!isEditMode) {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        image: '',
        categoryId: categories.length > 0 ? categories[0]._id! : '',
        dietaryTags: [],
        ingredients: [],
        allergens: [],
        preparationTime: '',
        calories: '',
        spicyLevel: 0,
        isPopular: false,
        isFeatured: false,
      });
    }
    setErrors({});
  }, [isEditMode, item, categories, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.originalPrice && (isNaN(Number(formData.originalPrice)) || Number(formData.originalPrice) <= 0)) {
      newErrors.originalPrice = 'Original price must be a valid positive number';
    }

    if (formData.originalPrice && Number(formData.originalPrice) <= Number(formData.price)) {
      newErrors.originalPrice = 'Original price must be higher than current price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        preparationTime: formData.preparationTime ? Number(formData.preparationTime) : undefined,
        calories: formData.calories ? Number(formData.calories) : undefined,
      };

      await onSave(submitData);
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageUpload called');
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notifications.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      notifications.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await menuService.uploadImage(file);
      setFormData({ ...formData, image: imageUrl });
      notifications.success('Image uploaded successfully');
    } catch (error) {
      console.error('Failed to upload image:', error);
      notifications.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadButtonClick = () => {
    console.log('Upload button clicked');
    const fileInput = document.getElementById('menu-item-image-upload') as HTMLInputElement;
    if (fileInput) {
      console.log('File input found, triggering click');
      fileInput.click();
    } else {
      console.error('File input not found');
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredients.includes(newIngredient.trim())) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()]
      });
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const addAllergen = () => {
    if (newAllergen.trim() && !formData.allergens.includes(newAllergen.trim())) {
      setFormData({
        ...formData,
        allergens: [...formData.allergens, newAllergen.trim()]
      });
      setNewAllergen('');
    }
  };

  const removeAllergen = (index: number) => {
    setFormData({
      ...formData,
      allergens: formData.allergens.filter((_, i) => i !== index)
    });
  };

  const toggleDietaryTag = (tagId: string) => {
    const isSelected = formData.dietaryTags.includes(tagId);
    setFormData({
      ...formData,
      dietaryTags: isSelected
        ? formData.dietaryTags.filter(id => id !== tagId)
        : [...formData.dietaryTags, tagId]
    });
  };

  const spicyLevels = [
    { value: 0, label: 'Not Spicy', emoji: '😊' },
    { value: 1, label: 'Mild', emoji: '🌶️' },
    { value: 2, label: 'Medium', emoji: '🌶️🌶️' },
    { value: 3, label: 'Hot', emoji: '🌶️🌶️🌶️' },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className="floating-input">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder=" "
                className={`peer ${errors.name ? 'border-red-500' : ''}`}
                required
              />
              <label>Item Name *</label>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          <div className="floating-input">
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className={`peer ${errors.categoryId ? 'border-red-500' : ''}`}
              required
            >
              <option value="" disabled>Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <label>Category *</label>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.categoryId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="floating-input">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder=" "
                className={`peer ${errors.price ? 'border-red-500' : ''}`}
                required
              />
              <label className="flex items-center">
                <IndianRupee size={14} className="mr-1" />
                Price *
              </label>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.price}
                </p>
              )}
            </div>

            <div className="floating-input">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder=" "
                className={`peer ${errors.originalPrice ? 'border-red-500' : ''}`}
              />
              <label className="flex items-center">
                <IndianRupee size={14} className="mr-1" />
                Original Price
              </label>
              {errors.originalPrice && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.originalPrice}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="floating-input">
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder=" "
            rows={3}
            className="peer resize-none"
          />
          <label>Description</label>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Item Image</label>
          
          {formData.image && (
            <div className="relative inline-block">
              <img
                src={formData.image}
                alt="Item preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, image: '' })}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex space-x-3">
            <div className="floating-input flex-1">
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder=" "
                className="peer"
              />
              <label>Image URL</label>
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
                id="menu-item-image-upload"
              />
              <Button
                type="button"
                variant="outline"
                loading={uploadingImage}
                icon={<Camera size={16} />}
                onClick={handleUploadButtonClick}
                disabled={uploadingImage}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="floating-input">
            <input
              type="number"
              min="0"
              value={formData.preparationTime}
              onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
              placeholder=" "
              className="peer"
            />
            <label className="flex items-center">
              <Clock size={14} className="mr-1" />
              Prep Time (min)
            </label>
          </div>

          <div className="floating-input">
            <input
              type="number"
              min="0"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              placeholder=" "
              className="peer"
            />
            <label>Calories</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Flame size={14} className="inline mr-1" />
              Spicy Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {spicyLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, spicyLevel: level.value as 0 | 1 | 2 | 3 })}
                  className={`p-2 text-xs rounded-lg border transition-colors ${
                    formData.spicyLevel === level.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>{level.emoji}</div>
                  <div>{level.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dietary Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Tags</label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleDietaryTag(tag.id)}
                className={`flex items-center px-3 py-2 text-sm rounded-full border transition-colors ${
                  formData.dietaryTags.includes(tag.id)
                    ? `border-${tag.color}-500 bg-${tag.color}-50 text-${tag.color}-700`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="mr-1">{tag.icon}</span>
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                placeholder="Add ingredient..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
                icon={<Plus size={16} />}
              >
                Add
              </Button>
            </div>
            
            {formData.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Allergens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
                placeholder="Add allergen..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAllergen}
                icon={<Plus size={16} />}
              >
                Add
              </Button>
            </div>
            
            {formData.allergens.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.allergens.map((allergen, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                  >
                    ⚠️ {allergen}
                    <button
                      type="button"
                      onClick={() => removeAllergen(index)}
                      className="ml-1 text-red-400 hover:text-red-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Flags */}
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Popular Item</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Featured Item</span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200">
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
            {isEditMode ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MenuItemForm;