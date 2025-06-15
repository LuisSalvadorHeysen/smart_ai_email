'use client';
import { useState } from 'react';
import { Tabs, Textarea, Button, Group, Paper, Text, Loader, Stack } from '@mantine/core';
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
            // Fallback for older browsers
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
        <Paper mt="md" p="md" withBorder>
            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Tab value="tone" icon={<IconBulb size={14} />}>Tone</Tabs.Tab>
                    <Tabs.Tab value="actions" icon={<IconListCheck size={14} />}>Actions</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="tone" pt="md">
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.currentTarget.value)}
                        placeholder="Type your draft here..."
                        minRows={8}
                        autosize
                        maxRows={12}
                        style={{ fontSize: '14px' }}
                    />
                    <Group mt="sm" spacing="xs">
                        {['formal', 'friendly', 'concise', 'assertive'].map((tone) => (
                            <Button
                                key={tone}
                                variant="outline"
                                size="xs"
                                onClick={() => handleAIRequest('rewrite', tone)}
                                loading={loading}
                            >
                                Make {tone}
                            </Button>
                        ))}
                    </Group>
                </Tabs.Panel>
                
                <Tabs.Panel value="actions" pt="md">
                    <Stack spacing="md">
                        <Button 
                            onClick={() => handleAIRequest('actions')} 
                            loading={loading}
                            variant="light"
                            fullWidth
                        >
                            Extract Action Items
                        </Button>
                        
                        <Button 
                            onClick={handleGenerateReplies}
                            loading={repliesLoading}
                            variant="filled"
                            fullWidth
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
                                            transition: 'background-color 0.3s ease'
                                        }}
                                    >
                                        <Group position="apart" align="flex-start" spacing="xs">
                                            <Text size="sm" style={{ flex: 1 }}>
                                                {reply}
                                            </Text>
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

            {error && <Text color="red" mt="md">{error}</Text>}

            {output.length > 0 && (
                <Paper mt="md" p="md" withBorder>
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
                                    listStyleType: 'disc' 
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
