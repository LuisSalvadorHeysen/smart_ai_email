'use client';

import { useEffect, useState } from "react";
import { Card, Group, Avatar, Text, ScrollArea, Badge, Box, Modal, Loader, Paper, Divider } from '@mantine/core';

type Email = {
    id: string;
    subject: string;
    from: string;
    date: string;
};

type EmailDetail = Email & { body: string };

export default function EmailList() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [opened, setOpened] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
    const [loadingEmail, setLoadingEmail] = useState(false);

    useEffect(() => {
        fetch("/api/gmail")
        .then((res) => res.json())
        .then((data) => {
            setEmails(Array.isArray(data) ? data : []);
            setLoading(false);
        });
    }, []);

    const handleEmailClick = async (id: string) => {
        setLoadingEmail(true);
        setOpened(true);
        const res = await fetch(`/api/gmail?id=${id}`);
        const data = await res.json();
        setSelectedEmail(data);
        setLoadingEmail(false);
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
                        <Divider my="md" />
                        <Box
                            sx={{
                                background: "#fff",
                                borderRadius: 8,
                                padding: 16,
                                minHeight: 200,
                                maxHeight: 400,
                                overflowY: "auto",
                                fontSize: "1rem",
                                fontFamily: "Inter, sans-serif",
                                color: "#222",
                                boxShadow: "0 2px 8px rgba(60,72,88,0.07)",
                            }}
                            dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
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
