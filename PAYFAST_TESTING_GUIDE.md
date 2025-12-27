# Payfast Integration - Testing Guide

## 🧪 Complete Testing Checklist

This guide covers all testing scenarios for the Payfast integration.

---

## 📋 Prerequisites

- [ ] Environment variables configured (`.env.payfast.template`)
- [ ] Database migration completed
- [ ] Development server running
- [ ] ngrok tunnel active (for ITN testing)

---

## 🔧 Setup for Local Testing

### 1. Configure Environment

```bash
# Copy template
cp .env.payfast.template .env.local

# Edit .env.local with sandbox credentials
PAYFAST_ENVIRONMENT=sandbox
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Setup ngrok for ITN Testing

```bash
# In a separate terminal
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update .env.local:
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io

# Restart dev server to pick up new URL
```

---

## ✅ Test Scenarios

### Test 1: Guest Checkout - Successful Payment

**Steps:**
1. Clear cookies/use incognito mode
2. Browse shop and add items to cart
3. Go to checkout (`/checkout`)
4. Select "Continue as Guest"
5. Fill in shipping form:
   ```
   Full Name: Test User
   Email: test@example.com
   Phone: 0821234567
   Address: 123 Test Street
   City: Cape Town
   Province: Western Cape
   Postal Code: 8001
   ```
6. Click "Place Order"
7. Verify redirect to Payfast sandbox
8. Use test card:
   ```
   Card Number: 4000 0000 0000 0002
   CVV: 123
   Expiry: 12/25
   ```
9. Complete payment
10. Verify redirect to success page

**Expected Results:**
- ✅ Order created with `status='pending'`
- ✅ Payment created with `status='initiated'`, `method='payfast'`
- ✅ Redirect to Payfast works
- ✅ ITN received and logged: `[Payfast ITN] Received notification`
- ✅ Signature validated: `[Payfast ITN] Validation passed`
- ✅ Order updated to `status='paid'`
- ✅ Payment updated to `status='completed'`
- ✅ Success page shows order details
- ✅ Payment status badge shows "Paid"

**Database Verification:**
```sql
-- Check order
SELECT id, status, total_amount, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 1;

-- Check payment
SELECT id, status, method, transaction_id, paid_at 
FROM payments 
ORDER BY id DESC 
LIMIT 1;
```

---

### Test 2: Authenticated User Checkout

**Steps:**
1. Register/login as a user
2. Add items to cart
3. Go to checkout
4. Fill in form (email should be pre-filled)
5. Check "Save address for future orders"
6. Complete payment flow

**Expected Results:**
- ✅ Email pre-populated
- ✅ Order linked to `user_id`
- ✅ Address saved to user account
- ✅ Order appears in user's order history
- ✅ Payment completes successfully

---

### Test 3: Payment Cancellation

**Steps:**
1. Start checkout process
2. Redirect to Payfast
3. Click "Cancel" or back button on Payfast page
4. Verify redirect to cancel page

**Expected Results:**
- ✅ Order created with `status='pending'`
- ✅ Payment created with `status='initiated'`
- ✅ Redirect to `/checkout-cancel?order_id=xxx`
- ✅ Cancel page displays order information
- ✅ "Try Again" button returns to checkout
- ✅ No charges made

**Database State:**
```sql
-- Order should remain pending
SELECT status FROM orders WHERE id = 'order-id';
-- Expected: 'pending'

