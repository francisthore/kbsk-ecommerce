import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export const PasswordResetEmail = ({
  userName,
  resetUrl,
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>KBSK Trading Enterprises CC</Heading>
          </Section>
          
          <Section style={content}>
            <Heading as="h2" style={subHeading}>
              Reset Your Password
            </Heading>
            
            <Text style={text}>
              Hi {userName},
            </Text>
            
            <Text style={text}>
              We received a request to reset your password for your KBSK Trading Enterprises CC account. Click the button below to create a new password.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>
            
            <Text style={text}>
              Or copy and paste this link into your browser:
            </Text>
            
            <Text style={linkText}>
              {resetUrl}
            </Text>
            
            <Hr style={hr} />
            
            <Text style={warningText}>
              <strong>Security Notice:</strong> This password reset link will expire in 1 hour.
            </Text>
            
            <Text style={footer}>
              If you didn&apos;t request a password reset, please ignore this email or contact support if you have concerns. Your password will remain unchanged.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 20px',
  backgroundColor: '#1a472a',
  textAlign: 'center' as const,
};

const heading = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
  letterSpacing: '2px',
};

const content = {
  padding: '0 48px',
};

const subHeading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#1a1a1a',
  marginTop: '32px',
  marginBottom: '24px',
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const buttonContainer = {
  padding: '24px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#e67e22',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const linkText = {
  color: '#0066cc',
  fontSize: '14px',
  lineHeight: '20px',
  wordBreak: 'break-all' as const,
  marginBottom: '24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const warningText = {
  color: '#d9534f',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '16px',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '24px',
};
