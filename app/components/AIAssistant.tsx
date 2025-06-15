'use client';
import { useState } from 'react';
import { Tabs, Textarea, Button, Group, Paper, Text, Loader, Stack, Box } from '@mantine/core';
import { IconBulb, IconListCheck, IconCopy, IconCheck } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

export default function AIAssistant({ emailBody }: { emailBody: string }) {
    const [activeTab, setActiveTab] = useState('tone');
    const [output, setOutput] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState('');
    const [aiReplies, setAiReplies] = useState<string[]>([]);
    const [repliesLoading, setRepliesLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
                onChange={setActiveTab}
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
                    <Tabs.Tab value="tone" icon={<IconBulb size={18} />}>Tone</Tabs.Tab>
                    <Tabs.Tab value="actions" icon={<IconListCheck size={18} />}>Actions</Tabs.Tab>
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
                    <Group mt="xl" spacing="xs">
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
                    <Stack spacing="xl">
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

                        {aiReplies.length > 0 && (
                            <Stack spacing="xs" mt="md">
                                <Text size="sm" fw={500} c="dimmed">Suggested Replies:</Text>
                                {aiReplies.map((reply, index) => (
                                    <Paper 
                                        key={index} 
                                        p="sm" 
                                        withBorder 
                                        style={{ 
                                            background: copiedIndex === index ? '#e6ffe6' : '#f8f9fa',
                                            transition: 'background-color 0.3s ease',
                                            borderRadius: 8,
                                            borderColor: '#e8eaed'
                                        }}
                                    >
                                        <Group position="apart" align="flex-start" spacing="xs">
                                            <Box style={{ flex: 1 }}>
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                                    rehypePlugins={[rehypeRaw]}
                                                    components={{
                                                        strong: ({node, ...props}) => <strong style={{ color: '#222', fontWeight: 600 }} {...props} />,
                                                        em: ({node, ...props}) => <em style={{ color: '#555' }} {...props} />,
                                                        p: ({node, ...props}) => <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.5 }} {...props} />,
                                                    }}
                                                >
                                                    {reply}
                                                </ReactMarkdown>
                                            </Box>
                                            <Button
                                                variant="subtle"
                                                size="xs"
                                                leftSection={
                                                    copiedIndex === index 
                                                        ? <IconCheck size={12} /> 
                                                        : <IconCopy size={12} />
                                                }
                                                color={copiedIndex === index ? 'green' : 'gray'}
                                                onClick={() => handleCopy(reply, index)}
                                                styles={{
                                                    root: {
                                                        borderRadius: 6,
                                                        padding: '4px 8px'
                                                }
                                                }}
                                            >
                                                {copiedIndex === index ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
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
