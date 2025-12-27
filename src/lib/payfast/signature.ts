/**
 * Payfast Signature Generation
 * Implements MD5 signature generation according to Payfast specifications
 * https://developers.payfast.co.za/docs#checkout_page
 */

import crypto from 'crypto';
import { payfastConfig } from './config';

/**
 * Generates MD5 signature for Payfast payload
 * Following official Payfast signature generation rules:
 * 1. Use parameters in ORDER (NOT alphabetically sorted)
 * 2. For CHECKOUT: Include all fields (including merchant_key)
 * 3. For ITN: Exclude merchant_key and signature
 * 4. Skip empty values
 * 5. URL encode values with spaces as '+' (not '%20')
 * 6. Uppercase specific encodings (%2F, %3A)
 * 7. Append passphrase (if configured)
 * 8. Generate MD5 hash
 */
export function generateSignature(
  payload: Array<[string, string | number]>,
  excludeMerchantKey: boolean = false
): string {
  const parts: string[] = [];

  console.log('[Payfast Signature] Generating signature with excludeMerchantKey:', excludeMerchantKey);
  console.log('[Payfast Signature] Input payload fields:', payload.map(([k]) => k).join(', '));

  for (const [key, rawValue] of payload) {
    // Always exclude signature field
    if (key === 'signature') continue;
    
    // Conditionally exclude merchant_key (only for ITN validation)
    if (excludeMerchantKey && key === 'merchant_key') {
      console.log('[Payfast Signature] Skipping merchant_key (ITN mode)');
      continue;
    }

    // For ITN: Include empty values (Payfast includes them)
    // For checkout: Skip empty values
    if (!excludeMerchantKey && !rawValue) {
      continue;
    }

    // URL encode and fix encoding
    const encoded = encodeURIComponent(String(rawValue).trim())
      .replace(/%20/g, '+')
      .replace(/%2f/gi, '%2F')
      .replace(/%3a/gi, '%3A');

    parts.push(`${key}=${encoded}`);
  }

  let stringToHash = parts.join('&');

  // Append passphrase if configured
  if (payfastConfig.passphrase) {
    const encodedPassphrase = encodeURIComponent(payfastConfig.passphrase.trim())
      .replace(/%20/g, '+')
      .replace(/%2f/gi, '%2F')
      .replace(/%3a/gi, '%3A');
    stringToHash += `&passphrase=${encodedPassphrase}`;
  }

  // Debug logging
  console.log('[Payfast Signature] String to hash:', stringToHash);
  console.log('[Payfast Signature] Fields included:', parts.length);

  // Generate MD5 hash
  const signature = crypto.createHash('md5').update(stringToHash).digest('hex');
  console.log('[Payfast Signature] Generated signature:', signature);

  return signature;
}

/**
 * Validates Payfast signature (for ITN)
 * Excludes merchant_key from validation
 */
export function validateSignature(
  payload: Array<[string, string | number]>,
  providedSignature: string
): boolean {
  // For ITN validation, exclude merchant_key
  const calculatedSignature = generateSignature(payload, true);
  console.log('[Payfast Signature] Validating - Provided:', providedSignature);
  console.log('[Payfast Signature] Validating - Calculated:', calculatedSignature);
  return calculatedSignature === providedSignature;
}
