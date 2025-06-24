'use client';
import { useEffect, useState } from "react";
import { Card, Group, Avatar, Text, ScrollArea, Badge, Box, Modal, Loader, Paper, Divider, Button, Alert, Grid, Stack, Title, LoadingOverlay } from '@mantine/core';
import { useSession } from "next-auth/react";
import { IconRefresh, IconBrain, IconExternalLink } from "@tabler/icons-react";
import AIAssistant from "./AIAssistant";

type Email = {
  id: string;
  subject: string;
  from: string;
  date: string;
  processed: boolean;
  isInternship?: boolean;
  aiResults?: {
    category: string;
    sentiment: string;
    confidence: string;
  };
};

type EmailDetail = Email & { 
  htmlBody?: string;
  textBody?: string;
  sentiment?: string;
};

export default function EmailList() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [emailContentHeight, setEmailContentHeight] = useState(70); // Default 70% for email content
  const [isDragging, setIsDragging] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gmail');
      if (!response.ok) throw new Error('Failed to fetch emails');
      const data = await response.json();
      
      setEmails(Array.isArray(data.emails) ? data.emails : []);
      setLoading(false);

      // Only process new emails that haven't been processed yet
      const unprocessed = data.emails.filter((e: Email) => !e.processed);
      if (unprocessed.length > 0) {
        setAutoProcessing(true);
        setNotification(`🤖 Found ${unprocessed.length} new emails. Processing with AI...`);
        
        for (const email of unprocessed) {
          await processEmail(email.id);
        }
        
        setAutoProcessing(false);
        setNotification('✅ All new emails processed!');
        setTimeout(() => setNotification(null), 5000);
        
        // Re-fetch to get updated data with AI results
        const updatedResponse = await fetch('/api/gmail');
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setEmails(Array.isArray(updatedData.emails) ? updatedData.emails : []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch emails:", error);
      setNotification("Error fetching emails. Please try refreshing.");
      setLoading(false);
    }
  };

  const processEmail = async (emailId: string) => {
    try {
      await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId })
      });
    } catch (error) {
      console.error(`Failed to process email ${emailId}:`, error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEmails();
    }
  }, [session]);

  const handleEmailClick = async (id: string) => {
    setLoadingEmail(true);
    setSelectedEmail(null);
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const container = document.getElementById('email-content-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Limit the height between 30% and 80%
    if (newHeight >= 30 && newHeight <= 80) {
      setEmailContentHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const totalProcessed = emails.filter(e => e.processed).length;
  const totalInternships = emails.filter(e => e.isInternship).length;

  if (!session) {
    return <Text ta="center" size="md" mt="xl">Please sign in to view emails.</Text>;
  }
  
  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {notification && (
        <Alert color="blue" withCloseButton onClose={() => setNotification(null)} m="md">
          {notification}
        </Alert>
      )}

      <Group justify="space-between" p="md" style={{ flexShrink: 0 }}>
        <Title order={2}>Inbox</Title>
        <Button onClick={fetchEmails} loading={loading || autoProcessing} leftSection={<IconRefresh size={16}/>}>
          {autoProcessing ? 'Processing...' : 'Refresh'}
        </Button>
      </Group>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Email List Panel */}
        <div style={{ width: '40%', borderRight: '1px solid #e8eaed' }}>
          <ScrollArea style={{ height: '100%' }}>
            <div style={{ padding: '16px' }}>
              {loading ? (
                <Loader />
              ) : emails.length === 0 ? (
                <Text ta="center" c="dimmed">No emails found</Text>
              ) : (
                emails.map((email) => (
                  <Card
                    key={email.id}
                    shadow="sm"
                    padding="md"
                    radius="md"
                    withBorder
                    mb="sm"
                    onClick={() => handleEmailClick(email.id)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedEmail?.id === email.id ? '#f8fafc' : 'white'
                    }}
                  >
                    <Group justify="space-between" mb="xs">
                      <Text fw={500} size="sm" truncate>{email.from}</Text>
                      <Text size="xs" c="dimmed">{new Date(email.date).toLocaleDateString()}</Text>
                    </Group>
                    <Text size="sm" c="dimmed" truncate mb="xs">{email.subject}</Text>
                    <Group gap="xs">
                      {email.isInternship && <Badge color="green" size="xs">Internship</Badge>}
                      {email.aiResults?.sentiment && (
                        <Badge color={getSentimentColor(email.aiResults.sentiment)} size="xs">
                          {email.aiResults.sentiment}
                        </Badge>
                      )}
                    </Group>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Email Content Panel */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
          {loadingEmail ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader size="lg" />
            </div>
          ) : selectedEmail ? (
            <div 
              id="email-content-container"
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {/* Email Header */}
              <div style={{ padding: '16px', borderBottom: '1px solid #e8eaed', flexShrink: 0 }}>
                <Title order={4} mb="xs">{selectedEmail.subject}</Title>
                <Text size="sm" mb="xs">From: {selectedEmail.from}</Text>
                <Text size="xs" c="dimmed">Date: {new Date(selectedEmail.date).toLocaleString()}</Text>
              </div>
              
              {/* Email Content */}
              <div style={{ height: `${emailContentHeight}%`, overflow: 'hidden' }}>
                <ScrollArea style={{ height: '100%' }}>
                  <div style={{ padding: '24px' }}>
                    <div 
                      style={{
                        fontSize: '15px',
                        lineHeight: '1.6',
                        color: '#2d2d2d',
                        fontFamily: '"Google Sans", Roboto, system-ui'
                      }}
                      dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody || selectedEmail.textBody || "" }} 
                    />
                  </div>
                </ScrollArea>
              </div>

              {/* Resizable Splitter */}
              <div
                style={{
                  height: '4px',
                  backgroundColor: '#e8eaed',
                  cursor: 'row-resize',
                  position: 'relative',
                  flexShrink: 0
                }}
                onMouseDown={handleMouseDown}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    height: '8px',
                    width: '40px',
                    backgroundColor: '#c1c2c5',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ height: '2px', width: '20px', backgroundColor: '#868e96' }} />
                </div>
              </div>
              
              {/* AI Assistant */}
              <div style={{ height: `${100 - emailContentHeight}%`, overflow: 'hidden' }}>
                <ScrollArea style={{ height: '100%' }}>
                  <AIAssistant 
                    emailId={selectedEmail.id}
                    emailBody={selectedEmail.textBody || selectedEmail.htmlBody || ""}
                    emailSubject={selectedEmail.subject}
                  />
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text c="dimmed">Select an email to view its content</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
