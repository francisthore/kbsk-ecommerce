/**
 * Payfast ITN (Instant Transaction Notification) Webhook Handler
 * This is the source of truth for payment confirmation
 * Handles payment status updates from Payfast
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { validateITN, mapPaymentStatus, mapOrderStatus } from '@/lib/payfast/verify';

/**
 * POST /api/payfast/notify
 * Receives ITN from Payfast servers
 * Must respond with 200 OK immediately
 */
export async function POST(request: NextRequest) {
  // Respond 200 immediately to acknowledge receipt
  // Process asynchronously to avoid timeout
  
  try {
    // Parse form data from Payfast
    // CRITICAL: Preserve field order as sent by Payfast for signature validation
    const formData = await request.formData();
    const dataArray: Array<[string, string]> = [];
    
    formData.forEach((value, key) => {
      dataArray.push([key, value.toString()]);
    });
    
    // Convert to object for easier access (after preserving order)
    const data: Record<string, string> = Object.fromEntries(dataArray);

    console.log('[Payfast ITN] Received notification:', {
      m_payment_id: data.m_payment_id,
      pf_payment_id: data.pf_payment_id,
      payment_status: data.payment_status,
      amount_gross: data.amount_gross,
    });
    
    console.log('[Payfast ITN] Full data array (preserving order):', dataArray);
    console.log('[Payfast ITN] Signature from Payfast:', data.signature);

    // Get client IP (works with various deployment scenarios)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';

    // Extract order ID from m_payment_id
    const orderId = data.m_payment_id;

    if (!orderId) {
      console.error('[Payfast ITN] Missing m_payment_id');
      return NextResponse.json({ status: 'error', message: 'Missing payment ID' }, { status: 200 });
    }

    // Fetch order to get expected amount and customer details
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        account: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      console.error('[Payfast ITN] Order not found:', orderId);
      return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 200 });
    }

    const expectedAmount = parseFloat(order.totalAmount);

    console.log('[Payfast ITN] About to validate with:', {
      dataArrayLength: dataArray.length,
      ipAddress,
      expectedAmount,
    });

    // Validate ITN (pass the ordered array for signature validation)
    const validation = await validateITN(dataArray, ipAddress, expectedAmount);
    
    console.log('[Payfast ITN] Validation result:', validation);

    if (!validation.valid) {
      console.error('[Payfast ITN] Validation failed:', validation.error);
      return NextResponse.json({ status: 'error', message: validation.error }, { status: 200 });
    }

    console.log('[Payfast ITN] Validation passed, processing payment');

    // Process payment based on status
    const payfastStatus = data.payment_status;
    const newPaymentStatus = mapPaymentStatus(payfastStatus);
    const newOrderStatus = mapOrderStatus(payfastStatus);

    // Update payment record
    await db
      .update(payments)
      .set({
        status: newPaymentStatus,
        transactionId: data.pf_payment_id,
        paidAt: newPaymentStatus === 'completed' ? new Date() : null,
        meta: data, // Store full ITN payload
      })
      .where(eq(payments.orderId, orderId));

    // Update order status
    await db
      .update(orders)
      .set({
        status: newOrderStatus,
      })
      .where(eq(orders.id, orderId));

    console.log('[Payfast ITN] Updated order and payment:', {
      orderId,
      orderStatus: newOrderStatus,
      paymentStatus: newPaymentStatus,
    });

    // Send confirmation email if payment completed
    if (newPaymentStatus === 'completed') {
      console.log('[Payfast ITN] Payment completed, attempting to send confirmation email');
      try {
        const { sendPaymentConfirmationEmail } = await import('@/lib/email/templates/payment-confirmation');
        
        console.log('[Payfast ITN] Email data:', {
          orderId,
          orderNumber: orderId.slice(0, 8).toUpperCase(),
          customerEmail: order.account?.email,
          customerName: order.shippingAddress?.contactName,
          totalAmount: order.totalAmount,
        });
        
        await sendPaymentConfirmationEmail({
          orderId,
          orderNumber: orderId.slice(0, 8).toUpperCase(),
          customerEmail: order.account?.email || '',
          customerName: order.shippingAddress?.contactName || 'Customer',
          totalAmount: order.totalAmount,
          currency: order.currency,
          paymentMethod: 'Payfast',
          transactionId: data.pf_payment_id,
        });
        console.log('[Payfast ITN] Payment confirmation email sent successfully to:', order.account?.email);
      } catch (emailError) {
        console.error('[Payfast ITN] Failed to send confirmation email:', emailError);
        console.error('[Payfast ITN] Email error details:', {
          message: emailError instanceof Error ? emailError.message : 'Unknown error',
          stack: emailError instanceof Error ? emailError.stack : undefined,
        });
        // Don't fail the webhook if email fails
      }
    } else {
      console.log('[Payfast ITN] Payment not completed, skipping email. Status:', newPaymentStatus);
    }

    // TODO: Send confirmation email if payment completed
    // TODO: Trigger order fulfillment workflow if needed

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('[Payfast ITN] Error processing notification:', error);
    // Still return 200 to prevent Payfast from retrying immediately
    return NextResponse.json({ status: 'error', message: 'Internal error' }, { status: 200 });
  }
}

/**
 * GET is not used but included for testing/debugging
 */
export async function GET() {
  return NextResponse.json(
    { message: 'Payfast ITN endpoint. POST only.' },
    { status: 405 }
  );
}
