"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, X } from "lucide-react";
import { BarLoader } from "react-spinners";

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
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
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

export default function AdminBannerPage() {
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newContent, setNewContent] = useState("");

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null,
    []
  );

  // Fetch banner on mount
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "https://server.festgo.in/api/homescreen-banner/",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch banner");
        const data = await res.json();

        if (data?.data?.content) {
          setBanner(data.data.content);
        } else {
          setBanner("");
        }
      } catch (err) {
        toast.error("Error fetching banner");
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [token]);

  // Save or update banner
  const handleSave = async () => {
    if (!newContent.trim()) return toast.error("Content cannot be empty");

    try {
      const res = await fetch(
        "https://server.festgo.in/api/homescreen-banner/upsert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ content: newContent }),
        }
      );

      if (!res.ok) throw new Error("Failed to update banner");

      toast.success("Banner updated successfully");
      setBanner(newContent);
      setModalOpen(false);
    } catch (err) {
      toast.error("Error updating banner");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 my-20">
      <ToastContainer />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Banner
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage the main banner content displayed on the FestGo homepage
        </p>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex flex-col items-center justify-center mt-10">
          <BarLoader color="#2563eb" />
          <p className="text-gray-600 mt-4">Loading banner...</p>
        </div>
      ) : (
        <>
          {/* Banner Display */}
          <div className="mb-8 mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Current Banner Content
            </h2>
            {banner ? (
              <p className="text-gray-700 whitespace-pre-wrap">{banner}</p>
            ) : (
              <p className="text-gray-500 italic">No banner set yet.</p>
            )}
          </div>

          {/* Create / Update Button */}
          <button
            onClick={() => {
              setNewContent(banner);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="h-5 w-5" />{" "}
            {banner ? "Update Banner" : "Create Banner"}
          </button>
        </>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Set Admin Banner"
        actionArea={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 cursor-pointer"
            >
              Save
            </button>
          </>
        }
      >
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Enter banner content"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 h-32"
        />
      </Modal>
    </div>
  );
}
