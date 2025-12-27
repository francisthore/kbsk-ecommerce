/**
 * Checkout Cancel Page
 * Displays when user cancels payment on Payfast page
 * Allows user to retry checkout
 */

import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { getOrderDetails } from '@/lib/actions/payfast';

interface CheckoutCancelPageProps {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function CheckoutCancelPage({
  searchParams,
}: CheckoutCancelPageProps) {
  const params = await searchParams;
  const orderId = params.order_id;
  
  // Optionally fetch order details if order_id is provided
  let orderAmount = null;
  if (orderId) {
    const result = await getOrderDetails(orderId);
    if (result.ok && result.order) {
      orderAmount = {
        currency: result.order.currency,
        total: result.order.total,
      };
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Cancel Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
            Payment Cancelled
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Your payment was cancelled and no charges were made.
          </p>
        </div>

        {/* Order Information */}
        {orderId && (
          <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Order Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Order Number:</span>
                <span className="font-mono font-medium">
                  {orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              {orderAmount && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Amount:</span>
                  <span className="font-medium">
                    {orderAmount.currency} {parseFloat(orderAmount.total).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Status:</span>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  Payment Pending
                </span>
              </div>
            </div>
          </div>
        )}

        {/* What Happened */}
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h3 className="mb-3 font-semibold text-yellow-900">
            What happened?
          </h3>
          <p className="mb-4 text-sm text-yellow-800">
            You cancelled the payment process before completing the transaction. Your
            order has been created but is awaiting payment.
          </p>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>No charges have been made to your account.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Your order is reserved for 24 hours.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                You can retry payment or modify your order from your cart.
              </span>
            </li>
          </ul>
        </div>

        {/* Options */}
        <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-[var(--color-text-primary)]">
            What would you like to do?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start rounded-lg border border-[var(--color-border)] p-4 transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-gray-light)]">
              <RefreshCw className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-[var(--color-primary)]" />
              <div className="flex-1">
                <h4 className="font-medium text-[var(--color-text-primary)]">Try Payment Again</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Return to checkout and complete your payment
                </p>
              </div>
            </div>

            <div className="flex items-start rounded-lg border border-[var(--color-border)] p-4 transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-gray-light)]">
              <ArrowLeft className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-[var(--color-text-secondary)]" />
              <div className="flex-1">
                <h4 className="font-medium text-[var(--color-text-primary)]">Modify Your Order</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Go back to your cart and make changes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/cart"
            className="flex flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-6 py-3 font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-gray-light)]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Cart
          </Link>
          <Link
            href="/checkout"
            className="flex flex-1 items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
            Need help with your order?
          </p>
          <Link
            href="/contact"
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Contact Customer Support
          </Link>
        </div>
      </div>
    </div>
  );
}
