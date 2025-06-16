'use client';
import { useState, useEffect } from 'react';
import { Grid, Paper, Text, Badge, Group, Loader, Button, ScrollArea, Box } from '@mantine/core';
import { IconBriefcase } from '@tabler/icons-react';

type Application = {
  company: string;
  position: string;
  status: 'Received' | 'Interviewing' | 'Rejected' | 'Offer';
  date: string;
  notes: string;
};

const statusColors: Record<Application['status'], string> = {
  Received: 'gray',
  Interviewing: 'blue',
  Rejected: 'red',
  Offer: 'green'
};

export default function InternshipTracker() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load applications from localStorage on mount
    const savedApps = localStorage.getItem('internshipApplications');
    setApplications(savedApps ? JSON.parse(savedApps) : []);
    setLoading(false);
  }, []);

  const handleClear = () => {
    localStorage.removeItem('internshipApplications');
    setApplications([]);
  };

  if (loading) return <Loader size="lg" />;

  return (
    <Box style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', height: 'calc(100vh - 120px)' }}>
      <Group mb="xl" position="apart">
        <Text size="xl" fw={700} style={{ display: 'flex', alignItems: 'center' }}>
          {/* Explicit className for hydration consistency */}
          <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 8 }}>
            <IconBriefcase size={20} className="tabler-icon tabler-icon-briefcase" />
          </span>
          Internship Applications
        </Text>
        <Button 
          variant="light"
          color="red"
          onClick={handleClear}
        >
          Clear All
        </Button>
      </Group>

      <ScrollArea style={{ height: 'calc(100vh - 220px)' }} type="auto" offsetScrollbars>
        {applications.length === 0 ? (
          <Text size="lg" c="dimmed" mt="xl" style={{ textAlign: 'center' }}>
            No internship applications tracked yet
          </Text>
        ) : (
          <Grid>
            {applications.map((app, index) => (
              <Grid.Col key={index} span={12} md={6} lg={4}>
                <Paper 
                  p="lg" 
                  withBorder 
                  shadow="sm"
                  style={{ 
                    height: '100%',
                    borderLeft: `4px solid var(--mantine-color-${statusColors[app.status]}-light, ${statusColors[app.status]})`,
                    borderRadius: 12,
                    background: '#fff'
                  }}
                >
                  <Group position="apart" mb="xs">
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
        )}
      </ScrollArea>
    </Box>
  );
}
