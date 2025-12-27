/**
 * Payfast Configuration
 * Manages merchant credentials and URLs for Payfast integration
 * Supports both sandbox and production environments
 */

export const payfastConfig = {
  // Merchant credentials - MUST be configured via environment variables
  merchantId: process.env.PAYFAST_MERCHANT_ID || '10000100',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
  passphrase: process.env.PAYFAST_PASSPHRASE || '', // Required for signature generation
  
  // Environment selection
  isProduction: process.env.PAYFAST_ENVIRONMENT === 'production',
  
  // URLs
  get processUrl() {
    return this.isProduction
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';
  },
  
  get validateUrl() {
    return this.isProduction
      ? 'https://www.payfast.co.za/eng/query/validate'
      : 'https://sandbox.payfast.co.za/eng/query/validate';
  },
  
  // Webhook URLs - dynamically generated based on deployment
  getNotifyUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/api/payfast/notify`;
  },
  
  getReturnUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/checkout-success`;
  },
  
  getCancelUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/checkout-cancel`;
  },
  
  // Valid Payfast IP addresses for ITN verification
  validHosts: [
    // Sandbox IPs
    'www.sandbox.payfast.co.za',
    'sandbox.payfast.co.za',
    '41.74.179.194',
    '41.74.179.195',
    '41.74.179.196',
    '41.74.179.197',
    
    // Production IPs
    'www.payfast.co.za',
    'payfast.co.za',
    '197.97.145.144',
    '197.97.145.145',
    '197.97.145.146',
    '197.97.145.147',
  ] as string[],
};
