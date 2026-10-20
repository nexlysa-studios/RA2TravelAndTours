import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useCountries, usePricingPreferences } from "@/lib/pricing";

const getFlagUrl = (countryCode: string, width = 40) =>
  `https://flagcdn.com/w${width}/${countryCode.toLowerCase()}.png`;

function FlagImage({ code, name }: { code: string; name: string }) {
  return (
    <span className="sm-country-flag">
      <img
        src={getFlagUrl(code)}
        srcSet={`${getFlagUrl(code, 40)} 1x, ${getFlagUrl(code, 80)} 2x`}
        alt={`${name} flag`}
        loading="lazy"
      />
    </span>
  );
}

export default function CountrySelector() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { countries, isLoading } = useCountries();
  const { countryCode, currency, setCountryPreference } = usePricingPreferences();

  const selectedCountry = countries.find((country) => country.code === countryCode);
  const filteredCountries = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return countries;

    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(search) ||
        country.currency.toLowerCase().includes(search),
    );
  }, [countries, query]);

  return (
    <div className="sm-country-selector">
      <button type="button" className="sm-country-trigger" onClick={() => setOpen(true)}>
        <span className="sm-country-trigger-label">Country</span>
        <span className="sm-country-trigger-value">
          <FlagImage
            code={selectedCountry?.code ?? "ZA"}
            name={selectedCountry?.name ?? "South Africa"}
          />
          {selectedCountry?.name ?? "South Africa"} ({currency})
        </span>
      </button>

      {open && (
        <div className="sm-country-modal" role="dialog" aria-modal="true" aria-label="Country">
          <button
            type="button"
            className="sm-country-backdrop"
            aria-label="Close country selector"
            onClick={() => setOpen(false)}
          />
          <div className="sm-country-sheet">
            <div className="sm-country-sheet-header">
              <button
                type="button"
                className="sm-country-close"
                aria-label="Close country selector"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <h2>Country</h2>
            </div>
            <label className="sm-country-search">
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country or currency"
                autoFocus
              />
            </label>
            <div className="sm-country-list">
              {isLoading && <div className="sm-country-empty">Loading countries...</div>}
              {!isLoading && filteredCountries.length === 0 && (
                <div className="sm-country-empty">No countries found</div>
              )}
              {filteredCountries.map((country) => (
                <button
                  key={`${country.code}-${country.currency}`}
                  type="button"
                  className="sm-country-option"
                  data-selected={country.code === countryCode || undefined}
                  onClick={() => {
                    setCountryPreference(country.code, country.currency);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <FlagImage code={country.code} name={country.name} />
                  <span>
                    {country.name} ({country.currency} {country.symbol})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
