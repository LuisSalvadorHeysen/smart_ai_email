'use client';

import { useEffect, useState } from "react";
import { Card, Group, Avatar, Text, ScrollArea, Badge, Box, Modal, Loader, Paper, Divider } from '@mantine/core';
import AIAssistant from "./AIAssistant";

type Email = {
  id: string;
  subject: string;
  from: string;
  date: string;
};

type EmailDetail = Email & { 
  htmlBody?: string;
  textBody?: string;
  sentiment?: string;
};

export default function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);

  useEffect(() => {
    fetch("/api/gmail")
      .then((res) => res.json())
      .then((data) => {
        setEmails(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const handleEmailClick = async (id: string) => {
    setLoadingEmail(true);
    setOpened(true);
    const res = await fetch(`/api/gmail?id=${id}`);
    const data = await res.json();
    setSelectedEmail(data);
    setLoadingEmail(false);
  };

  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return 'gray';
    switch(sentiment.toLowerCase()) {
      case 'positive': return 'green';
      case 'urgent': return 'red';
      case 'negative': return 'orange';
      default: return 'blue';
    }
  };

  if (loading) return <Text align="center" size="md" mt="xl">Loading emails...</Text>;
  if (!emails.length) return <Text align="center" size="md" mt="xl">No emails found.</Text>;

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        size="95%"
        centered
        overlayProps={{ opacity: 0.55, blur: 3 }}
        padding={0}
      >
        {loadingEmail ? (
          <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85vh' }}>
            <Loader size="lg" />
          </Box>
        ) : selectedEmail ? (
          <div style={{ 
            display: 'flex', 
            height: '85vh',
            background: '#ffffff'
          }}>
            {/* Left Panel - Email Content */}
            <div style={{ 
              width: '50%',
              overflowY: 'auto',
              borderRight: '1px solid #e8eaed',
              padding: '24px',
              backgroundColor: '#f8fafc'
            }}>
              <Paper radius="md" p="md" shadow="sm">
                <Group position="apart" align="center" mb="md">
                  <Group align="center" spacing="md">
                    <Avatar color="indigo" radius="xl" size="lg">
                      {selectedEmail.from[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <div>
                      <Text size="xl" fw={800} style={{ wordBreak: 'break-word' }}>
                        {selectedEmail.subject || '(No Subject)'}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {selectedEmail.from}
                      </Text>
                      <Text size="xs" c="gray">
                        {new Date(selectedEmail.date).toLocaleString()}
                      </Text>
                    </div>
                  </Group>
                  <Badge 
                    color={getSentimentColor(selectedEmail.sentiment)}
                    variant="filled"
                    size="lg"
                  >
                    {selectedEmail.sentiment || 'neutral'}
                  </Badge>
                </Group>

                <Divider my="md" />

                <Box
                  sx={{
                    fontFamily: '"Google Sans",Roboto,Helvetica,Arial,sans-serif',
                    fontSize: "14px",
                    lineHeight: 1.4,
                    color: "#202124",
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: selectedEmail.htmlBody || selectedEmail.textBody || "No content available"
                  }}
                />
              </Paper>
            </div>

            {/* Right Panel - AI Assistant */}
            <div style={{ 
              width: '50%',
              overflowY: 'auto',
              padding: '24px',
              background: '#fff'
            }}>
              <AIAssistant 
                emailBody={selectedEmail.textBody || selectedEmail.htmlBody || ""}
                emailSubject={selectedEmail.subject}
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <ScrollArea h={500} type="auto" offsetScrollbars>
        <Box>
          {emails.map((email) => (
            <Card
              key={email.id}
              shadow="md"
              padding="lg"
              radius="md"
              withBorder
              mb="md"
              sx={{
                transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 24px 0 rgba(60, 72, 88, 0.12)',
                  transform: 'translateY(-2px) scale(1.01)',
                  background: 'rgba(100, 108, 255, 0.07)',
                },
              }}
              onClick={() => handleEmailClick(email.id)}
            >
              <Group align="flex-start" spacing="md" style={{ flexWrap: 'nowrap' }}>
                <Avatar color="indigo" radius="xl" size="lg">
                  {email.from[0]?.toUpperCase() || "?"}
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <Group position="apart" align="center" mb={4}>
                    <Text fw={700} size="lg" truncate>
                      {email.subject || '(No Subject)'}
                    </Text>
                    <Badge color="gray" variant="light" size="sm">
                      {new Date(email.date).toLocaleDateString()}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed" mb={2} truncate>
                    {email.from}
                  </Text>
                  <Text size="xs" c="gray">
                    {new Date(email.date).toLocaleTimeString()}
                  </Text>
                </Box>
              </Group>
            </Card>
          ))}
        </Box>
      </ScrollArea>
    </>
  );
}
