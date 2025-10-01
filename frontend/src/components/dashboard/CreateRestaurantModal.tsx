import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Upload, MapPin, Phone, Mail, Globe, Clock, Camera } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import Button from '../ui/Button';
import FloatingInput from '../ui/FloatingInput';

const restaurantSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Restaurant name must be at least 2 characters')
    .max(100, 'Restaurant name cannot be more than 100 characters')
    .required('Restaurant name is required'),
  description: yup
    .string()
    .max(500, 'Description cannot be more than 500 characters'),
  street: yup.string(),
  city: yup.string(),
  state: yup.string(),
  zipCode: yup.string(),
  country: yup.string().default('US'),
  phone: yup.string(),
  email: yup.string().email('Please enter a valid email'),
  website: yup.string().url('Please enter a valid website URL'),
  primaryColor: yup.string().default('#dc2626'),
  secondaryColor: yup.string().default('#fbbf24'),
  layout: yup.string().oneOf(['grid', 'list', 'card']).default('grid'),
});

interface FormData {
  name: string;
  description?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  primaryColor?: string;
  secondaryColor?: string;
  layout?: 'grid' | 'list' | 'card';
}

interface CreateRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRestaurantModal: React.FC<CreateRestaurantModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const { createRestaurant, state } = useRestaurant();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(restaurantSchema),
    defaultValues: {
      country: 'US',
      primaryColor: '#dc2626',
      secondaryColor: '#fbbf24',
      layout: 'grid',
    }
  });

  const primaryColor = watch('primaryColor');
  const secondaryColor = watch('secondaryColor');

  const handleClose = () => {
    reset();
    setStep(1);
    setLogoPreview(null);
    setCoverPreview(null);
    setLogoFile(null);
    setCoverFile(null);
    onClose();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const restaurantData = {
        name: data.name,
        description: data.description || '',
        address: {
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          country: data.country || 'US',
        },
        contact: {
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
        },
        operatingHours: {
          monday: { open: '09:00', close: '22:00', isOpen: true },
          tuesday: { open: '09:00', close: '22:00', isOpen: true },
          wednesday: { open: '09:00', close: '22:00', isOpen: true },
          thursday: { open: '09:00', close: '22:00', isOpen: true },
          friday: { open: '09:00', close: '22:00', isOpen: true },
          saturday: { open: '09:00', close: '22:00', isOpen: true },
          sunday: { open: '10:00', close: '21:00', isOpen: true },
        },
        cuisine: [],
        features: [],
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: '',
        },
        theme: {
          primaryColor: data.primaryColor || '#dc2626',
          secondaryColor: data.secondaryColor || '#fbbf24',
          fontFamily: 'Inter',
          layout: data.layout || 'grid',
        },
        logo: logoFile || undefined,
        coverImage: coverFile || undefined,
      };

      await createRestaurant(restaurantData);
      handleClose();
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Restaurant</h2>
                <p className="text-sm text-gray-600">Step {step} of 3</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-600 to-secondary-500"
                initial={{ width: '33%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
                        <p className="text-gray-600">Let's start with the basics about your restaurant.</p>
                      </div>

                      <FloatingInput
                        {...register('name')}
                        label="Restaurant Name"
                        type="text"
                        icon={<MapPin size={20} />}
                        error={errors.name?.message}
                        autoComplete="organization"
                      />

                      <div className="relative">
                        <textarea
                          {...register('description')}
                          placeholder=" "
                          rows={4}
                          className="w-full px-4 pt-6 pb-2 text-gray-900 bg-transparent border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 transition-all duration-300 resize-none"
                        />
                        <label className="absolute left-4 top-4 text-gray-500 transition-all duration-300 origin-left pointer-events-none">
                          Restaurant Description (Optional)
                        </label>
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FloatingInput
                          {...register('street')}
                          label="Street Address"
                          type="text"
                          icon={<MapPin size={20} />}
                          error={errors.street?.message}
                        />

                        <FloatingInput
                          {...register('city')}
                          label="City"
                          type="text"
                          error={errors.city?.message}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FloatingInput
                          {...register('state')}
                          label="State"
                          type="text"
                          error={errors.state?.message}
                        />

                        <FloatingInput
                          {...register('zipCode')}
                          label="ZIP Code"
                          type="text"
                          error={errors.zipCode?.message}
                        />

                        <FloatingInput
                          {...register('country')}
                          label="Country"
                          type="text"
                          error={errors.country?.message}
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                        <p className="text-gray-600">How can customers reach you?</p>
                      </div>

                      <FloatingInput
                        {...register('phone')}
                        label="Phone Number"
                        type="tel"
                        icon={<Phone size={20} />}
                        error={errors.phone?.message}
                      />

                      <FloatingInput
                        {...register('email')}
                        label="Email Address"
                        type="email"
                        icon={<Mail size={20} />}
                        error={errors.email?.message}
                      />

                      <FloatingInput
                        {...register('website')}
                        label="Website URL"
                        type="url"
                        icon={<Globe size={20} />}
                        error={errors.website?.message}
                        placeholder="https://yourrestaurant.com"
                      />
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Branding & Images</h3>
                        <p className="text-gray-600">Make your restaurant look amazing!</p>
                      </div>

                      {/* Logo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Restaurant Logo</label>
                        <div
                          onClick={() => logoInputRef.current?.click()}
                          className="relative w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 transition-colors group"
                        >
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-primary-500">
                              <Camera size={24} />
                              <span className="text-sm mt-2">Upload Logo</span>
                            </div>
                          )}
                        </div>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </div>

                      {/* Cover Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Cover Image</label>
                        <div
                          onClick={() => coverInputRef.current?.click()}
                          className="relative h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 transition-colors group"
                        >
                          {coverPreview ? (
                            <img
                              src={coverPreview}
                              alt="Cover preview"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-primary-500">
                              <Upload size={24} />
                              <span className="text-sm mt-2">Upload Cover Image</span>
                            </div>
                          )}
                        </div>
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </div>

                      {/* Theme Colors */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                          <div className="flex items-center space-x-3">
                            <input
                              {...register('primaryColor')}
                              type="color"
                              className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="text-sm text-gray-600">Brand Color</div>
                              <div className="text-xs text-gray-500">{primaryColor}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                          <div className="flex items-center space-x-3">
                            <input
                              {...register('secondaryColor')}
                              type="color"
                              className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="text-sm text-gray-600">Accent Color</div>
                              <div className="text-xs text-gray-500">{secondaryColor}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Layout Style */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Menu Layout</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['grid', 'list', 'card'].map((layout) => (
                            <label key={layout} className="cursor-pointer">
                              <input
                                {...register('layout')}
                                type="radio"
                                value={layout}
                                className="sr-only"
                              />
                              <div className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary-500 transition-colors peer-checked:border-primary-600 peer-checked:bg-primary-50">
                                <div className="text-sm font-medium text-gray-900 capitalize">{layout}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {layout === 'grid' && 'Grid layout style'}
                                  {layout === 'list' && 'List view style'}
                                  {layout === 'card' && 'Card display style'}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                {step > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-3">
                {step < 3 ? (
                  <Button onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    loading={state.loading}
                  >
                    Create Restaurant
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateRestaurantModal;