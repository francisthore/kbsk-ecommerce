'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save, DollarSign, Package, Building, Settings as SettingsIcon } from 'lucide-react';
import { updateShopSettings } from '@/lib/actions/shop-settings';
import { updateShopSettingsSchema, type UpdateShopSettings, type ShopSettings } from '@/lib/db/schema/shopSettings';
import { useRouter } from 'next/navigation';

interface Props {
  initialData: ShopSettings;
}

export default function ShopSettingsForm({ initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'business' | 'features'>('general');

  const form = useForm<UpdateShopSettings>({
    resolver: zodResolver(updateShopSettingsSchema),
    defaultValues: {
      shopName: initialData.shopName,
      shopCountry: initialData.shopCountry,
      shopTimezone: initialData.shopTimezone,
      currencyCode: initialData.currencyCode,
      currencySymbol: initialData.currencySymbol,
      currencyLocale: initialData.currencyLocale,
      taxRate: typeof initialData.taxRate === 'string' ? parseFloat(initialData.taxRate) : initialData.taxRate,
      markupRate: typeof initialData.markupRate === 'string' ? parseFloat(initialData.markupRate) : initialData.markupRate,
      freeShippingThreshold: typeof initialData.freeShippingThreshold === 'string' 
        ? parseFloat(initialData.freeShippingThreshold) 
        : initialData.freeShippingThreshold,
      businessRegistrationNumber: initialData.businessRegistrationNumber || '',
      vatNumber: initialData.vatNumber || '',
      businessEmail: initialData.businessEmail || '',
      businessPhone: initialData.businessPhone || '',
      businessAddress: initialData.businessAddress || '',
      enableGuestCheckout: initialData.enableGuestCheckout ?? true,
      enableWishlist: initialData.enableWishlist ?? true,
      enableReviews: initialData.enableReviews ?? true,
      enableQuotes: initialData.enableQuotes ?? true,
    },
  });

  const onSubmit = async (data: UpdateShopSettings) => {
    setIsSubmitting(true);

    try {
      const result = await updateShopSettings(data);

      if (result.success) {
        toast.success('Shop settings updated successfully!');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'pricing', label: 'Pricing & Tax', icon: DollarSign },
    { id: 'business', label: 'Business Info', icon: Building },
    { id: 'features', label: 'Features', icon: Package },
  ] as const;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <section className="rounded-lg bg-white shadow p-6">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Name *
              </label>
              <input
                type="text"
                {...form.register('shopName')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="KBSK E-commerce"
              />
              {form.formState.errors.shopName && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.shopName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  {...form.register('shopCountry')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="South Africa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone *
                </label>
                <input
                  type="text"
                  {...form.register('shopTimezone')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Africa/Johannesburg"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">Currency Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency Code *
                  </label>
                  <input
                    type="text"
                    {...form.register('currencyCode')}
                    maxLength={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="ZAR"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency Symbol *
                  </label>
                  <input
                    type="text"
                    {...form.register('currencySymbol')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="R"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locale *
                  </label>
                  <input
                    type="text"
                    {...form.register('currencyLocale')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="en-ZA"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Settings */}
      {activeTab === 'pricing' && (
        <section className="rounded-lg bg-white shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pricing & Tax Settings</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VAT Rate (Tax Rate) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    {...form.register('taxRate', { valueAsNumber: true })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.15"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">
                    ({((form.watch('taxRate') ?? 0) * 100).toFixed(2)}%)
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  South Africa VAT is 15% (enter as 0.15)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Markup Rate *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    {...form.register('markupRate', { valueAsNumber: true })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.30"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">
                    ({((form.watch('markupRate') ?? 0) * 100).toFixed(2)}%)
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Applied when product prices don&apos;t include VAT
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Shipping Threshold *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">R</span>
                <input
                  type="number"
                  step="0.01"
                  {...form.register('freeShippingThreshold', { valueAsNumber: true })}
                  className="w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="500.00"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Orders above this amount qualify for free shipping
              </p>
            </div>

            {/* Pricing Example */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Pricing Example (VAT Not Included)</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Cost Price:</span>
                  <span className="font-medium">R100.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Markup ({((form.watch('markupRate') ?? 0) * 100).toFixed(0)}%):</span>
                  <span className="font-medium text-green-600">
                    +R{((form.watch('markupRate') ?? 0) * 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">R{(100 * (1 + (form.watch('markupRate') ?? 0))).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({((form.watch('taxRate') ?? 0) * 100).toFixed(0)}%):</span>
                  <span className="font-medium text-orange-600">
                    +R{(100 * (1 + (form.watch('markupRate') ?? 0)) * (form.watch('taxRate') ?? 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-300">
                  <span className="font-semibold">Final Price:</span>
                  <span className="font-bold text-lg">
                    R{(100 * (1 + (form.watch('markupRate') ?? 0)) * (1 + (form.watch('taxRate') ?? 0))).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Business Information */}
      {activeTab === 'business' && (
        <section className="rounded-lg bg-white shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Business Information</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  {...form.register('businessRegistrationNumber')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="2024/123456/07"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VAT Number
                </label>
                <input
                  type="text"
                  {...form.register('vatNumber')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="4123456789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  {...form.register('businessEmail')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="info@kbsk.co.za"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Phone
                </label>
                <input
                  type="tel"
                  {...form.register('businessPhone')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="+27 11 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <textarea
                {...form.register('businessAddress')}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="123 Main Street, Johannesburg, 2000, South Africa"
              />
            </div>
          </div>
        </section>
      )}

      {/* Feature Flags */}
      {activeTab === 'features' && (
        <section className="rounded-lg bg-white shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Feature Settings</h2>
          <p className="text-sm text-gray-600 mb-6">
            Enable or disable specific features across your shop
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Guest Checkout</h4>
                <p className="text-xs text-gray-500">Allow customers to checkout without creating an account</p>
              </div>
              <input
                type="checkbox"
                {...form.register('enableGuestCheckout')}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Wishlist</h4>
                <p className="text-xs text-gray-500">Enable product wishlists for customers</p>
              </div>
              <input
                type="checkbox"
                {...form.register('enableWishlist')}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Product Reviews</h4>
                <p className="text-xs text-gray-500">Allow customers to leave product reviews and ratings</p>
              </div>
              <input
                type="checkbox"
                {...form.register('enableReviews')}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Quote Requests (RFQ)</h4>
                <p className="text-xs text-gray-500">Enable B2B quote request functionality</p>
              </div>
              <input
                type="checkbox"
                {...form.register('enableQuotes')}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
}
