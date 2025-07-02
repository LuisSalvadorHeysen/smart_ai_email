'use client';

import { useState, useEffect } from 'react';
import { ActionIcon, useMantineColorScheme, Group, Tooltip } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder that matches both server and client initial render
    return (
      <Group justify="flex-end" my="md">
        <Tooltip label="Loading theme toggle...">
          <ActionIcon
            size="lg"
            variant="outline"
            color="gray"
            aria-label="Toggle color scheme"
          >
            <IconSun size="1.2rem" />
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  }

  const dark = colorScheme === 'dark';

  return (
    <Group justify="flex-end" my="md">
      <Tooltip label={dark ? "Switch to light mode" : "Switch to dark mode"}>
        <ActionIcon
          onClick={() => toggleColorScheme()}
          size="lg"
          variant="outline"
          color={dark ? 'yellow' : 'blue'}
          aria-label="Toggle color scheme"
        >
          {dark ? <IconSun size="1.2rem" /> : <IconMoonStars size="1.2rem" />}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
