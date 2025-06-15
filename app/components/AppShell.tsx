'use client';
import { Container, Paper, Title, Group, Box } from '@mantine/core';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: '"Google Sans", system-ui'
      }}
    >
      <Container size="xl" pt="xl">
        <Paper
          radius="lg"
          p="md"
          shadow="sm"
          withBorder
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(4px)',
            marginBottom: 24,
            borderColor: '#e8eaed'
          }}
        >
          <Group position="apart" align="center" mb={0}>
            <Title 
              order={2} 
              style={{ 
                fontWeight: 800,
                letterSpacing: -0.5,
                color: '#1a1a1a'
              }}
            >
              <span style={{ color: '#1a73e8' }}>Smart</span> Email
            </Title>
          </Group>
        </Paper>
        {children}
      </Container>
    </Box>
  );
}
