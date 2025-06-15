'use client';
import { useState } from 'react';
import { Tabs, Textarea, Button, Group, Paper, Text, Loader } from '@mantine/core';
import { IconBulb, IconListCheck } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIAssistant({ emailBody }: { emailBody: string }) {
    const [activeTab, setActiveTab] = useState('tone');
    const [output, setOutput] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState('');

    const handleAIRequest = async (action: string, tone?: string) => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = `/api/ai/${action}`;
            const body =
                action === 'rewrite'
                    ? { draft, tone }
                    : { text: emailBody };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('AI request failed');

            const data = await res.json();
            setOutput(Array.isArray(data.output) ? data.output : [data.output]);
        } catch (err) {
            setError("Failed to process request");
        } finally {
            setLoading(false);
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
                        minRows={4}
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
                    <Button 
                        onClick={() => handleAIRequest('actions')} 
                        loading={loading}
                        variant="light"
                    >
                        Extract Action Items
                    </Button>
                </Tabs.Panel>
            </Tabs>

            {error && <Text color="red" mt="md">{error}</Text>}

            {output.length > 0 && (
                <Paper mt="md" p="md" withBorder>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            ul: ({node, ...props}) => <ul style={{ marginLeft: 20, marginBottom: 12 }} {...props} />,
                            ol: ({node, ...props}) => <ol style={{ marginLeft: 20, marginBottom: 12 }} {...props} />,
                            li: ({node, ...props}) => <li style={{ marginBottom: 4 }} {...props} />,
                            p: ({node, ...props}) => <p style={{ marginBottom: 8 }} {...props} />,
                            strong: ({node, ...props}) => <strong style={{ color: '#222' }} {...props} />,
                            em: ({node, ...props}) => <em style={{ color: '#555' }} {...props} />,
                            code: ({node, ...props}) => (
                                <code style={{
                                    background: '#f4f4f4',
                                    borderRadius: 4,
                                    padding: '2px 6px',
                                    fontSize: '0.95em'
                                }} {...props} />
                            ),
                        }}
                    >
                        {output.join('\n')}
                    </ReactMarkdown>
                </Paper>
            )}
        </Paper>
    );
}

