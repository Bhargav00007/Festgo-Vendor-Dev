"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MoreVertical, Edit3, Trash2, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";

// Types
interface MenuType {
  id: string;
  typeName: string;
  createdAt?: string;
  updatedAt?: string;
}

// Reusable Modal with simple Tailwind transitions
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

export default function FestBiteMenuTypesPage() {
  const router = useRouter();
  const [menuTypes, setMenuTypes] = useState<MenuType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState<MenuType | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null,
    []
  );

  const fetchMenuTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://server.festgo.in/api/festbite/menu-types",
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch menu types");
      const data: unknown = await res.json();
      setMenuTypes(Array.isArray(data) ? (data as MenuType[]) : []);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error fetching menu types");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (mt: MenuType) => {
    setCurrent(mt);
    setEditValue(mt.typeName || "");
    setEditOpen(true);
    setMenuOpen(null);
  };

  const openDelete = (mt: MenuType) => {
    setCurrent(mt);
    setDeleteOpen(true);
    setMenuOpen(null);
  };

  const handleEditSave = async () => {
    if (!current) return;
    if (!editValue.trim()) return toast.error("Type name cannot be empty");
    try {
      const res = await fetch(
        `https://server.festgo.in/api/festbite/menu-types/${current.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ typeName: editValue.trim() }),
        }
      );
      if (!res.ok) throw new Error("Failed to update menu type");
      toast.success("Menu type updated");
      setEditOpen(false);
      setCurrent(null);
      await fetchMenuTypes();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error updating menu type");
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!current) return;
    try {
      const res = await fetch(
        `https://server.festgo.in/api/festbite/menu-types/${current.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete menu type");
      toast.success("Menu type deleted");
      setDeleteOpen(false);
      setCurrent(null);
      await fetchMenuTypes();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error deleting menu type");
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 mt-20">
      <ToastContainer />

      {/* Heading */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            FestBite
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Where Every Bite Feels Like a Festival
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={() => router.push("/festbite/create")}
          className="hidden sm:flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" /> Create
        </button>

        {/* Mobile Floating Button */}
        <button
          onClick={() => router.push("/festbite/create")}
          className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center rounded-full bg-blue-600 w-16 h-16 text-white shadow-lg hover:bg-blue-700"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <BarLoader color="#4A90E2" loading={loading} />
        </div>
      ) : menuTypes.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-8 text-center">
          No menu types found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {menuTypes.map((mt) => (
            <div
              key={mt.id}
              className="relative flex h-40 flex-col justify-between rounded-xl border border-gray-200 p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="text-lg font-semibold leading-snug">
                {mt.typeName}
              </div>
              <div className="text-xs text-gray-500">
                Created:{" "}
                {mt.createdAt
                  ? new Date(mt.createdAt).toLocaleDateString()
                  : "-"}
              </div>
              <button
                onClick={() => setMenuOpen(menuOpen === mt.id ? null : mt.id)}
                className="absolute right-2 top-2 rounded-full p-1 cursor-pointer"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {menuOpen === mt.id && (
                <div className="absolute right-2 top-10 z-10 w-32 rounded-lg border border-gray-200 bg-white shadow-md">
                  <button
                    onClick={() => openEdit(mt)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50"
                  >
                    <Edit3 className="h-4 w-4 text-blue-600" /> Edit
                  </button>
                  <button
                    onClick={() => openDelete(mt)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit Menu Type${current ? ` — ${current.typeName}` : ""}`}
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
        <label className="block text-sm font-medium text-gray-700">
          Type Name
        </label>
        <input
          value={editValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEditValue(e.target.value)
          }
          placeholder="Enter menu type name"
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Menu Type"
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
          <span className="font-semibold">{current?.typeName}</span>? This
          action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
