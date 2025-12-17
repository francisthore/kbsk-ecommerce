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

export interface ShippingNotificationEmailProps {
  userName: string;
  orderNumber: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export const ShippingNotificationEmail = ({
  userName,
  orderNumber,
  orderId,
  trackingNumber,
  carrier,
  trackingUrl,
  estimatedDelivery,
  shippingAddress,
}: ShippingNotificationEmailProps) => {
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
              Your Order Has Shipped! 📦
            </Heading>
            
            <Text style={text}>
              Hi {userName},
            </Text>
            
            <Text style={text}>
              Great news! Your order has been shipped and is on its way to you.
            </Text>
            
            <Section style={trackingBox}>
              <Text style={trackingLabel}>Tracking Number</Text>
              <Text style={trackingNumberStyle}>{trackingNumber}</Text>
              <Text style={carrierText}>Carrier: {carrier}</Text>
              {estimatedDelivery && (
                <Text style={deliveryText}>
                  Estimated Delivery: {estimatedDelivery}
                </Text>
              )}
            </Section>
            
            {trackingUrl && (
              <Section style={buttonContainer}>
                <Button style={button} href={trackingUrl}>
                  Track Your Package
                </Button>
              </Section>
            )}
            
            <Text style={text}>
              <strong>Order Number:</strong> #{orderNumber}
            </Text>
            
            <Hr style={hr} />
            
            <Heading as="h3" style={sectionHeading}>
              Shipping To
            </Heading>
            
            <Text style={addressText}>
              {shippingAddress.name}<br />
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
              {shippingAddress.country}
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={secondaryButton} href={`${baseUrl}/dashboard/orders/${orderId}`}>
                View Order Details
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              If you have any questions about your shipment, please contact our support team at support@kbsktrading.net.
            </Text>
            
            <Text style={footer}>
              Thank you for shopping with KBSK Trading Enterprises CC!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ShippingNotificationEmail;

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

const trackingBox = {
  backgroundColor: '#f0f8ff',
  border: '2px solid #4a90e2',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const trackingLabel = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  marginBottom: '8px',
};

const trackingNumberStyle = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  marginTop: '8px',
  marginBottom: '16px',
  fontFamily: 'monospace',
};

const carrierText = {
  color: '#444',
  fontSize: '16px',
  marginBottom: '8px',
};

const deliveryText = {
  color: '#28a745',
  fontSize: '16px',
  fontWeight: '600',
  marginTop: '8px',
};

const addressText = {
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
  backgroundColor: '#4a90e2',
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
