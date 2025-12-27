import { getShopSettings } from '@/lib/actions/shop-settings';
import ShopSettingsForm from '@/components/admin/ShopSettingsForm';
import type { ShopSettings } from '@/lib/db/schema';

export const metadata = {
  title: 'Shop Settings | Admin Dashboard',
  description: 'Configure shop-wide settings',
};

export default async function ShopSettingsPage() {
  const settingsResult = await getShopSettings();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shop Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure global shop settings, pricing rules, and business information
        </p>
        {settingsResult.isDefault && (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Using default settings. Save to store in database.
            </p>
          </div>
        )}
      </div>

      <ShopSettingsForm initialData={settingsResult.data as Partial<ShopSettings>} />
    </div>
  );
}
