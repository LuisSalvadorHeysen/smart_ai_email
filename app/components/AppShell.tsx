'use client';
import { AppShell, Container, Paper, Title, Group, Box, NavLink } from '@mantine/core';
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
      styles={{
        main: { background: '#f8fafc' }
      }}
    >
      <AppShell.Header style={{ background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid #e8eaed', height: 70 }}>
        <Group position="apart" align="center" style={{ height: '100%' }}>
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
          icon={<IconInbox size={18} />}
          style={{ borderRadius: 8, fontWeight: 500, marginBottom: 4 }}
        />
        <NavLink
          component={Link}
          href="/internships"
          label="Internship Tracker"
          icon={<IconBriefcase size={18} />}
          style={{ borderRadius: 8, fontWeight: 500, marginBottom: 4 }}
        />
        <NavLink
          component={Link}
          href="/ai-assistant"
          label="AI Assistant"
          icon={<IconRobot size={18} />}
          style={{ borderRadius: 8, fontWeight: 500 }}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Container size="xl" p={0}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
