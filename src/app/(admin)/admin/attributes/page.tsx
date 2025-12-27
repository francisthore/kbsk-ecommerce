"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
  getSizes,
  createSize,
  updateSize,
  deleteSize,
  getGenders,
  createGender,
  updateGender,
  deleteGender,
} from "@/lib/actions/admin-data";
import {
  colorSchema,
  sizeSchema,
  genderSchema,
  type ColorFormData,
  type SizeFormData,
  type GenderFormData,
} from "@/lib/validations/admin";

interface Color {
  id: string;
  name: string;
  slug: string;
  hexCode: string;
}

interface Size {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

interface Gender {
  id: string;
  label: string;
  slug: string;
}

type Tab = "colors" | "sizes" | "genders";

export default function AttributesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("colors");

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Global Attributes
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage reusable product attributes like colors, sizes, and genders
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("colors")}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "colors"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Colors
          </button>
          <button
            onClick={() => setActiveTab("sizes")}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "sizes"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Sizes
          </button>
          <button
            onClick={() => setActiveTab("genders")}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "genders"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Genders
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "colors" && <ColorsTab />}
      {activeTab === "sizes" && <SizesTab />}
      {activeTab === "genders" && <GendersTab />}
    </div>
  );
}

// =============================================================================
// COLORS TAB
// =============================================================================

function ColorsTab() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);

  useEffect(() => {
    loadColors();
  }, []);

  async function loadColors() {
    setLoading(true);
    const result = await getColors();
    if (result.success && result.data) {
      setColors(result.data as Color[]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;

    const result = await deleteColor(id);
    if (result.success) {
      toast.success("Color deleted");
      loadColors();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setEditingColor(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          Add Color
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : colors.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No colors yet. Add your first one!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Hex Code
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {colors.map((color) => (
                <tr key={color.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div
                      className="h-8 w-8 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hexCode }}
                    />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {color.name}
                    </div>
                    <div className="text-sm text-gray-500">{color.slug}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {color.hexCode}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => {
                        setEditingColor(color);
                        setIsDialogOpen(true);
                      }}
                      className="mr-3 text-[var(--color-primary)] hover:text-opacity-80"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(color.id, color.name)}
                      className="text-red-600 hover:text-red-800"
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

      {isDialogOpen && (
        <ColorDialog
          color={editingColor}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingColor(null);
          }}
          onSuccess={() => {
            loadColors();
            setIsDialogOpen(false);
            setEditingColor(null);
          }}
        />
      )}
    </div>
  );
}

function ColorDialog({
  color,
  onClose,
  onSuccess,
}: {
  color: Color | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<ColorFormData>({
    name: color?.name || "",
    hexCode: color?.hexCode || "#000000",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const validation = colorSchema.safeParse(formData);
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

    const result = color
      ? await updateColor(color.id, validation.data)
      : await createColor(validation.data);

    if (result.success) {
      toast.success(color ? "Color updated" : "Color created");
      onSuccess();
    } else {
      toast.error(result.error || "Failed to save");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900">
            {color ? "Edit Color" : "Create Color"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
                placeholder="e.g., Red"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hex Code *
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value })
                  }
                  className="h-10 w-16 rounded-lg border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="#FF5733"
                />
              </div>
              {errors.hexCode && (
                <p className="mt-1 text-sm text-red-600">{errors.hexCode}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90"
              >
                {submitting ? "Saving..." : color ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// SIZES TAB
// =============================================================================

function SizesTab() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);

  useEffect(() => {
    loadSizes();
  }, []);

  async function loadSizes() {
    setLoading(true);
    const result = await getSizes();
    if (result.success && result.data) {
      setSizes(result.data as Size[]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;

    const result = await deleteSize(id);
    if (result.success) {
      toast.success("Size deleted");
      loadSizes();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setEditingSize(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          Add Size
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : sizes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No sizes yet. Add your first one!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Sort Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sizes.map((size) => (
                <tr key={size.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {size.name}
                    </div>
                    <div className="text-sm text-gray-500">{size.slug}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {size.sortOrder}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => {
                        setEditingSize(size);
                        setIsDialogOpen(true);
                      }}
                      className="mr-3 text-[var(--color-primary)] hover:text-opacity-80"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(size.id, size.name)}
                      className="text-red-600 hover:text-red-800"
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

      {isDialogOpen && (
        <SizeDialog
          size={editingSize}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingSize(null);
          }}
          onSuccess={() => {
            loadSizes();
            setIsDialogOpen(false);
            setEditingSize(null);
          }}
        />
      )}
    </div>
  );
}

function SizeDialog({
  size,
  onClose,
  onSuccess,
}: {
  size: Size | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<SizeFormData>({
    name: size?.name || "",
    sortOrder: size?.sortOrder ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const validation = sizeSchema.safeParse(formData);
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

    const result = size
      ? await updateSize(size.id, validation.data)
      : await createSize(validation.data);

    if (result.success) {
      toast.success(size ? "Size updated" : "Size created");
      onSuccess();
    } else {
      toast.error(result.error || "Failed to save");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900">
            {size ? "Edit Size" : "Create Size"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
                placeholder="e.g., Medium, 42, XL"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sort Order *
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Lower numbers appear first (e.g., S=1, M=2, L=3)
              </p>
              {errors.sortOrder && (
                <p className="mt-1 text-sm text-red-600">{errors.sortOrder}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90"
              >
                {submitting ? "Saving..." : size ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// GENDERS TAB
// =============================================================================

function GendersTab() {
  const [genders, setGenders] = useState<Gender[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGender, setEditingGender] = useState<Gender | null>(null);

  useEffect(() => {
    loadGenders();
  }, []);

  async function loadGenders() {
    setLoading(true);
    const result = await getGenders();
    if (result.success && result.data) {
      setGenders(result.data as Gender[]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete "${label}"?`)) return;

    const result = await deleteGender(id);
    if (result.success) {
      toast.success("Gender deleted");
      loadGenders();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setEditingGender(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          Add Gender
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : genders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No genders yet. Add your first one!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Label
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Slug
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {genders.map((gender) => (
                <tr key={gender.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {gender.label}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {gender.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => {
                        setEditingGender(gender);
                        setIsDialogOpen(true);
                      }}
                      className="mr-3 text-[var(--color-primary)] hover:text-opacity-80"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(gender.id, gender.label)}
                      className="text-red-600 hover:text-red-800"
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

      {isDialogOpen && (
        <GenderDialog
          gender={editingGender}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingGender(null);
          }}
          onSuccess={() => {
            loadGenders();
            setIsDialogOpen(false);
            setEditingGender(null);
          }}
        />
      )}
    </div>
  );
}

function GenderDialog({
  gender,
  onClose,
  onSuccess,
}: {
  gender: Gender | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<GenderFormData>({
    label: gender?.label || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const validation = genderSchema.safeParse(formData);
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

    const result = gender
      ? await updateGender(gender.id, validation.data)
      : await createGender(validation.data);

    if (result.success) {
      toast.success(gender ? "Gender updated" : "Gender created");
      onSuccess();
    } else {
      toast.error(result.error || "Failed to save");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900">
            {gender ? "Edit Gender" : "Create Gender"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Label *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="e.g., Unisex, Men, Women"
              />
              {errors.label && (
                <p className="mt-1 text-sm text-red-600">{errors.label}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90"
              >
                {submitting ? "Saving..." : gender ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
