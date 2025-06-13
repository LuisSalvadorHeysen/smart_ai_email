'use client'

import '@mantine/core/styles.css';
import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
