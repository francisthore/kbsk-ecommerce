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

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kbsktrading.net';
  
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
              Welcome to KBSK Trading Enterprises CC! 🎉
            </Heading>
            
            <Text style={text}>
              Hi {userName},
            </Text>
            
            <Text style={text}>
              Thank you for joining KBSK Trading! Your email has been verified and your account is now active.
            </Text>
            
            <Text style={text}>
              We&apos;re excited to have you as part of our community. You now have access to our full catalog of premium products, exclusive deals, and personalized shopping experience.
            </Text>
            
            <Heading as="h3" style={sectionHeading}>
              What&apos;s Next?
            </Heading>
            
            <Text style={bulletText}>
              • <strong>Browse our catalog</strong> – Discover thousands of quality products
            </Text>
            
            <Text style={bulletText}>
              • <strong>Set up your profile</strong> – Add shipping addresses and payment methods
            </Text>
            
            <Text style={bulletText}>
              • <strong>Save favorites</strong> – Create wishlists for future purchases
            </Text>
            
            <Text style={bulletText}>
              • <strong>Track your orders</strong> – Monitor shipments in real-time
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/products`}>
                Start Shopping
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              If you have any questions, our support team is here to help. Just reply to this email or visit our help center.
            </Text>
            
            <Text style={footer}>
              Happy shopping!<br />
              The KBSK Trading Enterprises CC Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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

const sectionHeading = {
  fontSize: '18px',
  lineHeight: '1.3',
  fontWeight: '600',
  color: '#1a1a1a',
  marginTop: '32px',
  marginBottom: '16px',
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const bulletText = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '28px',
  marginBottom: '8px',
};

const buttonContainer = {
  padding: '32px 0',
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

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '16px',
};
