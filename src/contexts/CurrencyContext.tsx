'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'JPY';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

interface CurrencyProviderProps {
  children: React.ReactNode;
}

const currencyConfig = {
  USD: { symbol: '$', locale: 'en-US', code: 'USD' },
  EUR: { symbol: '€', locale: 'de-DE', code: 'EUR' },
  GBP: { symbol: '£', locale: 'en-GB', code: 'GBP' },
  CAD: { symbol: 'C$', locale: 'en-CA', code: 'CAD' },
  JPY: { symbol: '¥', locale: 'ja-JP', code: 'JPY' }
};

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrency] = useState<Currency>('USD');

  // Initialize currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('summit-currency') as Currency;
    if (savedCurrency && currencyConfig[savedCurrency]) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('summit-currency', currency);
  }, [currency]);

  const formatAmount = (amount: number): string => {
    const config = currencyConfig[currency];
    
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: currency === 'JPY' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' ? 0 : 2,
      }).format(amount);
    } catch {
      // Fallback formatting if Intl.NumberFormat fails
      const symbol = config.symbol;
      const formatted = amount.toLocaleString(config.locale, {
        minimumFractionDigits: currency === 'JPY' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' ? 0 : 2,
      });
      return `${symbol}${formatted}`;
    }
  };

  const getCurrencySymbol = (): string => {
    return currencyConfig[currency].symbol;
  };

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency: handleSetCurrency, 
      formatAmount, 
      getCurrencySymbol 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}