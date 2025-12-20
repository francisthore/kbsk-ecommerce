"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/admin-data";
import { categorySchema, type CategoryFormData } from "@/lib/validations/admin";
import { FileUpload } from "@/components/ui/file-upload";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const result = await getCategories();
    if (result.success && result.data) {
      setCategories(result.data as Category[]);
    }
    setLoading(false);
  }

  function handleCreate() {
    setEditingCategory(null);
    setIsDialogOpen(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
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

    const result = await deleteCategory(id);
    if (result.success) {
      toast.success("Category deleted successfully");
      loadCategories();
    } else {
      toast.error(result.error || "Failed to delete category");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage product categories and subcategories
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">
            No categories found. Create your first category to get started.
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
          >
            Add a category
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Description
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
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                        <span className="text-xs font-medium">
                          {category.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500">{category.slug}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {category.parentName ? (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {category.parentName}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="max-w-xs px-6 py-4">
                    <div className="truncate text-sm text-gray-500">
                      {category.description || "—"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {category.productCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category)}
                      className="mr-3 text-[var(--color-primary)] hover:text-opacity-80"
                      aria-label="Edit category"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Delete category"
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
        <CategoryDialog
          category={editingCategory}
          categories={categories}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingCategory(null);
          }}
          onSuccess={() => {
            loadCategories();
            setIsDialogOpen(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}

function CategoryDialog({
  category,
  categories,
  onClose,
  onSuccess,
}: {
  category: Category | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || "",
    description: category?.description || "",
    imageUrl: category?.imageUrl || "",
    parentId: category?.parentId || null,
    seoMetaTitle: category?.seoMetaTitle || "",
    seoMetaDescription: category?.seoMetaDescription || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Filter out current category from parent options (prevent self-reference)
  const availableParents = categories.filter((c) => c.id !== category?.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    // Validate
    const validation = categorySchema.safeParse(formData);
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
    const result = category
      ? await updateCategory(category.id, validation.data)
      : await createCategory(validation.data);

    if (result.success) {
      toast.success(category ? "Category updated" : "Category created");
      onSuccess();
    } else {
      toast.error(result.error || "Failed to save category");
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
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? "Edit Category" : "Create Category"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Hidden input to ensure imageUrl is in form scope */}
            <input type="hidden" name="imageUrl" value={formData.imageUrl || ""} />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  placeholder="e.g., Power Tools"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parent Category
                </label>
                <select
                  value={formData.parentId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentId: e.target.value || null,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">None (Top Level)</option>
                  {availableParents.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.parentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.parentId}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Brief description of this category"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              
              {/* Show current URL value (for debugging) */}
              {formData.imageUrl && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <span className="font-medium text-blue-700">Current URL:</span>
                  <span className="ml-2 text-blue-600 break-all">{formData.imageUrl}</span>
                </div>
              )}
              
              {/* Preview existing image if editing and URL matches original */}
              {category?.imageUrl && formData.imageUrl === category.imageUrl && (
                <div className="mb-3 flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Current Image</p>
                    <p className="text-xs text-gray-500 truncate max-w-[300px]">{category.imageUrl}</p>
                  </div>
                </div>
              )}
              
              <FileUpload
                folder="categories"
                accept="image/*"
                multiple={false}
                maxSize={5 * 1024 * 1024}
                onUploadComplete={(urls) => {
                  if (urls.length > 0) {
                    const newUrl = urls[0];
                    setFormData((prev) => ({
                      ...prev,
                      imageUrl: newUrl,
                    }));
                  }
                }}
              />
              
              {errors.imageUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
              )}
              
              <p className="mt-2 text-xs text-gray-500">
                Upload a category image (max 5MB). Recommended size: 400x300px
              </p>
            </div>

            {/* SEO Fields */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                SEO Settings (Optional)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.seoMetaTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoMetaTitle: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="SEO title (max 60 chars)"
                    maxLength={60}
                  />
                  {errors.seoMetaTitle && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.seoMetaTitle}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.seoMetaDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoMetaDescription: e.target.value,
                      })
                    }
                    rows={2}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="SEO description (max 160 chars)"
                    maxLength={160}
                  />
                  {errors.seoMetaDescription && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.seoMetaDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
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
                {submitting ? "Saving..." : category ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
