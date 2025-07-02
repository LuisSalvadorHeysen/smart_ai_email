import { Container, Title, Text, Stack, Paper } from '@mantine/core';

export default function PrivacyPolicy() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={1}>Privacy Policy</Title>
        
        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Information We Collect</Title>
          <Text mb="md">
            Smart AI Email Assistant collects and processes the following information:
          </Text>
          <Text component="ul" mb="md">
            <li>Email addresses and basic profile information from Google OAuth</li>
            <li>Email content for AI processing and summarization</li>
            <li>Internship application data extracted from emails</li>
            <li>Usage analytics to improve our service</li>
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">How We Use Your Information</Title>
          <Text mb="md">We use your information to:</Text>
          <Text component="ul" mb="md">
            <li>Provide email summarization and AI analysis services</li>
            <li>Track and manage internship applications</li>
            <li>Improve our AI algorithms and user experience</li>
            <li>Send important service updates and notifications</li>
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Data Security</Title>
          <Text mb="md">
            We implement industry-standard security measures to protect your data:
          </Text>
          <Text component="ul" mb="md">
            <li>All data is encrypted in transit and at rest</li>
            <li>Access to your data is limited to authorized personnel only</li>
            <li>We use secure cloud infrastructure (Vercel, Google Cloud)</li>
            <li>Regular security audits and updates</li>
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Data Sharing</Title>
          <Text mb="md">
            We do not sell, trade, or rent your personal information to third parties. 
            We may share data only in the following circumstances:
          </Text>
          <Text component="ul" mb="md">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Your Rights</Title>
          <Text mb="md">You have the right to:</Text>
          <Text component="ul" mb="md">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
            <li>Export your data in a portable format</li>
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Contact Us</Title>
          <Text mb="md">
            If you have any questions about this Privacy Policy or our data practices, 
            please contact us at: [Your Email Address]
          </Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={2} size="h3" mb="md">Updates to This Policy</Title>
          <Text>
            We may update this Privacy Policy from time to time. We will notify you 
            of any material changes by posting the new policy on this page and updating 
            the "Last Updated" date.
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
} 