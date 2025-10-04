import { Menu, MenuCategory, MenuItem, DIETARY_TAGS } from '../types/menu';

// Demo restaurant data
export const demoRestaurant = {
  _id: 'demo-restaurant-id',
  name: 'The Golden Fork',
  description: 'Fine dining experience with modern cuisine and exceptional service',
  logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop&crop=face',
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop',
  cuisine: ['Italian', 'Mediterranean', 'Modern'],
  theme: {
    primaryColor: '#dc2626',
    secondaryColor: '#f97316',
    fontFamily: 'Inter',
    layout: 'modern' as const
  },
  address: {
    street: '123 Culinary Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA'
  },
  contact: {
    phone: '+1 (555) 123-4567',
    email: 'hello@goldenfork.com',
    website: 'www.goldenfork.com'
  },
  operatingHours: {
    monday: { open: '11:00', close: '22:00', isOpen: true },
    tuesday: { open: '11:00', close: '22:00', isOpen: true },
    wednesday: { open: '11:00', close: '22:00', isOpen: true },
    thursday: { open: '11:00', close: '22:00', isOpen: true },
    friday: { open: '11:00', close: '23:00', isOpen: true },
    saturday: { open: '10:00', close: '23:00', isOpen: true },
    sunday: { open: '10:00', close: '21:00', isOpen: true },
  }
};

// Demo menu items
const demoMenuItems: MenuItem[] = [
  // Appetizers
  {
    _id: 'item-1',
    name: 'Truffle Arancini',
    description: 'Crispy risotto balls filled with truffle cheese, served with garlic aioli',
    price: 1200,
    category: 'appetizers',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [DIETARY_TAGS.find(tag => tag.id === 'vegetarian') || { id: 'vegetarian', name: 'Vegetarian', icon: '🥬', color: 'green' }],
    preparationTime: 15,
    calories: 320,
    isPopular: true,
    ingredients: ['Arborio rice', 'Truffle cheese', 'Panko breadcrumbs', 'Garlic', 'Aioli'],
    allergens: ['Dairy', 'Gluten'],
    sortOrder: 1
  },
  {
    _id: 'item-2',
    name: 'Pan-Seared Scallops',
    description: 'Fresh sea scallops with cauliflower purée and pancetta crisps',
    price: 1800,
    category: 'appetizers',
    image: 'https://images.unsplash.com/photo-1559847844-d445cb8d6810?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [DIETARY_TAGS.find(tag => tag.id === 'gluten-free') || { id: 'gluten-free', name: 'Gluten Free', icon: '🌾', color: 'amber' }],
    preparationTime: 20,
    calories: 280,
    isFeatured: true,
    ingredients: ['Sea scallops', 'Cauliflower', 'Pancetta', 'Butter', 'Herbs'],
    allergens: ['Shellfish', 'Dairy'],
    sortOrder: 2
  },
  {
    _id: 'item-3',
    name: 'Burrata Caprese',
    description: 'Creamy burrata with heirloom tomatoes, basil, and aged balsamic',
    price: 1350,
    category: 'appetizers',
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [
      DIETARY_TAGS.find(tag => tag.id === 'vegetarian') || { id: 'vegetarian', name: 'Vegetarian', icon: '🥬', color: 'green' },
      DIETARY_TAGS.find(tag => tag.id === 'gluten-free') || { id: 'gluten-free', name: 'Gluten Free', icon: '🌾', color: 'amber' }
    ],
    preparationTime: 10,
    calories: 250,
    ingredients: ['Burrata cheese', 'Heirloom tomatoes', 'Fresh basil', 'Balsamic vinegar'],
    allergens: ['Dairy'],
    sortOrder: 3
  },
  
  // Main Courses
  {
    _id: 'item-4',
    name: 'Wagyu Beef Ribeye',
    description: 'Premium A5 Wagyu ribeye with roasted vegetables and red wine jus',
    price: 6500,
    originalPrice: 7000,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [DIETARY_TAGS.find(tag => tag.id === 'gluten-free') || { id: 'gluten-free', name: 'Gluten Free', icon: '🌾', color: 'amber' }],
    preparationTime: 25,
    calories: 650,
    isPopular: true,
    isFeatured: true,
    ingredients: ['Wagyu ribeye', 'Seasonal vegetables', 'Red wine', 'Herbs'],
    allergens: [],
    sortOrder: 1
  },
  {
    _id: 'item-5',
    name: 'Pan-Roasted Salmon',
    description: 'Atlantic salmon with lemon herb crust, quinoa, and roasted asparagus',
    price: 2400,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [
      DIETARY_TAGS.find(tag => tag.id === 'gluten-free') || { id: 'gluten-free', name: 'Gluten Free', icon: '🌾', color: 'amber' },
      DIETARY_TAGS.find(tag => tag.id === 'high-protein')!
    ],
    preparationTime: 18,
    calories: 480,
    ingredients: ['Atlantic salmon', 'Quinoa', 'Asparagus', 'Lemon', 'Fresh herbs'],
    allergens: ['Fish'],
    sortOrder: 2
  },
  {
    _id: 'item-6',
    name: 'Lobster Risotto',
    description: 'Creamy saffron risotto with fresh lobster meat and microgreens',
    price: 3200,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [DIETARY_TAGS.find(tag => tag.id === 'gluten-free') || { id: 'gluten-free', name: 'Gluten Free', icon: '🌾', color: 'amber' }],
    preparationTime: 30,
    calories: 580,
    isPopular: true,
    ingredients: ['Fresh lobster', 'Arborio rice', 'Saffron', 'Parmesan', 'Microgreens'],
    allergens: ['Shellfish', 'Dairy'],
    sortOrder: 3
  },

  // Desserts
  {
    _id: 'item-7',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, vanilla ice cream, and berries',
    price: 950,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [DIETARY_TAGS.find(tag => tag.id === 'vegetarian') || { id: 'vegetarian', name: 'Vegetarian', icon: '🥬', color: 'green' }],
    preparationTime: 12,
    calories: 450,
    isPopular: true,
    ingredients: ['Dark chocolate', 'Butter', 'Eggs', 'Vanilla ice cream', 'Mixed berries'],
    allergens: ['Dairy', 'Eggs', 'Gluten'],
    sortOrder: 1
  },
  {
    _id: 'item-8',
    name: 'Tiramisu',
    description: 'Classic Italian tiramisu with espresso-soaked ladyfingers and mascarpone',
    price: 850,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [DIETARY_TAGS.find(tag => tag.id === 'vegetarian') || { id: 'vegetarian', name: 'Vegetarian', icon: '🥬', color: 'green' }],
    preparationTime: 5,
    calories: 380,
    ingredients: ['Mascarpone', 'Ladyfingers', 'Espresso', 'Cocoa powder', 'Sugar'],
    allergens: ['Dairy', 'Eggs', 'Gluten'],
    sortOrder: 2
  },

  // Beverages
  {
    _id: 'item-9',
    name: 'Craft Beer Selection',
    description: 'Rotating selection of local craft beers',
    price: 650,
    category: 'beverages',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [DIETARY_TAGS.find(tag => tag.id === 'vegan') || { id: 'vegan', name: 'Vegan', icon: '🌱', color: 'green' }],
    ingredients: ['Various local craft beers'],
    allergens: ['Gluten'],
    sortOrder: 1
  },
  {
    _id: 'item-10',
    name: 'House Wine',
    description: 'Curated selection of red and white wines',
    price: 950,
    category: 'beverages',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [
      DIETARY_TAGS.find(tag => tag.id === 'vegan') || { id: 'vegan', name: 'Vegan', icon: '🌱', color: 'green' },
      DIETARY_TAGS.find(tag => tag.id === 'gluten-free') || { id: 'gluten-free', name: 'Gluten Free', icon: '🌾', color: 'amber' }
    ],
    ingredients: ['Premium wine selection'],
    allergens: ['Sulfites'],
    sortOrder: 2
  },
  {
    _id: 'item-11',
    name: 'Artisan Coffee',
    description: 'Single-origin coffee beans, expertly roasted and brewed',
    price: 350,
    category: 'beverages',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&h=200&fit=crop',
    isAvailable: true,
    dietaryTags: [
      DIETARY_TAGS.find(tag => tag.id === 'vegan') || { id: 'vegan', name: 'Vegan', icon: '🌱', color: 'green' },
      DIETARY_TAGS.find(tag => tag.id === 'gluten-free') || { id: 'gluten-free', name: 'Gluten Free', icon: '🌾', color: 'amber' }
    ],
    ingredients: ['Single-origin coffee beans'],
    allergens: [],
    sortOrder: 3
  }
];

