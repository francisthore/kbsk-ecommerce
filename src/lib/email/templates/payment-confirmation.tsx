/**
 * Payment Confirmation Email Template
 * Sent when payment is successfully processed
 */

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
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import { render } from '@react-email/components';
import { sendEmail } from '../sender';

interface PaymentConfirmationData {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalAmount: string;
  currency: string;
  paymentMethod: string;
  transactionId: string;
}

export interface PaymentConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  transactionId: string;
  totalAmount: string;
  currency: string;
  paymentMethod: string;
}

export const PaymentConfirmationEmail = ({
  customerName,
  orderNumber,
  transactionId,
  totalAmount,
  currency,
  paymentMethod,
}: PaymentConfirmationEmailProps) => {
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
              Payment Confirmed! 🎉
            </Heading>
            
            <Text style={text}>
              Hi {customerName},
            </Text>
            
            <Text style={text}>
              Thank you! Your payment has been successfully processed. Your order is confirmed and will be prepared for shipment.
            </Text>
            
            <Section style={paymentInfoBox}>
              <Text style={infoText}>
                <strong>Order Number:</strong> #{orderNumber}
              </Text>
              <Text style={infoText}>
                <strong>Transaction ID:</strong> {transactionId}
              </Text>
              <Text style={infoText}>
                <strong>Payment Method:</strong> {paymentMethod}
              </Text>
              <Text style={infoText}>
                <strong>Amount Paid:</strong> {currency} {parseFloat(totalAmount).toFixed(2)}
              </Text>
            </Section>
            
            <Section style={statusBox}>
              <Text style={statusText}>
                <strong>📦 Order Status:</strong> Pending Processing
              </Text>
              <Text style={statusSubtext}>
                Your order is confirmed and will be processed within 1-3 business days.
              </Text>
            </Section>
            
            <Heading as="h3" style={sectionHeading}>
              What happens next?
            </Heading>
            
            <Text style={text}>
              • We&apos;ll prepare your order for shipment
            </Text>
            <Text style={text}>
              • You&apos;ll receive a shipping confirmation email with tracking details
            </Text>
            <Text style={text}>
              • Your order will be delivered within 3-7 business days
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/dashboard/orders`}>
                View Order Details
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              Questions? Contact us at{' '}
              <a href="mailto:support@kbsktrading.com" style={link}>
                support@kbsktrading.com
              </a>
            </Text>
            
            <Text style={footer}>
              © {new Date().getFullYear()} KBSK Trading Enterprises CC. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentConfirmationEmail;

// Styles matching order confirmation email
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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

const paymentInfoBox = {
  backgroundColor: '#f8f9fa',
  padding: '16px',
  borderRadius: '6px',
  marginTop: '24px',
  marginBottom: '24px',
};

const statusBox = {
  backgroundColor: '#fef3c7',
  padding: '16px',
  borderRadius: '6px',
  borderLeft: '4px solid #f59e0b',
  marginBottom: '24px',
};

const infoText = {
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const statusText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
};

const statusSubtext = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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
  marginTop: '12px',
};

const link = {
  color: '#e67e22',
  textDecoration: 'underline',
};

// Function to send the email
export async function sendPaymentConfirmationEmail(data: PaymentConfirmationData) {
  const emailHtml = await render(
    <PaymentConfirmationEmail
      customerName={data.customerName}
      orderNumber={data.orderNumber}
      transactionId={data.transactionId}
      totalAmount={data.totalAmount}
      currency={data.currency}
      paymentMethod={data.paymentMethod}
    />
  );

  return sendEmail(
    data.customerEmail,
    `Payment Confirmed - Order ${data.orderNumber}`,
    emailHtml,
    'KBSK Trading Enterprises CC <orders@kbsktrading.net>'
  );
}
