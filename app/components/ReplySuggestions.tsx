'use client';

import { useState } from 'react';
import { 
    Button, Loader, Paper, Text, Group, 
    CopyButton, Tooltip, Alert 
} from '@mantine/core';
import { IconBulb, IconCopy, IconAlertCircle } from '@tabler/icons-react';

export default function ReplySuggestions({ 
    subject, 
    body 
}: { 
    subject: string;
    body: string;
}) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSuggest = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/suggest-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, body }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const { suggestions } = await res.json();
            setSuggestions(suggestions || []);

        } catch (err) {
            console.error('[UI-ERROR]', err);
            setError('Failed to load suggestions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <Button 
                onClick={handleSuggest}
                leftSection={<IconBulb size={16} />} // Changed to leftSection
                loading={loading}
                variant="light"
            >
                AI Reply Suggestions
            </Button>

            {error && (
                <Alert 
                    icon={<IconAlertCircle size={16} />} 
                    color="red" 
                    mt="sm"
                >
                    {error}
                </Alert>
            )}

            <Group mt="md" spacing="sm">
                {suggestions.map((reply, index) => (
                    <CopyButton key={index} value={reply}>
                        {({ copied, copy }) => (
                            <Tooltip label="Click to copy" position="right">
                                <Paper
                                    p="sm" 
                                    withBorder
                                    className={`cursor-pointer transition-colors ${
                                        copied ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                                    }`}
                                    onClick={copy}
                                >
                                    <Group spacing="sm">
                                        <IconCopy size={14} className="text-gray-500" />
                                        <Text size="sm" className="flex-1">
                                            {reply}
                                        </Text>
                                    </Group>
                                </Paper>
                            </Tooltip>
                        )}
                    </CopyButton>
                ))}
            </Group>
        </div>
    );
}
