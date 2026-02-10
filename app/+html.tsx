import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* SEO */}
        <title>Anchor — A Grounding App for Overwhelming Moments</title>
        <meta name="description" content="A minimal, privacy-first grounding app for moments of panic, anxiety, sadness, or anger. Free, offline, open source. No accounts, no tracking." />
        <meta name="keywords" content="grounding app, panic attack help, anxiety relief, mental health, mindfulness, offline, privacy, open source, free, grounding techniques" />
        <meta name="author" content="Nicolás De Giácomo" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Anchor — A Grounding App for Overwhelming Moments" />
        <meta property="og:description" content="A minimal, privacy-first grounding app for moments of panic, anxiety, sadness, or anger. Free, offline, open source." />
        <meta property="og:image" content="https://anchor-app.com/og-image.png" />
        <meta property="og:site_name" content="Anchor" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="es_ES" />
        <meta property="og:locale:alternate" content="pt_BR" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Anchor — A Grounding App for Overwhelming Moments" />
        <meta name="twitter:description" content="A minimal, privacy-first grounding app for moments of panic, anxiety, sadness, or anger. Free, offline, open source." />
        <meta name="twitter:image" content="https://anchor-app.com/og-image.png" />

        {/* Language alternates */}
        <link rel="alternate" hrefLang="en" href="https://anchor-app.com/" />
        <link rel="alternate" hrefLang="es" href="https://anchor-app.com/es/" />
        <link rel="alternate" hrefLang="pt" href="https://anchor-app.com/pt/" />
        <link rel="alternate" hrefLang="x-default" href="https://anchor-app.com/" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
