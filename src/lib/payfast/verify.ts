/**
 * Payfast ITN (Instant Transaction Notification) Verification
 * Implements security validation for Payfast webhooks
 */

import dns from 'dns';
import { promisify } from 'util';
import { payfastConfig } from './config';
import { validateSignature } from './signature';

const dnsResolve = promisify(dns.resolve4);

/**
 * Validates if the request comes from a valid Payfast server
 * Checks both IP address and hostname
 */
export async function isValidPayfastHost(ipAddress: string): Promise<boolean> {
  try {
    // Check if IP is in the whitelist
    if (payfastConfig.validHosts.includes(ipAddress)) {
      return true;
    }
    
    // For sandbox testing with localhost/ngrok, allow in non-production
    if (!payfastConfig.isProduction && 
        (ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('::ffff:127.'))) {
      return true;
    }
    
    // Try to resolve Payfast domains and check if IP matches
    const payfastDomains = [
      'www.payfast.co.za',
      'sandbox.payfast.co.za',
      'w1w.payfast.co.za',
      'w2w.payfast.co.za',
    ];
    
    for (const domain of payfastDomains) {
      try {
        const addresses = await dnsResolve(domain);
        if (addresses.includes(ipAddress)) {
          return true;
        }
      } catch {
        // Continue checking other domains
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error validating Payfast host:', error);
    return false;
  }
}

/**
 * Validates the Payfast ITN data
 * Performs all required security checks
 */
export interface PayfastITNData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  item_description?: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  merchant_id: string;
  signature: string;
  [key: string]: string | undefined;
}

export interface ITNValidationResult {
  valid: boolean;
  error?: string;
  data?: PayfastITNData;
}

export async function validateITN(
  dataArray: Array<[string, string]>,
  ipAddress: string,
  expectedAmount: number
): Promise<ITNValidationResult> {
  // Convert to object for data access
  const data = Object.fromEntries(dataArray);
  
  console.log('[Payfast ITN Validation] Starting validation');
  console.log('[Payfast ITN Validation] Data fields:', Object.keys(data));
  
  // 1. Verify signature
  const signature = data.signature;
  if (!signature) {
    console.log('[Payfast ITN Validation] ERROR: Missing signature');
    return { valid: false, error: 'Missing signature' };
  }
  
  console.log('[Payfast ITN Validation] Signature from Payfast:', signature);
  
  // Remove signature from array for validation (preserve original order)
  const dataWithoutSig = dataArray.filter(([key]) => key !== 'signature');
  
  console.log('[Payfast ITN Validation] Fields for signature calculation:', dataWithoutSig.map(([k]) => k).join(', '));
  
  const isSignatureValid = validateSignature(dataWithoutSig, signature);
  console.log('[Payfast ITN Validation] Signature valid?', isSignatureValid);
  
  if (!isSignatureValid) {
    return { valid: false, error: 'Invalid signature' };
  }
  
  // 2. Verify merchant ID
  if (data.merchant_id !== payfastConfig.merchantId) {
    return { valid: false, error: 'Invalid merchant ID' };
  }
  
  // 3. Verify IP address (skip in development for easier testing)
  if (payfastConfig.isProduction) {
    const validHost = await isValidPayfastHost(ipAddress);
    if (!validHost) {
      return { valid: false, error: 'Invalid source IP address' };
    }
  }
  
  // 4. Verify amount matches
  const receivedAmount = parseFloat(data.amount_gross);
  const expectedAmountRounded = Math.round(expectedAmount * 100) / 100;
  const receivedAmountRounded = Math.round(receivedAmount * 100) / 100;
  
  if (Math.abs(expectedAmountRounded - receivedAmountRounded) > 0.01) {
    return { 
      valid: false, 
      error: `Amount mismatch: expected ${expectedAmountRounded}, received ${receivedAmountRounded}` 
    };
  }
  
  return { 
    valid: true, 
    data: data as PayfastITNData 
  };
}

/**
 * Maps Payfast payment status to our internal payment status
 */
export function mapPaymentStatus(payfastStatus: string): 'completed' | 'failed' | 'initiated' {
  switch (payfastStatus.toUpperCase()) {
    case 'COMPLETE':
      return 'completed';
    case 'CANCELLED':
    case 'FAILED':
      return 'failed';
    default:
      return 'initiated';
  }
}

/**
 * Maps Payfast payment status to our internal order status
 */
export function mapOrderStatus(payfastStatus: string): 'paid' | 'cancelled' | 'pending' {
  switch (payfastStatus.toUpperCase()) {
    case 'COMPLETE':
      return 'paid';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
}