// Demo menu categories
const demoMenuCategories: MenuCategory[] = [
  {
    _id: 'appetizers',
    name: 'Appetizers',
    description: 'Start your dining experience with our carefully crafted starters',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=200&fit=crop',
    isActive: true,
    sortOrder: 1,
    items: demoMenuItems.filter(item => item.category === 'appetizers')
  },
  {
    _id: 'mains',
    name: 'Main Courses',
    description: 'Our signature dishes and chef\'s specialties',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=200&fit=crop',
    isActive: true,
    sortOrder: 2,
    items: demoMenuItems.filter(item => item.category === 'mains')
  },
  {
    _id: 'desserts',
    name: 'Desserts',
    description: 'Sweet endings to your perfect meal',
    image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=400&h=200&fit=crop',
    isActive: true,
    sortOrder: 3,
    items: demoMenuItems.filter(item => item.category === 'desserts')
  },
  {
    _id: 'beverages',
    name: 'Beverages',
    description: 'Carefully curated wine, beer, and coffee selection',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=200&fit=crop',
    isActive: true,
    sortOrder: 4,
    items: demoMenuItems.filter(item => item.category === 'beverages')
  }
];

// Complete demo menu
export const demoMenu: Menu = {
  _id: 'demo-menu-id',
  name: 'Golden Fork Menu',
  description: 'Experience our curated selection of fine dining favorites',
  isActive: true,
  categories: demoMenuCategories,
  restaurant: demoRestaurant,
  settings: {
    currency: 'INR',
    showPrices: true,
    showImages: true,
    showDescriptions: true,
    showDietaryTags: true,
    showIngredients: true,
    showCalories: true,
    showPreparationTime: true,
    showSpicyLevel: false,
    allowCustomization: true,
    showAvailability: true,
    theme: {
      primaryColor: '#dc2626',
      secondaryColor: '#f97316',
      fontFamily: 'Inter',
      layout: 'grid' as const
    }
  },
  stats: {
    totalViews: 2547,
    totalOrders: 189,
    popularItems: ['item-1', 'item-4', 'item-7'],
    averageViewTime: 245
  }
};

// QR Code URL for demo menu - will be constructed dynamically in the component
export const demoQRCodePath = '/menu/demo';

export default demoMenu;