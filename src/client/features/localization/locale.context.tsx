import { createContext, useContext, type Accessor, type ParentProps } from "solid-js";
import type { Locale } from "@/paraglide/runtime";

const LocaleContext = createContext<Accessor<Locale>>();

export function LocaleProvider(props: ParentProps<{ locale: Accessor<Locale> }>) {
  return <LocaleContext.Provider value={props.locale}>{props.children}</LocaleContext.Provider>;
}

export function useLocale() {
  const locale = useContext(LocaleContext);
  if (!locale) throw new Error("useLocale must be called inside LocaleProvider");
  return locale;
}
