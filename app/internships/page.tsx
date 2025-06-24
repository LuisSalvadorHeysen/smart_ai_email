'use client';
import { useEffect, useState } from 'react';
import { Paper, Text, Badge, Group, Grid, Loader, Button, ScrollArea, Box, SegmentedControl } from '@mantine/core';
import { IconBriefcase, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

type InternshipApplication = {
  company: string;
  position: string;
  status: 'Received' | 'Interviewing' | 'Rejected' | 'Offer';
  date: string;
  notes: string;
  emailId?: string;
};

const statusColors: Record<string, string> = {
  Received: 'gray',
  Interviewing: 'blue',
  Rejected: 'red',
  Offer: 'green'
};

export default function InternshipTrackerPage() {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('/api/internships')
      .then(res => res.json())
      .then(data => {
        setApplications(data);
        setLoading(false);
      });
  }, []);

  const handleClear = async () => {
    await fetch('/api/internships/clear', { method: 'POST' });
    setApplications([]);
  };

  const filteredApplications = applications.filter(app => 
    filter === 'All' || app.status === filter
  );

  return (
    <Box style={{ padding: '32px', maxWidth: 1200, margin: '0 auto', height: 'calc(100vh - 120px)' }}>
      <Group mb="xl" justify="space-between">
        <Group>
          <Link href="/" passHref>
            <Button variant="light" leftSection={<IconArrowLeft size={16} />}>
              Back to Inbox
            </Button>
          </Link>
          <Text size="xl" fw={700}>
            <IconBriefcase size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Internship Applications
          </Text>
        </Group>
        <Button 
          variant="light"
          color="red"
          onClick={handleClear}
        >
          Clear All
        </Button>
      </Group>

      <SegmentedControl
        value={filter}
        onChange={setFilter}
        data={[
          { label: 'All', value: 'All' },
          { label: 'Received', value: 'Received' },
          { label: 'Interviewing', value: 'Interviewing' },
          { label: 'Offer', value: 'Offer' },
          { label: 'Rejected', value: 'Rejected' },
        ]}
        mb="xl"
        color="blue"
      />

      <ScrollArea style={{ height: 'calc(100vh - 280px)' }} type="auto" offsetScrollbars>
        {loading ? (
          <Loader size="lg" />
        ) : filteredApplications.length === 0 ? (
          <Text size="lg" c="dimmed" mt="xl" style={{ textAlign: 'center' }}>
            No internship applications match the current filter.
          </Text>
        ) : (
          <Grid>
            {filteredApplications.map((app, idx) => (
              <Grid.Col key={idx} span={{ base: 12, md: 6, lg: 4 }}>
                <Paper 
                  p="lg" 
                  withBorder 
                  shadow="sm"
                  onClick={() => {
                    if (app.emailId) {
                      window.open(`https://mail.google.com/mail/u/0/#inbox/${app.emailId}`, '_blank');
                    }
                  }}
                  style={{ 
                    height: '100%',
                    borderLeft: `4px solid var(--mantine-color-${statusColors[app.status]}-light, ${statusColors[app.status]})`,
                    borderRadius: 12,
                    background: '#fff',
                    cursor: app.emailId ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <Group justify="space-between" mb="xs">
                    <div>
                      <Text fw={600}>{app.company}</Text>
                      <Text size="sm" c="dimmed">{app.position}</Text>
                    </div>
                    <Badge 
                      color={statusColors[app.status]}
                      variant="light"
                      radius="sm"
                    >
                      {app.status}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed" mb={4}>
                    {new Date(app.date).toLocaleDateString()}
                  </Text>
                  <Text size="sm">{app.notes}</Text>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </ScrollArea>
    </Box>
  );
}
