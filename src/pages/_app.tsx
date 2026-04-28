import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LevelProvider } from "@/contexts/LevelContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CurrencyProvider>
      <LevelProvider>
        <Component {...pageProps} />
        <Toaster />
      </LevelProvider>
    </CurrencyProvider>
  );
}
