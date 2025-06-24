'use client';
import { useState } from 'react';
import { Tabs, Textarea, Button, Group, Paper, Text, Loader, Stack, Box } from '@mantine/core';
import { IconBulb, IconListCheck, IconCopy, IconCheck, IconBriefcase } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

export default function AIAssistant({ emailId, emailBody, emailSubject }: { emailId: string, emailBody: string, emailSubject: string }) {
    const [activeTab, setActiveTab] = useState('tone');
    const [output, setOutput] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState('');
    const [aiReplies, setAiReplies] = useState<string[]>([]);
    const [repliesLoading, setRepliesLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [internshipDetails, setInternshipDetails] = useState<any>(null);
    const [internshipLoading, setInternshipLoading] = useState(false);

    const handleAIRequest = async (action: string, tone?: string) => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = `/api/ai/${action}`;
            const body = action === 'rewrite' 
                ? { draft, tone, text: emailBody }
                : { text: emailBody };

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'AI request failed');
                }

                const data = await res.json();
                setOutput(Array.isArray(data.output) ? data.output : []);
        } catch (err: any) {
            setError(err.message || "Failed to process request");
            setOutput([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckInternship = async () => {
        setInternshipLoading(true);
        setError(null);
        setInternshipDetails(null);
        try {
            const res = await fetch('/api/ai/internship', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: emailBody }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to check for internship');
            }

            const data = await res.json();
            if (data.isInternship) {
                setInternshipDetails(data.details);
            } else {
                setInternshipDetails({ noInternship: true });
            }
        } catch (err: any) {
            setError(err.message || "Failed to process internship check");
        } finally {
            setInternshipLoading(false);
        }
    };

    const handleSaveInternship = async () => {
        if (!internshipDetails) return;
        
        try {
            const newApplication = {
                company: internshipDetails.company,
                position: internshipDetails.position,
                status: 'Received',
                date: new Date().toISOString(),
                notes: `Source: Email subject - ${emailSubject}`,
                emailId: emailId
            };

            const response = await fetch('/api/internships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newApplication)
            });

            if (response.ok) {
                alert('Internship saved to tracker!');
            } else {
                throw new Error('Failed to save internship');
            }
        } catch (error) {
            console.error('Error saving internship:', error);
            alert('Failed to save internship. Please try again.');
        }
    };

    const handleGenerateReplies = async () => {
        setRepliesLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai/replies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: emailBody }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate replies');
            }

            const data = await res.json();
            setAiReplies(data.output || []);
        } catch (err: any) {
            setError(err.message || "Failed to generate reply suggestions");
        } finally {
            setRepliesLoading(false);
        }
    };

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    return (
        <Paper 
            mt="md" 
            p="xl" 
            withBorder
            radius="lg"
            style={{
                background: '#f8fafc',
                border: '1px solid #f1f3f5',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
            }}
        >
            <Tabs 
                value={activeTab} 
                onChange={(value) => setActiveTab(value || 'tone')}
                styles={{
                    tab: {
                        '&[dataActive]': { // camelCase for React
                            borderColor: '#1a73e8',
                            color: '#1a73e8'
                }
                }
                }}
            >
                <Tabs.List>
                    <Tabs.Tab value="tone" leftSection={<IconBulb size={18} />}>Tone</Tabs.Tab>
                    <Tabs.Tab value="actions" leftSection={<IconListCheck size={18} />}>Actions</Tabs.Tab>
                    <Tabs.Tab value="internship" leftSection={<IconBriefcase size={18} />}>Internship</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="tone" pt="xl">
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.currentTarget.value)}
                        placeholder="Compose your reply..."
                        minRows={8}
                        autosize
                        maxRows={12}
                        styles={{
                            input: {
                                border: '1px solid #e8eaed',
                                borderRadius: 12,
                                padding: 20,
                                fontSize: 15,
                                lineHeight: 1.6,
                                '&:focus': {
                                    borderColor: '#1a73e8',
                                    boxShadow: '0 0 0 2px rgba(26, 115, 232, 0.1)'
                        }
                        }
                        }}
                    />
                    <Group mt="xl" gap="xs">
                        {['formal', 'friendly', 'concise', 'assertive'].map((tone) => (
                            <Button
                                key={tone}
                                variant="outline"
                                size="sm"
                                onClick={() => handleAIRequest('rewrite', tone)}
                                loading={loading}
                                styles={{
                                    root: {
                                        borderRadius: 8,
                                        borderWidth: 1.5,
                                        textTransform: 'capitalize',
                                        fontWeight: 500,
                                        letterSpacing: 0.2
                                }
                                }}
                            >
                                {tone}
                            </Button>
                        ))}
                    </Group>
                </Tabs.Panel>

                <Tabs.Panel value="actions" pt="xl">
                    <Stack gap="xl">
                        <Button 
                            onClick={() => handleAIRequest('actions')} 
                            loading={loading}
                            variant="light"
                            fullWidth
                            styles={{
                                root: {
                                    borderRadius: 8,
                                    borderWidth: 1.5,
                                    fontWeight: 500
                            }
                            }}
                        >
                            Extract Action Items
                        </Button>

                        <Button 
                            onClick={handleGenerateReplies}
                            loading={repliesLoading}
                            variant="filled"
                            fullWidth
                            styles={{
                                root: {
                                    borderRadius: 8,
                                    backgroundColor: '#1a73e8',
                                    '&:hover': {
                                        backgroundColor: '#1557b0'
                            }
                            }
                            }}
                        >
                            Generate 3 AI Replies
                        </Button>

                        {repliesLoading && <Loader size="sm" />}

                        {aiReplies.length > 0 && (
                            <Paper p="md" withBorder radius="md">
                                <Stack>
                                    {aiReplies.map((reply, index) => (
                                        <Group key={index} justify="space-between">
                                            <Text size="sm">{reply}</Text>
                                            <Button 
                                                size="xs"
                                                variant="outline"
                                                onClick={() => handleCopy(reply, index)}
                                            >
                                                {copiedIndex === index ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                            </Button>
                                        </Group>
                                    ))}
                                </Stack>
                            </Paper>
                        )}
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="internship" pt="xl">
                    <Stack gap="xl">
                        <Button
                            onClick={handleCheckInternship}
                            loading={internshipLoading}
                            variant="light"
                            fullWidth
                            leftSection={<IconBriefcase size={18} />}
                        >
                            Check for Internship Opportunity
                        </Button>

                        {internshipLoading && <Loader size="sm" />}

                        {internshipDetails && !internshipDetails.noInternship && (
                            <Paper p="lg" withBorder radius="md">
                                <Stack>
                                    <Text fw={500}>Internship Found!</Text>
                                    <Text><strong>Company:</strong> {internshipDetails.company}</Text>
                                    <Text><strong>Position:</strong> {internshipDetails.position}</Text>
                                    <Button onClick={handleSaveInternship} size="sm">
                                        Save to Tracker
                                    </Button>
                                </Stack>
                            </Paper>
                        )}

                        {internshipDetails?.noInternship && (
                            <Text ta="center" c="dimmed">
                                No internship opportunity found in this email.
                            </Text>
                        )}

                    </Stack>
                </Tabs.Panel>
            </Tabs>

            {error && <Text color="red" mt="md" size="sm">{error}</Text>}

            {output.length > 0 && (
                <Paper mt="xl" p="xl" withBorder radius="lg" style={{ 
                    background: '#fff',
                    borderColor: '#e8eaed'
                    }}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            ul: ({ node, ...props }) => (
                                <ul style={{ 
                                    marginLeft: 20, 
                                    marginBottom: 12,
                                    paddingLeft: 16 
                                    }} {...props} />
                            ),
                            li: ({ node, ...props }) => (
                                <li style={{ 
                                    marginBottom: 4,
                                    listStyleType: 'disc',
                                    lineHeight: 1.6
                                    }} {...props} />
                            ),
                            p: ({ node, ...props }) => (
                                <p style={{ 
                                    marginBottom: 8,
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.6 
                                    }} {...props} />
                            ),
                            a: ({ node, ...props }) => (
                                <a 
                                    style={{ 
                                        color: '#1a73e8',
                                        textDecoration: 'none',
                                        fontWeight: 500 
                                    }} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    {...props} 
                                />
                            )
                        }}
                    >
                        {output.join('\n\n')}
                    </ReactMarkdown>
                </Paper>
            )}
        </Paper>
    );
}
