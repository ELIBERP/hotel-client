// utils/currency.js
// Simple currency conversion utilities

// Exchange rates relative to SGD (Singapore Dollar)
// In a real app, you'd fetch these from an API like exchangerate-api.com
const EXCHANGE_RATES = {
  'SGD': 1.0,        // Base currency
  'USD': 0.74,       // 1 SGD = 0.74 USD
  'EUR': 0.68,       // 1 SGD = 0.68 EUR  
  'GBP': 0.58,       // 1 SGD = 0.58 GBP
  'JPY': 109.5,      // 1 SGD = 109.5 JPY
  'AUD': 1.12,       // 1 SGD = 1.12 AUD
  'CAD': 1.01,       // 1 SGD = 1.01 CAD
  'CNY': 5.35,       // 1 SGD = 5.35 CNY
  'KRW': 980.5,      // 1 SGD = 980.5 KRW
  'THB': 26.8,       // 1 SGD = 26.8 THB
  'HKD': 5.78,       // 1 SGD = 5.78 HKD
  'MYR': 3.48,       // 1 SGD = 3.48 MYR
};

// Supported currencies with display info
export const SUPPORTED_CURRENCIES = [
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
];

/**
 * Convert SGD amount to target currency
 * @param {number} sgdAmount - Amount in Singapore Dollars
 * @param {string} targetCurrency - Target currency code (e.g., 'USD')
 * @returns {number} - Converted amount
 */
export const convertFromSGD = (sgdAmount, targetCurrency) => {
  const rate = EXCHANGE_RATES[targetCurrency.toUpperCase()];
  if (!rate) {
    console.warn(`Exchange rate not found for ${targetCurrency}, using SGD`);
    return sgdAmount;
  }
  
  const convertedAmount = sgdAmount * rate;
  
  // Round to 2 decimal places for most currencies
  // Special handling for zero-decimal currencies like JPY, KRW
  if (['JPY', 'KRW'].includes(targetCurrency.toUpperCase())) {
    return Math.round(convertedAmount);
  }
  
  return Math.round(convertedAmount * 100) / 100;
};

/**
 * Get currency info by code
 * @param {string} currencyCode - Currency code (e.g., 'USD')
 * @returns {object} - Currency info object
 */
export const getCurrencyInfo = (currencyCode) => {
  return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode.toUpperCase()) || 
         SUPPORTED_CURRENCIES[0]; // Default to SGD
};

/**
 * Format amount with proper currency display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted currency string
 */
export const formatCurrencyWithSymbol = (amount, currency) => {
  const currencyInfo = getCurrencyInfo(currency);
  
  // Special formatting for certain currencies
  if (currency === 'JPY' || currency === 'KRW') {
    return `${currencyInfo.flag} ${currencyInfo.symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${currencyInfo.flag} ${currencyInfo.symbol}${amount.toFixed(2)}`;
};

/**
 * Get exchange rate display string
 * @param {number} sgdAmount - Original SGD amount
 * @param {string} targetCurrency - Target currency
 * @returns {string} - Display string like "SGD 500 ≈ USD 370"
 */
export const getExchangeDisplay = (sgdAmount, targetCurrency) => {
  if (targetCurrency === 'SGD') return '';
  
  const convertedAmount = convertFromSGD(sgdAmount, targetCurrency);
  const sgdInfo = getCurrencyInfo('SGD');
  const targetInfo = getCurrencyInfo(targetCurrency);
  
  return `${sgdInfo.symbol}${sgdAmount} ≈ ${targetInfo.symbol}${convertedAmount.toFixed(2)}`;
};
