"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Plus } from "lucide-react";
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
      className="fixed inset-0 z-500 flex items-center justify-center"
      aria-modal
      role="dialog"
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape") onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
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

interface EventType {
  id: string;
  name: string;
  image: string | null;
}

export default function CreateCategoryPage() {
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null,
    []
  );

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Upload image to API
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

  // Handle Create Category
  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Please enter a category name");

    try {
      setUploading(true);

      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const res = await fetch(
        "https://server.festgo.in/api/city-fests/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            name: name.trim(),
            image: imageUrl,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to create category");
      toast.success("Category created successfully");

      // Reset
      setName("");
      setImage(null);
      setPreview(null);
      setOpen(false);
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Error creating category");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 my-20">
      <ToastContainer draggable closeOnClick />

      {/* Heading */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl pb-1 font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create City Fest Category
          </h1>
          <p className="mt-1 text-lg text-gray-600">
            Add new categories to City Fest
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="hidden sm:flex items-center gap-2 cursor-pointer rounded-full bg-purple-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" /> Create
        </button>

        <button
          onClick={() => setOpen(true)}
          className="sm:hidden fixed bottom-6 z-50 right-6 flex items-center justify-center rounded-full bg-purple-600 w-16 h-16 text-white shadow-lg hover:bg-purple-700"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* Placeholder */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <BarLoader color="#A855F7" loading={loading} />
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 p-8 text-center text-gray-600">
          Click the “Create” button to add a new City Fest Category.
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create New City Fest Category"
        actionArea={
          <>
            <button
              onClick={() => setOpen(false)}
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
    </div>
  );
}
