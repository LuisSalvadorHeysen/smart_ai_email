'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  Text, 
  Group, 
  Badge, 
  Button, 
  Modal, 
  LoadingOverlay,
  Avatar,
  Divider,
  ActionIcon,
  Tooltip,
  Paper,
  Container,
  Title,
  Alert
} from '@mantine/core';
import { 
  IconMail, 
  IconClock, 
  IconUser, 
  IconRefresh, 
  IconBrain, 
  IconBriefcase,
  IconCheck,
  IconAlertCircle,
  IconExternalLink
} from '@tabler/icons-react';

interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet?: string;
  processed: boolean;
  isInternship: boolean;
}

interface EmailDetail {
  id: string;
  subject: string;
  from: string;
  date: string;
  textBody: string;
  htmlBody: string;
  sentiment: string;
}

export default function EmailList() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchEmails = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/gmail');
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      
      const data = await response.json();
      setEmails(data.emails || []);
      
      if (data.emails?.length > 0) {
        setNotification(`Successfully loaded ${data.emails.length} emails`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setNotification('Failed to load emails. Please try again.');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailDetail = async (emailId: string) => {
    try {
      const response = await fetch(`/api/gmail?id=${emailId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch email details');
      }
      
      const emailDetail: EmailDetail = await response.json();
      setSelectedEmail(emailDetail);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching email details:', error);
      setNotification('Failed to load email content');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const processEmail = async (emailId: string) => {
    setProcessing(emailId);
    try {
      // Classify email
      const classifyResponse = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId })
      });

      if (classifyResponse.ok) {
        const classification = await classifyResponse.json();
        
        // If it's an internship email, extract details
        if (classification.category === 'internship') {
          const extractResponse = await fetch('/api/extract-internship', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailId })
          });

          if (extractResponse.ok) {
            setNotification('Internship details have been added to your tracker');
            setTimeout(() => setNotification(null), 3000);
          }
        }

        // Update email list
        setEmails(prev => prev.map(email => 
          email.id === emailId 
            ? { ...email, processed: true, isInternship: classification.category === 'internship' }
            : email
        ));
      }
    } catch (error) {
      console.error('Error processing email:', error);
      setNotification('Failed to process email. Please try again.');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEmails();
    }
  }, [session]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      case 'urgent': return 'orange';
      default: return 'blue';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'urgent': return '⚡';
      default: return '📧';
    }
  };

  if (!session) {
    return (
      <Container size="md" className="py-12">
        <Paper className="p-8 text-center card-hover">
          <IconMail size={48} className="text-blue-500 mx-auto mb-4" />
          <Title order={2} className="mb-4">Welcome to Smart AI Email</Title>
          <Text c="dimmed" className="mb-6">
            Sign in with your Gmail account to start managing your emails with AI
          </Text>
          <Button size="lg" className="btn-primary">
            Sign In with Gmail
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" className="py-6">
      {/* Notification */}
      {notification && (
        <Alert 
          color="blue" 
          className="mb-4"
          withCloseButton
          onClose={() => setNotification(null)}
        >
          {notification}
        </Alert>
      )}

      {/* Header */}
      <div className="mb-8">
        <Group justify="space-between" align="center" className="mb-4">
          <div>
            <Title order={1} className="mb-2">Inbox</Title>
            <Text c="dimmed">
              {emails.length} emails • {emails.filter(e => e.processed).length} processed
            </Text>
          </div>
          <Button 
            leftSection={<IconRefresh size={16} />}
            onClick={fetchEmails}
            loading={loading}
            className="btn-primary"
          >
            Refresh
          </Button>
        </Group>
      </div>

      {/* Email List */}
      <div className="space-y-4">
        {emails.length === 0 && !loading ? (
          <Paper className="p-12 text-center card-hover">
            <IconMail size={48} className="text-gray-400 mx-auto mb-4" />
            <Title order={3} className="mb-2">No emails found</Title>
            <Text c="dimmed" className="mb-4">
              Your emails will appear here once loaded
            </Text>
            <Button onClick={fetchEmails} className="btn-primary">
              Load Emails
            </Button>
          </Paper>
        ) : (
          emails.map((email) => (
            <Card 
              key={email.id} 
              className="card-hover cursor-pointer"
              shadow="sm" 
              padding="lg" 
              radius="md"
              onClick={() => fetchEmailDetail(email.id)}
            >
              <Group justify="space-between" align="flex-start">
                <div className="flex-1 min-w-0">
                  <Group gap="sm" className="mb-2">
                    <Avatar size="sm" color="blue" radius="xl">
                      {email.from.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Text fw={500} className="truncate">
                        {email.from}
                      </Text>
                      <Text size="sm" c="dimmed" className="truncate">
                        {email.subject}
                      </Text>
                    </div>
                  </Group>
                  
                  {email.snippet && (
                    <Text size="sm" c="dimmed" className="mb-3 line-clamp-2">
                      {email.snippet}
                    </Text>
                  )}
                  
                  <Group gap="xs">
                    <Badge 
                      size="sm" 
                      variant="light" 
                      color={email.isInternship ? 'green' : 'blue'}
                    >
                      {email.isInternship ? 'Internship' : 'Email'}
                    </Badge>
                    {email.processed && (
                      <Badge size="sm" variant="light" color="green">
                        Processed
                      </Badge>
                    )}
                  </Group>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Text size="sm" c="dimmed" className="flex items-center gap-1">
                    <IconClock size={14} />
                    {formatDate(email.date)}
                  </Text>
                  
                  {!email.processed && (
                    <Tooltip label="Process with AI">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          processEmail(email.id);
                        }}
                        loading={processing === email.id}
                      >
                        <IconBrain size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </div>
              </Group>
            </Card>
          ))
        )}
      </div>

      {/* Email Detail Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <IconMail size={20} />
            <Text fw={600}>Email Details</Text>
          </div>
        }
        styles={{
          header: { background: 'var(--cursor-surface)', borderBottom: '1px solid var(--cursor-border)' },
          body: { background: 'var(--cursor-surface)' }
        }}
      >
        {selectedEmail && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <Title order={3} className="mb-2">{selectedEmail.subject}</Title>
              <Group gap="md" className="mb-4">
                <Group gap="xs">
                  <IconUser size={16} />
                  <Text size="sm">{selectedEmail.from}</Text>
                </Group>
                <Group gap="xs">
                  <IconClock size={16} />
                  <Text size="sm">{formatDate(selectedEmail.date)}</Text>
                </Group>
              </Group>
              
              <Badge 
                size="lg" 
                color={getSentimentColor(selectedEmail.sentiment)}
                leftSection={<span>{getSentimentIcon(selectedEmail.sentiment)}</span>}
              >
                {selectedEmail.sentiment.charAt(0).toUpperCase() + selectedEmail.sentiment.slice(1)}
              </Badge>
            </div>
            
            <Divider />
            
            {/* Content */}
            <div>
              <Title order={4} className="mb-3">Content</Title>
              <Paper className="p-4 bg-gray-50 dark:bg-slate-800 rounded-md">
                <Text size="sm" className="whitespace-pre-wrap">
                  {selectedEmail.textBody || selectedEmail.htmlBody.replace(/<[^>]*>/g, '')}
                </Text>
              </Paper>
            </div>
            
            {/* Actions */}
            <Group justify="flex-end">
              <Button 
                variant="light" 
                leftSection={<IconExternalLink size={16} />}
                onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${selectedEmail.id}`, '_blank')}
              >
                Open in Gmail
              </Button>
              <Button 
                className="btn-primary"
                leftSection={<IconBrain size={16} />}
                onClick={() => {
                  processEmail(selectedEmail.id);
                  setIsModalOpen(false);
                }}
              >
                Process with AI
              </Button>
            </Group>
          </div>
        )}
      </Modal>

      <LoadingOverlay visible={loading} />
    </Container>
  );
} 