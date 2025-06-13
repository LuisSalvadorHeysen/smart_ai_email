'use client';

import { useState } from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { useLocalStorage, useHotkeys } from '@mantine/hooks';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
  });

  // Toggle color scheme with keyboard shortcut mod+J (Ctrl+J or Cmd+J)
  useHotkeys([['mod+J', () => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')]]);

  const toggleColorScheme = () =>
    setColorScheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <>
      <ColorSchemeScript />
      <MantineProvider
        theme={{ colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <SessionProvider>
          {/* Pass toggle and scheme to children via context or props if needed */}
          {children}
        </SessionProvider>
      </MantineProvider>
    </>
  );
}
