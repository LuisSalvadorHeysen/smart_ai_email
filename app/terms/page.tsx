import { Container, Title, Text, Stack, Paper } from '@mantine/core';

export default function TermsOfService() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={1}>Terms of Service</Title>
        
        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Acceptance of Terms</Title>
          <Text mb="md">
            By accessing and using Smart AI Email Assistant, you accept and agree to be bound by 
            the terms and provision of this agreement. If you do not agree to abide by the above, 
            please do not use this service.
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Description of Service</Title>
          <Text mb="md">
            Smart AI Email Assistant is an AI-powered email management tool that provides:
          </Text>
          <Text component="ul" mb="md">
            <li>Email summarization and analysis</li>
            <li>Internship application tracking</li>
            <li>AI-powered email classification</li>
            <li>Email content extraction and organization</li>
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">User Responsibilities</Title>
          <Text mb="md">As a user of this service, you agree to:</Text>
          <Text component="ul" mb="md">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Use the service only for lawful purposes</li>
            <li>Not attempt to reverse engineer or hack the service</li>
            <li>Respect the privacy and rights of others</li>
            <li>Not use the service to send spam or malicious content</li>
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Privacy and Data</Title>
          <Text mb="md">
            Your privacy is important to us. Please review our Privacy Policy, which also governs 
            your use of the service, to understand our practices regarding the collection and use 
            of your information.
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Intellectual Property</Title>
          <Text mb="md">
            The service and its original content, features, and functionality are and will remain 
            the exclusive property of Smart AI Email Assistant and its licensors. The service is 
            protected by copyright, trademark, and other laws.
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Limitation of Liability</Title>
          <Text mb="md">
            In no event shall Smart AI Email Assistant, nor its directors, employees, partners, 
            agents, suppliers, or affiliates, be liable for any indirect, incidental, special, 
            consequential, or punitive damages, including without limitation, loss of profits, 
            data, use, goodwill, or other intangible losses, resulting from your use of the service.
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Service Availability</Title>
          <Text mb="md">
            We strive to maintain high availability of our service, but we do not guarantee 
            uninterrupted access. The service may be temporarily unavailable due to maintenance, 
            updates, or technical issues beyond our control.
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Termination</Title>
          <Text mb="md">
            We may terminate or suspend your account and bar access to the service immediately, 
            without prior notice or liability, under our sole discretion, for any reason 
            whatsoever and without limitation, including but not limited to a breach of the Terms.
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Changes to Terms</Title>
          <Text mb="md">
            We reserve the right, at our sole discretion, to modify or replace these Terms at 
            any time. If a revision is material, we will provide at least 30 days notice prior 
            to any new terms taking effect.
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Contact Information</Title>
          <Text mb="md">
            If you have any questions about these Terms of Service, please contact us at: 
            [Your Email Address]
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Governing Law</Title>
          <Text>
            These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], 
            without regard to its conflict of law provisions.
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
} 