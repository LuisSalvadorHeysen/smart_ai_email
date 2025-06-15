'use client';
import { useState } from 'react';
import { Textarea, Button, Group, Paper, Loader } from '@mantine/core';

export default function ToneRewriter() {
  const [draft, setDraft] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState('formal');

  const handleRewrite = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rewrite-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: draft, tone }),
      });
      const { rewritten } = await res.json();
      setRewritten(rewritten);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type your draft here..."
        minRows={4}
      />
      
      <Group mt="sm">
        {['formal', 'friendly', 'concise', 'assertive'].map((t) => (
          <Button
            key={t}
            variant={tone === t ? 'filled' : 'outline'}
            onClick={() => setTone(t)}
          >
            {t}
          </Button>
        ))}
      </Group>

      <Button mt="sm" onClick={handleRewrite} loading={loading}>
        Rewrite
      </Button>

      {rewritten && (
        <Paper mt="md" p="md" withBorder>
          <div dangerouslySetInnerHTML={{ __html: rewritten.replace(/\n/g, '<br/>') }} />
        </Paper>
      )}
    </div>
  );
}

