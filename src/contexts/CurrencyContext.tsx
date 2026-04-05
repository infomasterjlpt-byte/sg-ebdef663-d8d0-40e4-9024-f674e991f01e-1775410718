import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Currency = "JPY" | "USD" | "BDT" | "NPR" | "INR" | "VND" | "LKR";

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (jpy: number) => string;
  getCurrencySymbol: () => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const EXCHANGE_RATES: Record<Currency, number> = {
  JPY: 1,
  USD: 0.0067,
  BDT: 0.80,
  NPR: 0.87,
  INR: 0.56,
  VND: 169,
  LKR: 2.18,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  JPY: "¥",
  USD: "$",
  BDT: "৳",
  NPR: "₨",
  INR: "₹",
  VND: "₫",
  LKR: "රු",
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("JPY");

  useEffect(() => {
    const saved = localStorage.getItem("currency") as Currency;
    if (saved && EXCHANGE_RATES[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  const convertPrice = (jpy: number): string => {
    const rate = EXCHANGE_RATES[currency];
    const converted = jpy * rate;
    
    if (currency === "JPY" || currency === "VND") {
      return Math.round(converted).toLocaleString();
    }
    
    return converted.toFixed(2);
  };

  const getCurrencySymbol = (): string => {
    return CURRENCY_SYMBOLS[currency];
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, getCurrencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}