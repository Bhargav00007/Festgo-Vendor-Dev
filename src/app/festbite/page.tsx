"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Edit3, Trash2, X, Plus, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";

interface MenuType {
  id: string;
  typeName: string;
  createdAt?: string;
  updatedAt?: string;
}

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
    <div className="fixed inset-0 z-500 flex items-center justify-center">
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
            className="rounded-full p-1 hover:bg-gray-100 border border-gray-200 cursor-pointer"
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

      const types: MenuType[] = Array.isArray(data) ? (data as MenuType[]) : [];
      setMenuTypes(types);
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
  };

  const openDelete = (mt: MenuType) => {
    setCurrent(mt);
    setDeleteOpen(true);
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
    <div className="mx-auto max-w-5xl p-6 my-20">
      <ToastContainer />

      {/* Keep FestBite heading and slogan + Create button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            FestBite
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Where Every Bite Feels Like a Festival
          </p>
        </div>
        <button
          onClick={() => router.push("/festbite/create")}
          className="hidden sm:flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="h-5 w-5" /> Create
        </button>
        <button
          onClick={() => router.push("/festbite/create")}
          className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center rounded-full bg-blue-600 w-16 h-16 text-white shadow-lg hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* Stats Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-4 rounded-xl border border-gray-300 bg-white p-4 hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <List className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Menu Types</p>
            <p className="text-xl font-semibold">{menuTypes.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <BarLoader color="#4A90E2" loading={loading} />
        </div>
      ) : menuTypes.length === 0 ? (
        <div className="rounded-2xl border border-gray-300 p-8 text-center">
          No menu types found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
          {/* Section Heading for Table */}
          <div className="m-4">
            <h2 className="text-2xl font-semibold text-gray-900">Menu Types</h2>
            <p className="text-gray-600">Complete list of all menu types</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-xs text-gray-500 uppercase">
                  S.NO
                </th>
                <th className="px-4 py-3 text-xs text-gray-500 uppercase">
                  Menu
                </th>
                <th className="px-4 py-3 text-xs text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-xs text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {menuTypes.map((mt, index) => (
                <tr key={mt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {mt.typeName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {mt.createdAt
                      ? new Date(mt.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/festbite/menu-items/${mt.id}`)
                      }
                      className="rounded-md bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600 cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEdit(mt)}
                      className="rounded-md bg-gray-200 px-3 py-1 text-xs text-gray-800 hover:bg-gray-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => openDelete(mt)}
                      className="rounded-md bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Menu Type"
        actionArea={
          <>
            <button
              onClick={() => setEditOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 cursor-pointer"
            >
              Save
            </button>
          </>
        }
      >
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Enter menu type name"
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Menu Type"
        actionArea={
          <>
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 cursor-pointer"
            >
              Delete
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete{" "}
          <span className="font-semibold">{current?.typeName}</span>?
        </p>
      </Modal>
    </div>
  );
}
