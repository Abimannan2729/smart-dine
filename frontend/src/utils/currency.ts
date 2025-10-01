/**
 * Currency formatting utilities for Smart Dine
 * Handles Indian Rupee (INR) formatting with proper localization
 */

export const CURRENCY_CODE = 'INR';
export const CURRENCY_SYMBOL = '₹';

/**
 * Format a number as Indian Rupee currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options || {};

  // Format number with Indian number system (lakhs, crores)
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  if (!showSymbol) {
    // Remove currency symbol and return just the number
    return formattedNumber.replace(/₹\s?/, '').trim();
  }

  return formattedNumber;
};

/**
 * Format a price for display in components
 * @param price - The price to format
 * @param showDecimals - Whether to show decimal places
 * @returns Formatted price string
 */
export const formatPrice = (price: number, showDecimals: boolean = true): string => {
  if (showDecimals || price % 1 !== 0) {
    return formatCurrency(price, { maximumFractionDigits: 2 });
  }
  return formatCurrency(price, { maximumFractionDigits: 0 });
};

/**
 * Convert USD prices to approximate INR prices
 * @param usdPrice - Price in USD
 * @param exchangeRate - USD to INR exchange rate (default: 83)
 * @returns Converted price in INR
 */
export const convertUSDToINR = (usdPrice: number, exchangeRate: number = 83): number => {
  return Math.round(usdPrice * exchangeRate);
};

/**
 * Get currency symbol
 * @returns Currency symbol
 */
export const getCurrencySymbol = (): string => {
  return CURRENCY_SYMBOL;
};

/**
 * Get currency code
 * @returns Currency code
 */
export const getCurrencyCode = (): string => {
  return CURRENCY_CODE;
};

/**
 * Format a price range (min - max)
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string
 */
export const formatPriceRange = (minPrice: number, maxPrice: number): string => {
  const min = formatPrice(minPrice);
  const max = formatPrice(maxPrice);
  return `${min} - ${max}`;
};