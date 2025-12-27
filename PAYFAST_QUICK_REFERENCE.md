# Payfast Integration - Quick Reference

## 🚀 Quick Start

### 1. Environment Setup
```bash
# .env
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=
PAYFAST_ENVIRONMENT=sandbox
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Migration
```bash
npm run db:generate
npm run db:migrate
```

### 3. Test Local Development
```bash
# Terminal 1
npm run dev

# Terminal 2 (for ITN testing)
ngrok http 3000
# Copy the https URL and update NEXT_PUBLIC_APP_URL
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/lib/payfast/config.ts` | Merchant credentials & URLs |
| `src/lib/payfast/signature.ts` | MD5 signature generation |
| `src/lib/payfast/verify.ts` | ITN validation logic |
| `src/lib/actions/payfast.ts` | Checkout payload generation |
| `src/app/api/payfast/notify/route.ts` | ITN webhook endpoint |
| `src/components/checkout/PayfastRedirectForm.tsx` | Payment redirect form |

---

## 🔄 Payment Flow Summary

```
1. User → Checkout Form
2. Server → Create Order (status: pending) + Payment (status: initiated)
3. Server → Generate Payfast Payload with Signature
4. Client → Auto-submit form to Payfast
5. Payfast → User completes payment
6. Payfast → Send ITN to /api/payfast/notify
7. Server → Validate ITN → Update Order & Payment
8. User → Redirect to success/cancel page
```

---

## 🔐 Security Checklist

- ✅ Signature validation (MD5)
- ✅ IP address whitelisting
- ✅ Merchant ID verification
- ✅ Amount validation
- ✅ Passphrase protection
- ✅ HTTPS in production
- ✅ ITN idempotency

---

## 🧪 Test Cards (Sandbox)

```
Card Number: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25 (any future date)
Name: Test User
```

---

## 📊 Payment Statuses

### Payment Status Flow
```
initiated → completed ✅
         → failed    ❌
```

### Order Status Flow
```
pending → paid      ✅
       → cancelled ❌
```

---

## 🔧 Common Commands

```bash
# Generate database migration
npm run db:generate

# Apply migration
npm run db:migrate

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🐛 Quick Debugging

### Check ITN Reception
```bash
# Look for these logs in terminal:
[Payfast ITN] Received notification
[Payfast ITN] Validation passed
[Payfast ITN] Updated order and payment
```

### Check Order Status
```sql
SELECT id, status, total_amount 
FROM orders 
WHERE id = 'your-order-id';
```

### Check Payment Status
```sql
SELECT id, status, transaction_id, meta 
FROM payments 
WHERE order_id = 'your-order-id';
```

---

## 📞 URLs

### Sandbox
- Process: `https://sandbox.payfast.co.za/eng/process`
- Validate: `https://sandbox.payfast.co.za/eng/query/validate`

### Production
- Process: `https://www.payfast.co.za/eng/process`
- Validate: `https://www.payfast.co.za/eng/query/validate`

### Your App
- Notify: `{APP_URL}/api/payfast/notify`
- Success: `{APP_URL}/checkout-success`
- Cancel: `{APP_URL}/checkout-cancel`

---

## ⚡ Key Functions

### Create Order with Payment
```typescript
const result = await createOrder({...});
// Returns: { ok: true, order: {...}, payment: {...} }
```

### Generate Payfast Payload
```typescript
const result = await createPayfastCheckoutPayload(orderId);
// Returns: { ok: true, payload: {...} }
```

### Get Order Details
```typescript
const result = await getOrderDetails(orderId);
// Returns: { ok: true, order: {...} }
```

---

## 🎯 Production Deployment

1. Update environment variables
2. Set `PAYFAST_ENVIRONMENT=production`
3. Use real merchant credentials
4. Verify webhook URL is accessible
5. Enable HTTPS
6. Test with real payment
7. Monitor ITN logs

---

## 📖 Documentation

- Full Guide: `PAYFAST_INTEGRATION_GUIDE.md`
- Payfast Docs: https://developers.payfast.co.za/
- Support: support@payfast.co.za

---

**Ready to accept payments! 💳**
