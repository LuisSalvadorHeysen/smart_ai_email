'use client';

import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { Button, Loader, Paper, Text, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function SummaryButton() {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        setSummary(null);

        try {
            const res = await fetch('/api/summary');

            if (!res.ok) {
                throw new Error(`Request failed: ${res.status} ${res.statusText}`);
            }

            const contentType = res.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                throw new Error('Invalid response format');
            }

            const data = await res.json();

            if (!data?.summary) {
                throw new Error('No summary in response');
            }

            setSummary(data.summary);
        } catch (err) {
            console.error('Summary error:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate summary');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Button 
                onClick={handleClick} 
                disabled={loading}
                leftSection={loading && <Loader size="sm" type="dots" />}
            >
                {loading ? 'Generating Summary...' : 'Summarize Last 24 Hours'}
            </Button>

            {error && (
                <Alert 
                    icon={<IconAlertCircle size="1rem" />} 
                    title="Error" 
                    color="red" 
                    mt="md"
                >
                    {error}
                </Alert>
            )}

            {summary && (
                <Paper p="md" mt="md" withBorder>
                    <Text fw={500} mb="sm">📩 AI Summary:</Text>
                    <ReactMarkdown
                        children={summary}
                        components={{
                            h1: ({node, ...props}) => <Text component="h1" size="xl" fw={700} my="md" {...props} />,
                                h2: ({node, ...props}) => <Text component="h2" size="lg" fw={600} my="sm" {...props} />,
                                h3: ({node, ...props}) => <Text component="h3" size="md" fw={500} my="sm" {...props} />,
                                p: ({node, ...props}) => <Text my="xs" {...props} />,
                                li: ({node, ...props}) => <li style={{ marginBottom: 6 }} {...props} />,
                                strong: ({node, ...props}) => <strong style={{ color: "#1c1c1e" }} {...props} />,
                        }}
                        // Optionally add className or styles for Paper
                    />
                </Paper>
            )}
        </div>
    );
}
