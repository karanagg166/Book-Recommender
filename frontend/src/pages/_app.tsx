import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes"; // Optional: for dark mode support

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <title>Book Recommender</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Component {...pageProps} />
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </>
  );
}
