"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EventTypesCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // generate & clean up local preview URL
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Event type name is required.");
      return;
    }
    if (!imageFile) {
      toast.error("Please select an image.");
      return;
    }

    try {
      setLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("vendorToken")
          : null;
      if (!token) {
        toast.error("No token found. Please login first.");
        setLoading(false);
        return;
      }

      // 1) Upload image
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch(
        "https://server.festgo.in/api/upload/public",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error(`Image upload failed: ${uploadRes.status}`);
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData?.url;
      if (!imageUrl) throw new Error("Image URL missing from upload response.");

      // 2) Create event type
      const res = await fetch(
        "https://server.festgo.in/api/events/event-types",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: name.trim(), imageUrl }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to create: ${res.status}`);
      }

      toast.success("Event type created successfully!");
      setName("");
      setImageFile(null);

      setTimeout(() => {
        router.push("/events");
      }, 1200);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 mt-20">
      <ToastContainer />

      {/* Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push("/fests/list")}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Event Types
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="ml-1  text-sm font-medium text-gray-500 md:ml-2">
                  Create Event Type
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 pb-1">
        Create Event Type
      </h1>
      <p className="mb-6 text-gray-600 text-lg">
        Add a new event type to FestGo
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        {/* Name (slightly smaller) */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Event Type Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Birthday"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Image upload: dashed square with plus + preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image
          </label>

          {/* Preview if selected */}
          {previewUrl && (
            <div className="mb-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg "
              />
            </div>
          )}

          {/* Dotted square drop/pick area */}
          <label
            htmlFor="image"
            className="flex items-center justify-center w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center">
              <Plus className="w-6 h-6" />
              <span className="text-xs text-gray-600 mt-1">Add Image</span>
            </div>
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files ? e.target.files[0] : null)
            }
            className="hidden"
          />
        </div>

        {/* Submit (slightly smaller) */}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-full shadow-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event Type"}
        </button>
      </form>
    </div>
  );
}
