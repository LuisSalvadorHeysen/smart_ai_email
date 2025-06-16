'use client';
import { useEffect, useState } from 'react';
import { Paper, Text, Badge, Group, Grid, Loader, Button, ScrollArea, Box } from '@mantine/core';
import { IconBriefcase } from '@tabler/icons-react';

type InternshipApplication = {
  company: string;
  position: string;
  status: 'Received' | 'Interviewing' | 'Rejected' | 'Offer';
  date: string;
  notes: string;
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

  useEffect(() => {
    const saved = localStorage.getItem('internshipApplications');
    setApplications(saved ? JSON.parse(saved) : []);
    setLoading(false);
  }, []);

  const handleClear = () => {
    localStorage.removeItem('internshipApplications');
    setApplications([]);
  };

  return (
    <Box style={{ padding: '32px', maxWidth: 1200, margin: '0 auto', height: 'calc(100vh - 120px)' }}>
      <Group mb="xl" position="apart">
        <Text size="xl" fw={700}>
          <IconBriefcase size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
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
        {loading ? (
          <Loader size="lg" />
        ) : applications.length === 0 ? (
          <Text size="lg" c="dimmed" mt="xl" style={{ textAlign: 'center' }}>
            No internship applications tracked yet.
          </Text>
        ) : (
          <Grid>
            {applications.map((app, idx) => (
              <Grid.Col key={idx} span={12} md={6} lg={4}>
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
