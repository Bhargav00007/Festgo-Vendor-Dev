"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MoreVertical, Edit3, Trash2, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";

// Types
interface EventType {
  image: null;
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

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

export default function EventTypesPage() {
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & States
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState<EventType | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null,
    []
  );

  // Fetch Event Types
  const fetchEventTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://server.festgo.in/api/city-fests/", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch event types");
      const json = await res.json();

      const data = Array.isArray(json?.data) ? json.data : [];

      const mapped: EventType[] = data.map((item: EventType) => ({
        id: item.id,
        name: item.name,
        imageUrl: normalizeImageUrl(item.image ?? null),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setEventTypes(mapped);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error fetching event types");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const openEdit = (et: EventType) => {
    setCurrent(et);
    setEditValue(et.name || "");
    setPreviewImage(et.imageUrl || null);
    setEditImage(null);
    setEditOpen(true);
    setMenuOpen(null);
  };

  const openDelete = (et: EventType) => {
    setCurrent(et);
    setDeleteOpen(true);
    setMenuOpen(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImage(file);
      setPreviewImage(URL.createObjectURL(file));
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

  const handleEditSave = async () => {
    if (!current) return;
    if (!editValue.trim())
      return toast.error("Event type name cannot be empty");

    try {
      setUploading(true);

      let imageUrl = current.imageUrl;
      if (editImage) {
        imageUrl = await uploadImage(editImage);
      }

      const res = await fetch(
        `https://server.festgo.in/api/city-fests/categories/${current.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            name: editValue.trim(),
            image: imageUrl,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update event type");

      toast.success("Event type updated");
      setEditOpen(false);
      setCurrent(null);
      setPreviewImage(null);
      setEditImage(null);
      await fetchEventTypes();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error updating event type");
      }
    } finally {
      setUploading(false);
    }
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
      if (!res.ok) throw new Error("Failed to delete event type");
      toast.success("Event type deleted");
      setDeleteOpen(false);
      setCurrent(null);
      await fetchEventTypes();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error deleting event type");
      }
    }
  };

  // CHANGE: On card click, redirect to /cityfest?categoryId={category.id}
  const handleCardClick = (categoryId: string) => {
    router.push(`/cityfest?categoryId=${categoryId}`);
  };

  return (
    <div className="mx-auto max-w-5xl p-6 my-20">
      <ToastContainer draggable closeOnClick />

      {/* Heading */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl pb-1 font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            City Fest Categories
          </h1>
          <p className="mt-1 text-lg text-gray-600">
            Manage different city fest categories in one place
          </p>
        </div>

        <button
          onClick={() => router.push("/cityfest/create-categories")}
          className="hidden sm:flex items-center gap-2 cursor-pointer rounded-full bg-purple-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" /> Create
        </button>

        <button
          onClick={() => router.push("/cityfest/create-categories")}
          className="sm:hidden fixed bottom-6 z-50 right-6 flex items-center justify-center rounded-full bg-purple-600 w-16 h-16 text-white shadow-lg hover:bg-purple-700"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <BarLoader color="#A855F7" loading={loading} />
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-8 text-center">
          No event types found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {eventTypes.map((et) => (
            <div
              key={et.id}
              onClick={() => handleCardClick(et.id)}
              className="relative flex h-60 flex-col justify-between rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md cursor-pointer"
            >
              <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
                {et.imageUrl ? (
                  <img
                    src={et.imageUrl}
                    alt={et.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="px-4 pb-2 flex items-center justify-between">
                <div>
                  <div className="mt-2 text-lg font-semibold leading-snug text-gray-800">
                    {et.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created:{" "}
                    {et.createdAt
                      ? new Date(et.createdAt).toLocaleDateString()
                      : "-"}
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === et.id ? null : et.id);
                    }}
                    className="rounded-full p-1 cursor-pointer"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {menuOpen === et.id && (
                    <div className="absolute right-0 -top-20 z-10 w-32 rounded-lg border border-gray-200 bg-white shadow-md">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(et);
                        }}
                        className="flex w-full items-center rounded-lg gap-2 px-3 py-2 text-left text-sm hover:bg-purple-50 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4 text-purple-600" /> Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDelete(et);
                        }}
                        className="flex w-full items-center rounded-lg gap-2 px-3 py-2 text-left text-sm hover:bg-red-50 cursor-pointer"
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

      {/* Edit Dialog */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit Event Type${current ? ` — ${current.name}` : ""}`}
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
          Event Type Name
        </label>
        <input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Enter event type name"
          className="mt-1 mb-4 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>

          {previewImage && (
            <div className="mb-3">
              <img
                src={previewImage}
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

      {/* Delete Confirmation Dialog */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Event Type"
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
