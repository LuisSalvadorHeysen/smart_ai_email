'use client';
import { AppShell, Container, Paper, Title, Group, Box, NavLink, Text, Stack } from '@mantine/core';
import { IconInbox, IconBriefcase, IconRobot } from '@tabler/icons-react';
import Link from 'next/link';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      padding="md"
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: true }
      }}
      header={{ height: 70 }}
      footer={{ height: 60 }}
      styles={{
        main: { background: '#f8fafc' }
      }}
    >
      <AppShell.Header style={{ background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid #e8eaed', height: 70 }}>
        <Group justify="space-between" align="center" style={{ height: '100%' }}>
          <Title 
            order={2} 
            style={{ 
              fontWeight: 800,
              letterSpacing: -0.5,
              color: '#1a1a1a',
              fontFamily: '"Google Sans", system-ui'
            }}
          >
            <span style={{ color: '#1a73e8' }}>Smart</span> Email
          </Title>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" style={{ background: '#f8fafc', borderRight: '1px solid #e8eaed' }}>
        <NavLink
          component={Link}
          href="/"
          label="Inbox"
          style={{ borderRadius: 8, fontWeight: 500, marginBottom: 4 }}
        />
        <NavLink
          component={Link}
          href="/internships"
          label="Internship Tracker"
          style={{ borderRadius: 8, fontWeight: 500 }}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Container size="xl" p={0}>
          {children}
        </Container>
      </AppShell.Main>
      <AppShell.Footer p="md" style={{ background: 'rgba(255,255,255,0.95)', borderTop: '1px solid #e8eaed' }}>
        <Group justify="center" gap="xl">
          <Text size="sm" c="dimmed">
            <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
          </Text>
          <Text size="sm" c="dimmed">
            <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </Text>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
