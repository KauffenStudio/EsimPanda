import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Preview,
} from '@react-email/components';

export interface ResetEmailProps {
  resetUrl: string;
}

const fontFamily = 'Plus Jakarta Sans, Arial, sans-serif';

export function ResetEmail({ resetUrl }: ResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your eSIM Panda password</Preview>
      <Body style={{ backgroundColor: '#F6F9FC', margin: 0, padding: '40px 0', fontFamily }}>
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          {/* Blue header bar */}
          <Section
            style={{
              backgroundColor: '#2979FF',
              height: '64px',
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: '22px',
                fontWeight: 'bold',
                fontFamily,
                margin: 0,
                lineHeight: '64px',
              }}
            >
              eSIM Panda
            </Text>
          </Section>

          {/* Body section */}
          <Section style={{ padding: '32px 40px', textAlign: 'center' }}>
            <Text
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1A1A1A',
                fontFamily,
                margin: '0 0 16px',
              }}
            >
              Reset Your Password
            </Text>

            <Text
              style={{
                fontSize: '16px',
                color: '#666666',
                fontFamily,
                margin: '0 0 24px',
              }}
            >
              Click below to set a new password for your account.
            </Text>

            <Button
              href={resetUrl}
              style={{
                backgroundColor: '#2979FF',
                color: '#FFFFFF',
                fontFamily,
                fontSize: '16px',
                fontWeight: 'bold',
                height: '48px',
                lineHeight: '48px',
                borderRadius: '8px',
                padding: '0 32px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Reset Password
            </Button>

            <Text
              style={{
                fontSize: '14px',
                color: '#999999',
                fontFamily,
                margin: '24px 0 0',
              }}
            >
              This link expires in 1 hour. If you didn&apos;t request this, ignore this email.
            </Text>
          </Section>

          {/* Legal footer */}
          <Section style={{ padding: '0 40px 24px', textAlign: 'center' }}>
            <Text
              style={{
                fontSize: '12px',
                color: '#999999',
                fontFamily,
                margin: 0,
              }}
            >
              eSIM Panda
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ResetEmail;
