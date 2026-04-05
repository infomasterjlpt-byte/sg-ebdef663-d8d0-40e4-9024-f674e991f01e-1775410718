import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <Component {...pageProps} />
      </CurrencyProvider>
    </ThemeProvider>
  );
}
