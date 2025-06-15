'use client';

import { useEffect, useState } from "react";
import { Card, Group, Avatar, Text, ScrollArea, Badge, Box, Modal, Loader, Paper, Divider, Button } from '@mantine/core';
import ReplySuggestions from "./ReplySuggestions";

type Email = {
  id: string;
  subject: string;
  from: string;
  date: string;
};

type EmailDetail = Email & { 
  htmlBody?: string;
  textBody?: string;
};

export default function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gmail")
      .then((res) => res.json())
      .then((data) => {
        setEmails(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const handleEmailClick = async (id: string) => {
    setSummary(null);
    setLoadingEmail(true);
    setOpened(true);
    const res = await fetch(`/api/gmail?id=${id}`);
    const data = await res.json();
    setSelectedEmail(data);
    setLoadingEmail(false);
  };

  const handleSummarize = async () => {
    if (!selectedEmail) return;

    setSummaryLoading(true);
    setSummaryError(null);
    try {
      // Prefer textBody, fallback to sanitized HTML
      const content = selectedEmail.textBody || 
        selectedEmail.htmlBody?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 
        '';

      const res = await fetch("/api/summarize-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: content }),
      });

      if (!res.ok) throw new Error('Summary failed');
      
      const { summary } = await res.json();
      setSummary(summary);
    } catch (err) {
      setSummaryError("Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) return <Text align="center" size="md" mt="xl">Loading emails...</Text>;
  if (!emails.length) return <Text align="center" size="md" mt="xl">No emails found.</Text>;

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={null}
        size="lg"
        centered
        overlayProps={{
          opacity: 0.55,
          blur: 3,
        }}
        padding={0}
      >
        {loadingEmail ? (
          <Loader size="lg" />
        ) : selectedEmail ? (
          <Paper radius="md" p="xl" shadow="sm" style={{ background: "#f8fafc" }}>
            <Group align="center" mb="sm" spacing="md">
              <Avatar color="indigo" radius="xl" size="lg">
                {selectedEmail.from[0]?.toUpperCase() || "?"}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text size="xl" fw={800} mb={4} style={{ wordBreak: 'break-word' }}>
                  {selectedEmail.subject || '(No Subject)'}
                </Text>
                <Text size="sm" c="dimmed" mb={2} style={{ wordBreak: 'break-all' }}>
                  {selectedEmail.from}
                </Text>
                <Text size="xs" c="gray">
                  {new Date(selectedEmail.date).toLocaleString()}
                </Text>
              </div>
            </Group>

            {/* Summary Section */}
            <Group position="apart" mb="md">
              <Button
                variant="light"
                size="xs"
                onClick={handleSummarize}
                loading={summaryLoading}
                disabled={summaryLoading}
              >
                Summarize Email
              </Button>
              {summaryLoading && <Loader size="xs" />}
            </Group>

            {summaryError && (
              <Text color="red" size="sm" mb="sm">
                {summaryError}
              </Text>
            )}

            {summary && (
              <Paper p="md" mb="md" withBorder style={{ background: "#f4f8fb" }}>
                <Text fw={500} mb={4}>AI Summary:</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{summary}</Text>
              </Paper>
            )}

            <Divider my="md" />

            {/* Email Body Display */}
            <Box
              sx={{
                background: "#fff",
                borderRadius: 8,
                padding: 0,
                minHeight: 200,
                maxHeight: 500,
                overflowY: "auto",
                boxShadow: "0 2px 8px rgba(60,72,88,0.07)",
                border: "1px solid #e8eaed",
              }}
            >
              <div 
                style={{
                  padding: "20px 24px",
                  fontFamily: '"Google Sans",Roboto,RobotoDraft,Helvetica,Arial,sans-serif',
                  fontSize: "14px",
                  lineHeight: "1.4",
                  color: "#202124",
                }}
                dangerouslySetInnerHTML={{ 
                  __html: `
                  <style>
                    .email-content {
                      font-family: "Google Sans",Roboto,RobotoDraft,Helvetica,Arial,sans-serif;
                      font-size: 14px;
                      line-height: 1.4;
                      color: #202124;
                      max-width: 100%;
                      word-wrap: break-word;
                    }
                    .email-content img {
                      max-width: 100%;
                      height: auto;
                      display: block;
                      margin: 12px auto;
                    }
                    .email-content a {
                      color: #1a73e8;
                      text-decoration: none;
                    }
                    .email-content a:hover {
                      text-decoration: underline;
                    }
                  </style>
                  <div class="email-content">
                    ${selectedEmail.htmlBody || selectedEmail.textBody || "No content available"}
                  </div>
                  ` 
                }}
              />
            </Box>

            <ReplySuggestions 
              subject={selectedEmail.subject}
              body={selectedEmail.textBody || selectedEmail.htmlBody || ""}
            />
          </Paper>
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
