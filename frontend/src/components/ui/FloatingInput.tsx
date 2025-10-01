import React from 'react';
import { motion } from 'framer-motion';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value !== '');
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const inputId = React.useMemo(() => {
    return `input-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  return (
    <div className={`floating-input ${className}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        <input
          {...props}
          id={inputId}
          placeholder=" "
          className={`
            w-full px-4 pt-6 pb-2 text-gray-900 bg-transparent border-2 rounded-lg 
            focus:outline-none transition-all duration-300
            ${icon ? 'pl-10' : 'pl-4'}
            ${error 
              ? 'border-red-300 focus:border-red-500' 
              : focused 
                ? 'border-primary-600' 
                : 'border-gray-200 hover:border-gray-300'
            }
            ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
          onFocus={(e) => {
            setFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          onChange={handleChange}
        />
        <motion.label
          htmlFor={inputId}
          className={`
            absolute left-4 transition-all duration-300 origin-left pointer-events-none
            ${icon ? 'left-10' : 'left-4'}
            ${focused || hasValue || props.value
              ? 'top-1 text-xs scale-75'
              : 'top-4 text-base scale-100'
            }
            ${error
              ? 'text-red-500'
              : focused
                ? 'text-primary-600'
                : 'text-gray-500'
            }
          `}
          animate={{
            scale: focused || hasValue || props.value ? 0.75 : 1,
            y: focused || hasValue || props.value ? -12 : 0
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {label}
        </motion.label>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default FloatingInput;
