"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MoreVertical, Edit3, Trash2, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";

// Utility: normalize image URL
const normalizeImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://server.festgo.in${url}`;
};

// Reusable Modal
function Modal({
  open,
  onClose,
  title,
  children,
  actionArea,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  actionArea?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  const handleAnimationEnd = () => {
    if (!open) setMounted(false);
  };

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center"
      aria-modal
      role="dialog"
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl transition-all duration-200 border border-gray-200 ${
          open
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-1"
        }`}
        onTransitionEnd={handleAnimationEnd}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 border border-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">{children}</div>
        {actionArea && (
          <div className="mt-2 flex justify-end gap-2">{actionArea}</div>
        )}
      </div>
    </div>
  );
}

interface CategoryType {
  id: string;
  name: string;
  image: string | null;
}

export default function CreateCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [current, setCurrent] = useState<CategoryType | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vendorToken");
    }
    return null;
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://server.festgo.in/api/city-fests/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({}),
        }
      );

      const json = await res.json();
      const data = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];

      setCategories(data);
    } catch (err) {
      toast.error("Failed to fetch categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://server.festgo.in/api/upload/public", {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return normalizeImageUrl(data.url) ?? "";
  };

  // Create Category
  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Enter category name");
    try {
      setUploading(true);
      let imageUrl = "";
      if (image) imageUrl = await uploadImage(image);

      const res = await fetch(
        "https://server.festgo.in/api/city-fests/categories/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: name.trim(), image: imageUrl }),
        }
      );

      if (!res.ok) throw new Error("Failed to create category");
      toast.success("Category created successfully");
      setCreateOpen(false);
      setName("");
      setImage(null);
      setPreview(null);
      await fetchCategories();
    } catch (err) {
      toast.error("Error creating category");
    } finally {
      setUploading(false);
    }
  };

  // Edit Category
  const openEdit = (cat: CategoryType) => {
    setCurrent(cat);
    setName(cat.name);
    setPreview(cat.image ? normalizeImageUrl(cat.image) : null);
    setImage(null);
    setEditOpen(true);
    setMenuOpen(null);
  };

  const handleEditSave = async () => {
    if (!current) return;
    try {
      setUploading(true);
      let imageUrl = current.image;
      if (image) imageUrl = await uploadImage(image);

      const res = await fetch(
        `https://server.festgo.in/api/city-fests/categories/${current.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: name.trim(), image: imageUrl }),
        }
      );

      if (!res.ok) throw new Error("Failed to update category");
      toast.success("Category updated successfully");
      setEditOpen(false);
      setCurrent(null);
      await fetchCategories();
    } catch (err) {
      toast.error("Error updating category");
    } finally {
      setUploading(false);
    }
  };

  // Delete Category
  const openDelete = (cat: CategoryType) => {
    setCurrent(cat);
    setDeleteOpen(true);
    setMenuOpen(null);
  };

  const handleDeleteConfirm = async () => {
    if (!current) return;
    try {
      const res = await fetch(
        `https://server.festgo.in/api/city-fests/categories/${current.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete category");
      toast.success("Category deleted");
      setDeleteOpen(false);
      setCurrent(null);
      await fetchCategories();
    } catch (err) {
      toast.error("Error deleting category");
    }
  };

  // Redirect to /cityfest?categoryId={id}
  const handleCategoryClick = (catId: string) => {
    router.push(`/cityfest?categoryId=${catId}`);
  };

  return (
    <div className="mx-auto max-w-5xl p-6 my-20">
      <ToastContainer draggable closeOnClick />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl pb-1 font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            City Fest Categories
          </h1>
          <p className="mt-1 text-lg text-gray-600">
            Manage City Fest categories in one place
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="hidden sm:flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" /> Create
        </button>

        <button
          onClick={() => setCreateOpen(true)}
          className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center rounded-full bg-purple-600 w-16 h-16 text-white shadow-lg hover:bg-purple-700"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <BarLoader color="#A855F7" loading={loading} />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-8 text-center text-gray-600">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="relative flex flex-col justify-between rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="w-full h-48 rounded-t-xl overflow-hidden bg-gray-100">
                {cat.image ? (
                  <img
                    src={normalizeImageUrl(cat.image) ?? ""}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-800">
                  {cat.name}
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === cat.id ? null : cat.id);
                    }}
                    className="rounded-full p-1 cursor-pointer"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {menuOpen === cat.id && (
                    <div className="absolute right-0 z-20 w-32 rounded-lg border border-gray-200 bg-white shadow-md">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(cat);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-purple-50 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4 text-purple-600" /> Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDelete(cat);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Category"
        actionArea={
          <>
            <button
              onClick={() => setCreateOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={uploading}
              className="rounded-xl bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {uploading ? "Creating..." : "Create"}
            </button>
          </>
        }
      >
        <label className="block text-sm font-medium text-gray-700">
          Category Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          className="mt-1 mb-4 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
          <label
            htmlFor="imageInput"
            className="flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 transition cursor-pointer"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm text-gray-600">
              {uploading ? "Uploading..." : "Click to upload image"}
            </span>
          </label>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit Category${current ? ` — ${current.name}` : ""}`}
        actionArea={
          <>
            <button
              onClick={() => setEditOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={uploading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <label className="block text-sm font-medium text-gray-700">
          Category Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          className="mt-1 mb-4 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
          <label
            htmlFor="editImageInput"
            className="flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition cursor-pointer"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm text-gray-600">
              {uploading ? "Uploading..." : "Click to upload image"}
            </span>
          </label>
          <input
            id="editImageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Category"
        actionArea={
          <>
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete{" "}
          <span className="font-semibold">{current?.name}</span>? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
