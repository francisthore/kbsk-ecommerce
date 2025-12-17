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

export interface OrderItem {
  productName: string;
  variantName?: string;
  quantity: number;
  priceAtPurchase: string;
}

export interface OrderConfirmationEmailProps {
  userName: string;
  orderNumber: string;
  orderId: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: string;
  taxTotal: string;
  shippingCost: string;
  totalAmount: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: string;
}

export const OrderConfirmationEmail = ({
  userName,
  orderNumber,
  orderId,
  orderDate,
  items,
  subtotal,
  taxTotal,
  shippingCost,
  totalAmount,
  shippingAddress,
  paymentMethod,
}: OrderConfirmationEmailProps) => {
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
              Order Confirmation
            </Heading>
            
            <Text style={text}>
              Hi {userName},
            </Text>
            
            <Text style={text}>
              Thank you for your order! We&apos;ve received your order and are processing it now. You&apos;ll receive a shipping notification once your order is on its way.
            </Text>
            
            <Section style={orderInfoBox}>
              <Text style={orderInfoText}>
                <strong>Order Number:</strong> #{orderNumber}
              </Text>
              <Text style={orderInfoText}>
                <strong>Order Date:</strong> {orderDate}
              </Text>
            </Section>
            
            <Heading as="h3" style={sectionHeading}>
              Order Items
            </Heading>
            
            {items.map((item, index) => (
              <Section key={index} style={itemRow}>
                <Row>
                  <Column style={itemDetails}>
                    <Text style={itemName}>{item.productName}</Text>
                    {item.variantName && (
                      <Text style={variantText}>{item.variantName}</Text>
                    )}
                    <Text style={quantityText}>Qty: {item.quantity}</Text>
                  </Column>
                  <Column style={itemPrice}>
                    <Text style={priceText}>${item.priceAtPurchase}</Text>
                  </Column>
                </Row>
              </Section>
            ))}
            
            <Hr style={hr} />
            
            <Section style={totalsSection}>
              <Row>
                <Column style={totalLabel}>
                  <Text style={totalText}>Subtotal:</Text>
                </Column>
                <Column style={totalValue}>
                  <Text style={totalText}>${subtotal}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column style={totalLabel}>
                  <Text style={totalText}>Shipping:</Text>
                </Column>
                <Column style={totalValue}>
                  <Text style={totalText}>${shippingCost}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column style={totalLabel}>
                  <Text style={totalText}>Tax:</Text>
                </Column>
                <Column style={totalValue}>
                  <Text style={totalText}>${taxTotal}</Text>
                </Column>
              </Row>
              
              <Hr style={thinHr} />
              
              <Row>
                <Column style={totalLabel}>
                  <Text style={grandTotalText}>Total:</Text>
                </Column>
                <Column style={totalValue}>
                  <Text style={grandTotalText}>${totalAmount}</Text>
                </Column>
              </Row>
            </Section>
            
            <Hr style={hr} />
            
            <Heading as="h3" style={sectionHeading}>
              Shipping Address
            </Heading>
            
            <Text style={addressText}>
              {shippingAddress.name}<br />
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
              {shippingAddress.country}
            </Text>
            
            {paymentMethod && (
              <>
                <Heading as="h3" style={sectionHeading}>
                  Payment Method
                </Heading>
                <Text style={text}>{paymentMethod}</Text>
              </>
            )}
            
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/dashboard/orders/${orderId}`}>
                View Order Details
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              Questions about your order? Contact our support team at support@kbsktrading.net or reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

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

const orderInfoBox = {
  backgroundColor: '#f8f9fa',
  padding: '16px',
  borderRadius: '6px',
  marginTop: '24px',
  marginBottom: '24px',
};

const orderInfoText = {
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const itemRow = {
  marginBottom: '16px',
};

const itemDetails = {
  width: '70%',
};

const itemPrice = {
  width: '30%',
  textAlign: 'right' as const,
};

const itemName = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const variantText = {
  color: '#666',
  fontSize: '14px',
  margin: '0 0 4px 0',
};

const quantityText = {
  color: '#888',
  fontSize: '14px',
  margin: '0',
};

const priceText = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const totalsSection = {
  marginTop: '16px',
};

const totalLabel = {
  width: '70%',
};

const totalValue = {
  width: '30%',
  textAlign: 'right' as const,
};

const totalText = {
  color: '#444',
  fontSize: '15px',
  margin: '8px 0',
};

const grandTotalText = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '8px 0',
};

const addressText = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
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

const thinHr = {
  borderColor: '#e6ebf1',
  margin: '16px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '24px',
};
