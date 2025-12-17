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

export interface OrderCancelledEmailProps {
  userName: string;
  orderNumber: string;
  orderId: string;
  cancellationDate: string;
  refundAmount: string;
  refundMethod?: string;
  cancellationReason?: string;
}

export const OrderCancelledEmail = ({
  userName,
  orderNumber,
  orderId,
  cancellationDate,
  refundAmount,
  refundMethod,
  cancellationReason,
}: OrderCancelledEmailProps) => {
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
              Order Cancelled
            </Heading>
            
            <Text style={text}>
              Hi {userName},
            </Text>
            
            <Text style={text}>
              Your order has been cancelled as requested. We&apos;ve processed the cancellation and your refund is on its way.
            </Text>
            
            <Section style={infoBox}>
              <Text style={infoText}>
                <strong>Order Number:</strong> #{orderNumber}
              </Text>
              <Text style={infoText}>
                <strong>Cancellation Date:</strong> {cancellationDate}
              </Text>
              {cancellationReason && (
                <Text style={infoText}>
                  <strong>Reason:</strong> {cancellationReason}
                </Text>
              )}
            </Section>
            
            <Hr style={hr} />
            
            <Heading as="h3" style={sectionHeading}>
              Refund Information
            </Heading>
            
            <Section style={refundBox}>
              <Text style={refundAmountStyle}>
                Refund Amount: ${refundAmount}
              </Text>
              {refundMethod && (
                <Text style={refundMethodStyle}>
                  Refund Method: {refundMethod}
                </Text>
              )}
              <Text style={refundNote}>
                Please allow 5-10 business days for the refund to appear in your account.
              </Text>
            </Section>
            
            <Text style={text}>
              If you have any questions about this cancellation or your refund, please don&apos;t hesitate to contact our support team.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/products`}>
                Continue Shopping
              </Button>
            </Section>
            
            <Section style={buttonContainer}>
              <Button style={secondaryButton} href={`${baseUrl}/dashboard/orders/${orderId}`}>
                View Order Details
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              We&apos;re sorry to see this order cancelled. If there&apos;s anything we can do to improve your experience, please let us know at support@kbsktrading.net.
            </Text>
            
            <Text style={footer}>
              Thank you for choosing KBSK Trading Enterprises CC.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderCancelledEmail;

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
  marginTop: '24px',
  marginBottom: '16px',
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const infoBox = {
  backgroundColor: '#fff3cd',
  borderLeft: '4px solid #ffc107',
  padding: '16px',
  marginTop: '24px',
  marginBottom: '24px',
};

const infoText = {
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const refundBox = {
  backgroundColor: '#d4edda',
  borderLeft: '4px solid #28a745',
  padding: '20px',
  borderRadius: '4px',
  marginTop: '16px',
  marginBottom: '24px',
};

const refundAmountStyle = {
  color: '#155724',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const refundMethodStyle = {
  color: '#155724',
  fontSize: '16px',
  margin: '0 0 12px 0',
};

const refundNote = {
  color: '#155724',
  fontSize: '14px',
  fontStyle: 'italic' as const,
  margin: '12px 0 0 0',
};

const buttonContainer = {
  padding: '12px 0',
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

const secondaryButton = {
  backgroundColor: '#6c757d',
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