-- Payment should remain initiated
SELECT status FROM payments WHERE order_id = 'order-id';
-- Expected: 'initiated'
```

---

### Test 4: Cart Persistence After Login

**Steps:**
1. As guest, add items to cart
2. Go to checkout
3. Click "Sign In"
4. Login with existing account
5. Return to checkout

**Expected Results:**
- ✅ Guest cart persists after login
- ✅ Cart items merge if user had existing cart
- ✅ No duplicate items
- ✅ Checkout form ready

---

### Test 5: Multiple Item Order

**Steps:**
1. Add 5+ different items to cart
2. Complete checkout
3. Verify all items in order

**Expected Results:**
- ✅ All items appear in order
- ✅ Correct quantities
- ✅ Accurate pricing
- ✅ Subtotal calculation correct
- ✅ Shipping fee applied correctly
- ✅ Total amount matches Payfast charge

---

### Test 6: Different Billing Address

**Steps:**
1. Start checkout
2. Uncheck "Billing same as shipping"
3. Fill different billing address
4. Complete payment

**Expected Results:**
- ✅ Two address records created
- ✅ Order references both addresses
- ✅ Payment completes successfully

---

### Test 7: Delivery vs Pickup

**Steps:**
1. Test with "Delivery" option (shipping fee applied)
2. Test with "Pickup" option (no shipping fee)

**Expected Results:**
- ✅ Delivery: Shipping fee (R135.00) included
- ✅ Pickup: Zero shipping fee
- ✅ Totals calculate correctly
- ✅ Payfast amount matches

---

### Test 8: ITN Signature Validation

**Steps:**
1. Complete a payment
2. Check terminal logs for ITN

**Look for these logs:**
```
[Payfast ITN] Received notification: {
  m_payment_id: 'order-uuid',
  pf_payment_id: '123456',
  payment_status: 'COMPLETE',
  amount_gross: '150.00'
}
[Payfast ITN] Validation passed, processing payment
[Payfast ITN] Updated order and payment: {
  orderId: 'order-uuid',
  orderStatus: 'paid',
  paymentStatus: 'completed'
}
```

**Expected Results:**
- ✅ Signature validation passes
- ✅ IP validation passes (if enabled)
- ✅ Merchant ID validated
- ✅ Amount validated

---

### Test 9: Duplicate ITN Handling

**Steps:**
1. Complete a payment
2. Manually trigger duplicate ITN (optional advanced test)

**Expected Results:**
- ✅ First ITN updates order
- ✅ Duplicate ITN doesn't cause errors
- ✅ Order status remains correct
- ✅ No duplicate payment records

---

### Test 10: Failed Payment

**Steps:**
1. Start checkout
2. At Payfast, use invalid card details or simulate failure
3. Verify handling

**Expected Results:**
- ✅ ITN received with `payment_status='FAILED'`
- ✅ Payment updated to `status='failed'`
- ✅ Order remains `status='pending'`
- ✅ User can retry payment

---

## 🐛 Common Issues & Solutions

### Issue: ITN Not Received

**Symptoms:**
- Order created but status stays 'pending'
- No ITN logs in terminal
- Payment not updating

**Debug Steps:**
1. Check ngrok is running: `ngrok http 3000`
2. Verify `NEXT_PUBLIC_APP_URL` matches ngrok URL
3. Check webhook URL format: `{URL}/api/payfast/notify`
4. Test webhook endpoint directly:
   ```bash
   curl https://your-ngrok-url.ngrok.io/api/payfast/notify
   # Should return: {"message":"Payfast ITN endpoint. POST only."}
   ```
5. Check Payfast dashboard for ITN status

**Solutions:**
- Restart dev server after changing URL
- Ensure ngrok session hasn't expired
- Check firewall/network settings

---

### Issue: Signature Validation Fails

**Symptoms:**
- ITN received but validation fails
- Log: `[Payfast ITN] Validation failed: Invalid signature`

**Debug Steps:**
1. Check passphrase matches in:
   - `.env` file
   - Payfast dashboard settings
2. Verify all payload fields included
3. Check URL encoding

**Solutions:**
- Remove passphrase (set to empty) temporarily
- Compare signature generation with Payfast docs
- Verify field ordering

---

### Issue: Amount Mismatch

**Symptoms:**
- Log: `[Payfast ITN] Validation failed: Amount mismatch`

**Debug Steps:**
1. Check order total in database
2. Check amount in ITN payload
3. Verify shipping fee calculation

**Solutions:**
- Ensure amounts use 2 decimal places
- Check shipping fee is included
- Verify currency is ZAR

---

### Issue: Redirect Not Working

**Symptoms:**
- Form doesn't redirect to Payfast
- Stuck on "Redirecting..." screen

**Debug Steps:**
1. Open browser console for errors
2. Check network tab for failed requests
3. Verify Payfast payload generation

**Solutions:**
- Check payload has all required fields
- Verify signature is generated correctly
- Ensure form action URL is correct

---

## 📊 Test Data

### Valid Sandbox Test Cards

```
✅ Successful Payment
Card: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25

❌ Declined Payment
Card: 4000 0000 0000 0010
CVV: 123
Expiry: 12/25
```

### Test User Data

```
Name: Test User
Email: test@example.com
Phone: +27821234567
Address: 123 Test Street
City: Cape Town
Province: Western Cape
Postal Code: 8001
```

---

## 📈 Performance Testing

### Load Testing

Test with multiple concurrent orders:

```bash
# Use a tool like k6 or Apache Bench
# Example: 10 concurrent users placing orders
```

**Expected Results:**
- ✅ All orders created successfully
- ✅ No duplicate orders
- ✅ ITN handler processes all requests
- ✅ No race conditions

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] All test scenarios pass
- [ ] ITN webhook accessible publicly
- [ ] HTTPS enabled
- [ ] Production credentials configured
- [ ] Passphrase set and secure
- [ ] Error logging configured
- [ ] Email notifications working
- [ ] Payment retry flow tested
- [ ] Cancel flow tested
- [ ] Success flow tested
- [ ] Database indexes optimized
- [ ] Monitoring/alerting setup

---

## 📝 Test Log Template

Use this to document your tests:

```
Date: ____________________
Tester: __________________
Environment: Sandbox / Production

Test 1: Guest Checkout Success
Status: Pass / Fail
Notes: ____________________

Test 2: Auth User Checkout
Status: Pass / Fail
Notes: ____________________

Test 3: Payment Cancel
Status: Pass / Fail
Notes: ____________________

[Continue for all tests...]

Issues Found:
1. ____________________
2. ____________________

Overall Status: Ready / Needs Work
```

---

## 🎯 Success Criteria

Your integration is production-ready when:

- ✅ All 10 test scenarios pass
- ✅ ITN webhook receives and processes notifications
- ✅ Order and payment states update correctly
- ✅ Success and cancel pages work
- ✅ No console errors
- ✅ Database records are accurate
- ✅ Cart clears after successful order
- ✅ Email confirmations sent
- ✅ User can view order history

---

**Happy Testing! 🧪**

For issues or questions, refer to `PAYFAST_INTEGRATION_GUIDE.md` or contact Payfast support.
