import "leaflet/dist/leaflet.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>RescueMap-AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Inter font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
