import type { Locale } from "./config";
import en from "./dictionaries/en";
import fr from "./dictionaries/fr";
import it from "./dictionaries/it";
import de from "./dictionaries/de";
import pt from "./dictionaries/pt";

export type Dict = Record<string, string>;
const DICTS: Record<Locale, Dict> = { en, fr, it, de, pt };

export function getDictionary(locale: Locale): Dict {
  return DICTS[locale] ?? en;
}

// Translate with {var} interpolation; falls back to English then the key itself.
export function translate(dict: Dict, key: string, vars?: Record<string, string | number>): string {
  let s = dict[key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
  return s;
}
