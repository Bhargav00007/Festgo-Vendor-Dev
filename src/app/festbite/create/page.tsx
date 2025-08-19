"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus } from "lucide-react";

export default function FestbiteCreatePage() {
  const router = useRouter();
  const [typeName, setTypeName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file)); // show preview immediately

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://server.festgo.in/api/upload/public", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");
      const data = await res.json();
      setImageUrl(data?.url || "");
      toast.success("Image uploaded successfully!");
    } catch {
      toast.error("Failed to upload image");
    }
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!typeName.trim() || !imageUrl.trim()) {
      toast.error("Menu type name and image are required.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        toast.error("No token found. Please login first.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        "https://server.festgo.in/api/festbite/menu-types",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ typeName, imageUrl }),
        }
      );

      if (!res.ok) throw new Error(`Failed to create: ${res.status}`);

      await res.json();
      toast.success("Menu type created successfully!");
      setTypeName("");
      setImageUrl("");
      setPreview(null);

      setTimeout(() => {
        router.push("/festbite");
      }, 1500);
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
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push("/festbite")}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                FestBite
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
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  Create FestBite
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 pb-1">
        Create FestBite Menu Type
      </h1>
      <p className="mb-6 text-gray-600 text-base">
        Add a new menu type to FestBite
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Menu Type Name */}
        <div>
          <label
            htmlFor="typeName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Menu Type Name
          </label>
          <input
            id="typeName"
            type="text"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder="e.g. Veg Menu"
            className="w-lg px-3 py-1.5 border border-gray-200 rounded-md shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="fileUpload"
              className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <Plus className="w-8 h-8 text-gray-500" />
              <span className="text-xs text-gray-500">Upload</span>
              <input
                id="fileUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>

            {/* Preview */}
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-28 h-28 object-cover rounded-lg "
              />
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold py-2 px-4 rounded-full shadow-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Menu Type"}
        </button>
      </form>

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
