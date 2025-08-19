"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BarLoader } from "react-spinners";
import { Plus, MoreVertical, Edit3, Trash2, X } from "lucide-react";

// Types
interface MenuItem {
  id: string;
  itemName: string;
  imageUrl?: string;
}

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

export default function MenuItemsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Modal states
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState<MenuItem | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null,
    []
  );

  // Fetch menu items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://server.festgo.in/api/festbite/menu-items/type/${id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch menu items");
      const data: unknown = await res.json();
      setItems(Array.isArray(data) ? (data as MenuItem[]) : []);
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Error fetching items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Open edit modal
  const openEdit = (item: MenuItem) => {
    setCurrent(item);
    setEditValue(item.itemName);
    setEditImageUrl(item.imageUrl || "");
    setEditOpen(true);
    setMenuOpen(null);
  };

  // Open delete modal
  const openDelete = (item: MenuItem) => {
    setCurrent(item);
    setDeleteOpen(true);
    setMenuOpen(null);
  };

  // Upload image inside Edit modal
  const handleEditImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://server.festgo.in/api/upload/public", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");
      const data = await res.json();
      const url = data?.url || "";
      if (!url) throw new Error("Invalid upload response");
      setEditImageUrl(url);
      toast.success("Image uploaded");
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Save edit
  const handleEditSave = async () => {
    if (!current) return;
    if (!editValue.trim()) return toast.error("Item name cannot be empty");

    try {
      const payload: Record<string, unknown> = {
        itemName: editValue.trim(),
      };
      // Include imageUrl if present
      if (editImageUrl) payload.imageUrl = editImageUrl;

      const res = await fetch(
        `https://server.festgo.in/api/festbite/menu-items/${current.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to update menu item");
      toast.success("Menu item updated");
      setEditOpen(false);
      setCurrent(null);
      await fetchItems();
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Error updating menu item");
    }
  };

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!current) return;

    try {
      const res = await fetch(
        `https://server.festgo.in/api/festbite/menu-items/${current.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete menu item");
      toast.success("Menu item deleted");
      setDeleteOpen(false);
      setCurrent(null);
      await fetchItems();
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Error deleting menu item");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 mt-20">
      <ToastContainer />

      {/* Heading + Create Button Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Menu Items
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage items for the selected menu type.
          </p>
        </div>
        <button
          onClick={() => router.push(`/festbite/create-menu-item?id=${id}`)}
          className="hidden sm:flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" /> Create
        </button>
      </div>

      {/* Floating Button for Mobile */}
      <button
        onClick={() => router.push(`/festbite/create-menu-item?id=${id}`)}
        className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center rounded-full bg-blue-600 w-16 h-16 text-white shadow-lg hover:bg-blue-700"
      >
        <Plus className="h-8 w-8" />
      </button>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <BarLoader color="#4A90E2" loading={loading} />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-8 text-center mt-10">
          No items found for this menu type.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl border border-gray-200 shadow-sm p-0 hover:shadow-md transition flex flex-col"
            >
              {/* Image */}
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-gray-400 bg-gray-100 rounded-t-lg">
                  No Image
                </div>
              )}

              {/* Name + Dropdown */}
              <div className="p-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{item.itemName}</h2>

                <div className="relative">
                  <button
                    onClick={() =>
                      setMenuOpen(menuOpen === item.id ? null : item.id)
                    }
                    className="rounded-full p-1 cursor-pointer"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {menuOpen === item.id && (
                    <div className="absolute right-0 -top-20 z-10 w-32 rounded-lg border border-gray-200 bg-white shadow-md">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex w-full items-center rounded-lg gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4 text-blue-600" /> Edit
                      </button>
                      <button
                        onClick={() => openDelete(item)}
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
        title={`Edit Menu Item${current ? ` — ${current.itemName}` : ""}`}
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
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Save
            </button>
          </>
        }
      >
        {/* Name */}
        <label className="block text-sm font-medium text-gray-700">
          Menu Item Name
        </label>
        <input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Enter menu item name"
          className="mt-1 mb-4 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Image Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>

          {/* Preview if exists */}
          {editImageUrl ? (
            <div className="mb-3">
              <img
                src={editImageUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          ) : null}

          {/* Dotted Drop Area */}
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
            onChange={handleEditImageSelect}
            className="hidden"
          />
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Menu Item"
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
          <span className="font-semibold">{current?.itemName}</span>? This
          action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
