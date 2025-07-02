'use client';

import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { Button, Loader, Paper, Text, Alert, Group } from '@mantine/core';
import { IconAlertCircle, IconChevronUp, IconChevronDown } from '@tabler/icons-react';

export default function SummaryButton() {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState(false);

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
            setCollapsed(false); // Show summary by default when created
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
                    <Group justify="space-between" align="center" style={{ cursor: 'pointer' }} onClick={() => setCollapsed(c => !c)}>
                        <Text fw={500} mb="sm">📩 AI Summary:</Text>
                        <Button
                            variant="subtle"
                            size="xs"
                            color="gray"
                            leftSection={collapsed ? <IconChevronDown size={16}/> : <IconChevronUp size={16}/>}
                            style={{ minWidth: 90 }}
                            tabIndex={-1}
                        >
                            {collapsed ? "Expand" : "Collapse"}
                        </Button>
                    </Group>
                    {!collapsed && (
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
                        />
                    )}
                </Paper>
            )}
        </div>
    );
}
