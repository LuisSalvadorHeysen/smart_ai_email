'use client';

import { Container, Paper, Title, Group, Box } from '@mantine/core';
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)',
        transition: 'background 0.3s',
      }}
      sx={(theme) => ({
        background: theme.colorScheme === 'dark'
          ? 'linear-gradient(135deg, #232946 0%, #121629 100%)'
          : 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)',
      })}
    >
      <Container size="sm" pt="lg">
        <Paper
          radius="lg"
          p="xl"
          shadow="xl"
          withBorder
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(3px)',
            marginBottom: 32,
          }}
        >
          <Group position="apart" align="center" mb="md">
            <Title order={2} style={{ letterSpacing: 1.5, fontWeight: 800 }}>
              📧 Smart AI Email
            </Title>
          </Group>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}

