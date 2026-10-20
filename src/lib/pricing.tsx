import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const BASE_CURRENCY = "ZAR";

export const LANGUAGE_OPTIONS = [
  { code: "en-ZA", label: "English (South Africa)" },
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "af-ZA", label: "Afrikaans" },
  { code: "ar", label: "Arabic" },
  { code: "de-DE", label: "German" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "hi-IN", label: "Hindi" },
  { code: "it-IT", label: "Italian" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "nl-NL", label: "Dutch" },
  { code: "pt-PT", label: "Portuguese" },
  { code: "ru-RU", label: "Russian" },
  { code: "tr-TR", label: "Turkish" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
];

const DEFAULT_LANGUAGE = "en-ZA";
const DEFAULT_COUNTRY = "ZA";

export type CountryOption = {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
};

type PricingPreferences = {
  language: string;
  currency: string;
  countryCode: string;
  setLanguage: (language: string) => void;
  setCurrency: (currency: string) => void;
  setCountryPreference: (countryCode: string, currency: string) => void;
};

const PricingPreferencesContext = createContext<PricingPreferences | null>(
  null,
);

const FALLBACK_RATES: Record<string, number> = {
  ZAR: 1,
  USD: 0.055,
  EUR: 0.051,
  GBP: 0.044,
  AUD: 0.084,
  CAD: 0.075,
  CHF: 0.049,
  CNY: 0.4,
  AED: 0.2,
  INR: 4.6,
  JPY: 8.5,
  NZD: 0.091,
};

const FALLBACK_COUNTRIES: CountryOption[] = [
  { code: "ZA", name: "South Africa", flag: "", currency: "ZAR", symbol: "R" },
  { code: "US", name: "United States", flag: "", currency: "USD", symbol: "$" },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "",
    currency: "GBP",
    symbol: "GBP",
  },
  {
    code: "EU",
    name: "European Union",
    flag: "",
    currency: "EUR",
    symbol: "EUR",
  },
  { code: "AU", name: "Australia", flag: "", currency: "AUD", symbol: "$" },
  { code: "CA", name: "Canada", flag: "", currency: "CAD", symbol: "$" },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "",
    currency: "AED",
    symbol: "AED",
  },
  { code: "IN", name: "India", flag: "", currency: "INR", symbol: "INR" },
  { code: "JP", name: "Japan", flag: "", currency: "JPY", symbol: "JPY" },
];

type RestCountry = {
  cca2: string;
  flag?: string;
  name: {
    common: string;
  };
  currencies?: Record<string, { symbol?: string }>;
};

type SupportedValuesIntl = typeof Intl & {
  supportedValuesOf?: (key: "currency") => string[];
};

export function getSupportedCurrencies() {
  const currencies =
    (Intl as SupportedValuesIntl).supportedValuesOf?.("currency") ??
    Object.keys(FALLBACK_RATES);

  return Array.from(new Set([BASE_CURRENCY, ...currencies])).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function useCurrencyRates() {
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`https://open.er-api.com/v6/latest/${BASE_CURRENCY}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load currency rates");
        return response.json() as Promise<{ rates?: Record<string, number> }>;
      })
      .then((data) => {
        if (!data.rates) throw new Error("Currency rates missing");
        setRates({ ...FALLBACK_RATES, ...data.rates, [BASE_CURRENCY]: 1 });
        setIsUsingFallback(false);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setIsUsingFallback(true);
      });

    return () => controller.abort();
  }, []);

  return { rates, isUsingFallback };
}

export function useCountries() {
  const [countries, setCountries] =
    useState<CountryOption[]>(FALLBACK_COUNTRIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,currencies,flag",
      {
        signal: controller.signal,
      },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Could not load country list");
        return response.json() as Promise<RestCountry[]>;
      })
      .then((data) => {
        const nextCountries = data
          .map((country) => {
            const currency = Object.keys(country.currencies ?? {})[0];
            if (!currency) return null;

            return {
              code: country.cca2,
              name: country.name.common,
              flag: country.flag ?? "",
              currency,
              symbol: country.currencies?.[currency]?.symbol ?? currency,
            };
          })
          .filter((country): country is CountryOption => Boolean(country))
          .sort((a, b) => a.name.localeCompare(b.name));

        if (nextCountries.length) setCountries(nextCountries);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  return { countries, isLoading };
}

export function usePriceFormatter(
  language: string,
  currency: string,
  rates: Record<string, number>,
) {
  return useMemo(() => {
    const formatter = new Intl.NumberFormat(language, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

    return (priceZar: number) => {
      const convertedPrice = priceZar * (rates[currency] ?? 1);
      return formatter.format(convertedPrice);
    };
  }, [currency, language, rates]);
}

export function PricingPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState(BASE_CURRENCY);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("RA2-language");
    const savedCurrency = window.localStorage.getItem("RA2-currency");
    const savedCountry = window.localStorage.getItem("RA2-country");

    if (savedLanguage) setLanguageState(savedLanguage);
    if (savedCurrency) setCurrencyState(savedCurrency);
    if (savedCountry) setCountryCode(savedCountry);
  }, []);

  const setLanguage = (nextLanguage: string) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("RA2-language", nextLanguage);
  };

  const setCurrency = (nextCurrency: string) => {
    setCurrencyState(nextCurrency);
    window.localStorage.setItem("RA2-currency", nextCurrency);
  };

  const setCountryPreference = (
    nextCountryCode: string,
    nextCurrency: string,
  ) => {
    setCountryCode(nextCountryCode);
    setCurrency(nextCurrency);
    window.localStorage.setItem("RA2-country", nextCountryCode);
  };

  return (
    <PricingPreferencesContext.Provider
      value={{
        language,
        currency,
        countryCode,
        setLanguage,
        setCurrency,
        setCountryPreference,
      }}
    >
      {children}
    </PricingPreferencesContext.Provider>
  );
}

export function usePricingPreferences() {
  const context = useContext(PricingPreferencesContext);
  if (!context) {
    throw new Error(
      "usePricingPreferences must be used within PricingPreferencesProvider",
    );
  }

  return context;
}
