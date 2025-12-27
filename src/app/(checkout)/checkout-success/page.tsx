/**
 * Checkout Success Page
 * Displays order confirmation after successful payment
 * Payment status is verified via ITN webhook, not the return URL
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';
import { getOrderDetails } from '@/lib/actions/payfast';
import ClearCartEffect from './ClearCartEffect';

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function CheckoutSuccessPage(props: CheckoutSuccessPageProps) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Clear cart on success */}
      <ClearCartEffect />
      
      <Suspense fallback={<LoadingState />}>
        <SuccessContent orderId={searchParams.order_id} />
      </Suspense>
    </div>
  );
}

async function SuccessContent({ orderId }: { orderId?: string }) {
  if (!orderId) {
    return <InvalidOrder />;
  }

  const result = await getOrderDetails(orderId);

  if (!result.ok || !result.order) {
    return <InvalidOrder />;
  }

  const { order } = result;
  const isPaid = order.status === 'paid';

  return (
    <div className="mx-auto max-w-3xl">
      {/* Success Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {isPaid ? 'Payment Successful!' : 'Order Received!'}
        </h1>
        <p className="text-gray-600">
          {isPaid
            ? 'Your payment has been confirmed and your order is being processed.'
            : 'Your order has been created. We are waiting for payment confirmation.'}
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-mono font-medium">
              {order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Order Date:</span>
            <span className="font-medium">
              {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Payment Status:</span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                isPaid
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {isPaid ? 'Paid' : 'Pending'}
            </span>
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{order.currency} {parseFloat(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Items Ordered</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-gray-600">{item.variantSku}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {order.currency} {parseFloat(item.price).toFixed(2)}
                </p>
                <p className="text-gray-600">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>{order.currency} {parseFloat(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping:</span>
            <span>{order.currency} {parseFloat(order.shippingCost).toFixed(2)}</span>
          </div>
          {parseFloat(order.discountTotal) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span>-{order.currency} {parseFloat(order.discountTotal).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-900">Shipping Address</h3>
          <div className="text-sm text-gray-700">
            <p className="font-medium">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-3 flex items-center font-semibold text-blue-900">
          <Mail className="mr-2 h-5 w-5" />
          What happens next?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {!isPaid && (
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                We are waiting for payment confirmation from Payfast. This usually takes
                a few minutes.
              </span>
            </li>
          )}
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              You will receive an email confirmation {isPaid ? 'shortly' : 'once payment is confirmed'}.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Your order will be processed and shipped within 1-3 business days.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>You will receive tracking information via email once shipped.</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
        <Link
          href="/dashboard/orders"
          className="flex flex-1 items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          <Package className="mr-2 h-5 w-5" />
          View Orders
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}

function InvalidOrder() {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mb-8">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <Package className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Order Not Found</h1>
        <p className="text-gray-600">
          We couldn&apos;t find the order you&apos;re looking for. Please check your email for order
          confirmation.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
      >
        Return to Home
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-20 w-20 animate-pulse rounded-full bg-gray-200" />
        <div className="mb-2 h-8 w-64 animate-pulse rounded bg-gray-200 mx-auto" />
        <div className="h-4 w-96 animate-pulse rounded bg-gray-200 mx-auto" />
      </div>
    </div>
  );
}
