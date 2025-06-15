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
        styles={{
          content: {
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid #e8eaed'
          }
        }}
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
              padding: '32px',
              backgroundColor: '#f8fafc'
            }}>
              <Paper radius="lg" p="xl" shadow="sm" style={{ 
                background: "#fff",
                border: '1px solid #f1f3f5',
                borderRadius: 16
              }}>
                <Group position="apart" align="flex-start" mb="lg" spacing="xl">
                  <Group align="flex-start" spacing="xl">
                    <Avatar 
                      color="indigo" 
                      radius="xl" 
                      size="xl"
                      style={{ 
                        boxShadow: '0 2px 12px rgba(100, 108, 255, 0.15)',
                        marginTop: 4
                      }}
                    >
                      {selectedEmail.from[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <div>
                      <Text size="xl" fw={700} style={{ 
                        wordBreak: 'break-word',
                        fontFamily: '"Google Sans", system-ui',
                        color: '#1a1a1a'
                      }}>
                        {selectedEmail.subject || '(No Subject)'}
                      </Text>
                      <Text size="sm" c="dimmed" mt={4}>
                        {selectedEmail.from}
                      </Text>
                      <Text size="xs" c="gray" mt={2}>
                        {new Date(selectedEmail.date).toLocaleString()}
                      </Text>
                    </div>
                  </Group>
                  <Badge 
                    color={getSentimentColor(selectedEmail.sentiment)}
                    variant="light"
                    size="lg"
                    radius="sm"
                    style={{
                      textTransform: 'capitalize',
                      letterSpacing: 0.5,
                      fontWeight: 600
                    }}
                  >
                    {selectedEmail.sentiment || 'neutral'}
                  </Badge>
                </Group>

                <Divider my="lg" color="#f1f3f5" />

                <Box
                  sx={{
                    fontFamily: '"Google Sans", Roboto, system-ui',
                    fontSize: "15px",
                    lineHeight: 1.6,
                    color: "#2d2d2d",
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
              padding: '32px',
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
              shadow="sm"
              padding="lg"
              radius="lg"
              withBorder
              mb="md"
              sx={{
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                border: '1px solid #f1f3f5',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(60, 72, 88, 0.08)',
                  background: 'rgba(100, 108, 255, 0.03)',
                },
              }}
              onClick={() => handleEmailClick(email.id)}
            >
              <Group align="flex-start" spacing="xl">
                <Avatar 
                  color="indigo" 
                  radius="xl" 
                  size="lg"
                  style={{ 
                    boxShadow: '0 2px 8px rgba(100, 108, 255, 0.1)',
                    flexShrink: 0
                  }}
                >
                  {email.from[0]?.toUpperCase() || "?"}
                </Avatar>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Group position="apart" align="center" mb={4}>
                    <Text 
                      fw={600} 
                      size="lg" 
                      truncate
                      style={{
                        fontFamily: '"Google Sans", system-ui',
                        color: '#1a1a1a'
                      }}
                    >
                      {email.subject || '(No Subject)'}
                    </Text>
                    <Badge 
                      color="gray" 
                      variant="light" 
                      size="sm"
                      radius="sm"
                      style={{ 
                        fontWeight: 500,
                        letterSpacing: 0.2 
                      }}
                    >
                      {new Date(email.date).toLocaleDateString()}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed" truncate>
                    {email.from}
                  </Text>
                  <Text size="xs" c="gray" mt={2}>
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
