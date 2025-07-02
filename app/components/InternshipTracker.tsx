'use client';
import { useState, useEffect } from 'react';
import { Grid, Paper, Text, Badge, Group, Loader, Button } from '@mantine/core';
import { IconBriefcase } from '@tabler/icons-react';

type Application = {
  company: string;
  position: string;
  status: 'Received' | 'Interviewing' | 'Rejected' | 'Offer';
  date: string;
  notes: string;
};

export default function InternshipTracker() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load applications from localStorage on mount
    const savedApps = localStorage.getItem('internshipApplications');
    if (savedApps) setApplications(JSON.parse(savedApps));
    setLoading(false);
  }, []);

  const statusColors = {
    Received: 'gray',
    Interviewing: 'blue',
    Rejected: 'red',
    Offer: 'green'
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Group mb="xl" justify="space-between">
        <Text size="xl" fw={700}>
          <IconBriefcase size={20} style={{ marginRight: 8 }} />
          Internship Applications
        </Text>
        <Button 
          variant="light"
          onClick={() => localStorage.removeItem('internshipApplications')}
        >
          Clear All
        </Button>
      </Group>

      <Grid>
        {applications.map((app, index) => (
          <Grid.Col key={index} span={12} span-md={6} span-lg={4}>
            <Paper 
              p="lg" 
              withBorder 
              shadow="sm"
              style={{ 
                height: '100%',
                borderLeft: `4px solid var(${statusColors[app.status]})`
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

      {applications.length === 0 && (
        <Text size="lg" c="dimmed" mt="xl" style={{ textAlign: 'center' }}>
          No internship applications tracked yet
        </Text>
      )}
    </div>
  );
}

