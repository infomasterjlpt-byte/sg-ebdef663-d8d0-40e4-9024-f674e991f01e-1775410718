import { Html, Head, Main, NextScript } from "next/document";
import { SEOElements } from "@/components/SEO";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <SEOElements 
          title="Master JLPT — Japanese Language Proficiency Test Practice"
          description="Master the JLPT with structured practice and progress tracking. N5 to N1 levels, mock tests, and personalized study plans."
          image="/og-image.png"
          url="https://www.master-jlpt.com"
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
