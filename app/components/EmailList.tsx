'use client';

import { useEffect, useState } from "react";
import { Card, Group, Avatar, Text, ScrollArea, Paper } from '@mantine/core';

type Email = {
  id: string;
  subject: string;
  from: string;
  date: string;
};

export default function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gmail")
      .then((res) => res.json())
      .then((data) => {
        setEmails(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <Text>Loading emails...</Text>;
  if (!emails.length) return <Text>No emails found.</Text>;

  return (
    <Paper radius="md" p="md" withBorder shadow="md" style={{ background: 'var(--mantine-color-body)' }}>
      <ScrollArea h={500}>
        {emails.map((email) => (
          <Card key={email.id} shadow="sm" padding="md" radius="md" withBorder mb="md">
            <Group align="flex-start">
              <Avatar color="blue" radius="xl">{email.from[0] || "?"}</Avatar>
              <div>
                <Text fw={700} size="lg">{email.subject || '(No Subject)'}</Text>
                <Text size="sm" c="dimmed">{email.from}</Text>
                <Text size="xs" c="gray">{new Date(email.date).toLocaleString()}</Text>
              </div>
            </Group>
          </Card>
        ))}
      </ScrollArea>
    </Paper>
  );
}
