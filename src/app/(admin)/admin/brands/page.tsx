"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/lib/actions/admin-data";
import { brandSchema, type BrandFormData } from "@/lib/validations/admin";
import { FileUpload } from "@/components/ui/file-upload";
import Image from "next/image";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  createdAt: Date;
  productCount: number;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    const result = await getBrands();
    if (result.success && result.data) {
      setBrands(result.data as Brand[]);
    }
    setLoading(false);
  }

  function handleCreate() {
    setEditingBrand(null);
    setIsDialogOpen(true);
  }

  function handleEdit(brand: Brand) {
    setEditingBrand(brand);
    setIsDialogOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const result = await deleteBrand(id);
    if (result.success) {
      toast.success("Brand deleted successfully");
      loadBrands();
    } else {
      toast.error(result.error || "Failed to delete brand");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage product brands and manufacturers
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Add Brand
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">Loading brands...</p>
        </div>
      ) : brands.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No brands found. Create your first brand to get started.</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
          >
            Add a brand
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Products
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    {brand.logoUrl ? (
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-contain"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                        <span className="text-xs font-medium">
                          {brand.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {brand.name}
                    </div>
                    <div className="text-sm text-gray-500">{brand.slug}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
                      >
                        Visit
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {brand.productCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="mr-3 text-[var(--color-primary)] hover:text-opacity-80"
                      aria-label="Edit brand"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id, brand.name)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Delete brand"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog */}
      {isDialogOpen && (
        <BrandDialog
          brand={editingBrand}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingBrand(null);
          }}
          onSuccess={() => {
            loadBrands();
            setIsDialogOpen(false);
            setEditingBrand(null);
          }}
        />
      )}
    </div>
  );
}

function BrandDialog({
  brand,
  onClose,
  onSuccess,
}: {
  brand: Brand | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<BrandFormData>({
    name: brand?.name || "",
    logoUrl: brand?.logoUrl || "",
    website: brand?.website || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    // Validate
    const validation = brandSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    // Submit
    const result = brand
      ? await updateBrand(brand.id, validation.data)
      : await createBrand(validation.data);

    if (result.success) {
      toast.success(brand ? "Brand updated" : "Brand created");
      onSuccess();
    } else {
      toast.error(result.error || "Failed to save brand");
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900">
            {brand ? "Edit Brand" : "Create Brand"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Hidden input to ensure logoUrl is in form scope */}
            <input type="hidden" name="logoUrl" value={formData.logoUrl || ""} />
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="e.g., DeWalt"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Logo
              </label>
              
              {/* Show current URL value (for debugging) */}
              {formData.logoUrl && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <span className="font-medium text-blue-700">Current URL:</span>
                  <span className="ml-2 text-blue-600 break-all">{formData.logoUrl}</span>
                </div>
              )}
              
              {/* Preview existing logo if editing and URL matches original */}
              {brand?.logoUrl && formData.logoUrl === brand.logoUrl && (
                <div className="mb-3 flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={60}
                    height={60}
                    className="rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Current Logo</p>
                    <p className="text-xs text-gray-500 truncate max-w-[300px]">{brand.logoUrl}</p>
                  </div>
                </div>
              )}
              
              <FileUpload
                folder="brands"
                accept="image/*"
                multiple={false}
                maxSize={5 * 1024 * 1024}
                onUploadComplete={(urls) => {
                  if (urls.length > 0) {
                    const newUrl = urls[0];
                    setFormData((prev) => ({
                      ...prev,
                      logoUrl: newUrl,
                    }));
                  }
                }}
              />
              
              {errors.logoUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.logoUrl}</p>
              )}
              
              <p className="mt-2 text-xs text-gray-500">
                Upload a brand logo (max 5MB). Recommended size: 200x200px
              </p>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Saving..." : brand ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
