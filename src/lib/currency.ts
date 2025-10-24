/**
 * Currency formatting utilities for Indian Rupees (INR)
 */

export const CURRENCY_SYMBOL = '₹'
export const CURRENCY_CODE = 'INR'

/**
 * Format a number as Indian Rupees with proper comma separation
 * @param amount - The amount to format
 * @param showSymbol - Whether to include the ₹ symbol (default: true)
 * @returns Formatted currency string
 */
export function formatINR(amount: number, showSymbol: boolean = true): string {
  const formatted = amount.toLocaleString('en-IN')
  return showSymbol ? `₹${formatted}` : formatted
}

/**
 * Format a price with period (monthly/yearly)
 * @param amount - The amount to format
 * @param period - The billing period
 * @returns Formatted price string with period
 */
export function formatPriceWithPeriod(amount: number, period: 'monthly' | 'yearly'): string {
  const formatted = formatINR(amount)
  const periodText = period === 'monthly' ? 'month' : 'year'
  return `${formatted}/${periodText}`
}

/**
 * Calculate and format yearly savings
 * @param monthlyPrice - Monthly price
 * @param yearlyPrice - Yearly price
 * @returns Formatted savings string
 */
export function formatYearlySavings(monthlyPrice: number, yearlyPrice: number): string {
  const monthlyTotal = monthlyPrice * 12
  const savings = monthlyTotal - yearlyPrice
  return formatINR(savings)
}

/**
 * Format price range for display
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  return `${formatINR(minPrice)} - ${formatINR(maxPrice)}`
}

/**
 * Convert USD to INR (approximate conversion for display purposes)
 * Note: In a real application, you'd use a live exchange rate API
 * @param usdAmount - Amount in USD
 * @param exchangeRate - USD to INR exchange rate (default: 83)
 * @returns Amount in INR
 */
export function convertUSDToINR(usdAmount: number, exchangeRate: number = 83): number {
  return Math.round(usdAmount * exchangeRate)
}

/**
 * Get appropriate pricing tier labels for Indian market
 */
export const PRICING_TIERS = {
  starter: {
    label: 'Starter',
    description: 'Perfect for individuals and freelancers',
    targetAudience: 'Individual users, small freelancers'
  },
  professional: {
    label: 'Professional', 
    description: 'Best for growing businesses and teams',
    targetAudience: 'Small to medium businesses, teams'
  },
  enterprise: {
    label: 'Enterprise',
    description: 'For large organizations with advanced needs',
    targetAudience: 'Large enterprises, corporations'
  }
} as const