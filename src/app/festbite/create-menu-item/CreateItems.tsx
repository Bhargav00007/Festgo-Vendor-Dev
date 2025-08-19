"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateItem() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const menuTypeId = searchParams.get("id") || "";

  const [itemName, setItemName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://server.festgo.in/api/upload/public", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");
      const data = await res.json();

      const uploadedUrl = data?.url || data?.data?.url;
      if (!uploadedUrl) throw new Error("No URL returned from server");

      setImageUrl(uploadedUrl);
      setSuccess("Image uploaded successfully!");
      setError(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to upload image");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!itemName.trim() || !menuTypeId.trim() || !imageUrl.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        setError("No token found. Please login first.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        "https://server.festgo.in/api/festbite/menu-items",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemName,
            menuTypeId,
            imageUrl,
          }),
        }
      );

      if (!res.ok) throw new Error(`Failed to create: ${res.status}`);
      await res.json();

      setSuccess("Menu item created successfully!");
      setItemName("");
      setImageUrl("");

      setTimeout(() => {
        router.replace(`/festbite/menu-items/${menuTypeId}`);
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 mt-20">
      <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
        Create FestBite Menu Item
      </h1>
      <p className="mb-6 text-gray-600 text-lg">
        Add a new menu item to FestBite
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium">Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g. Paneer Biryani"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Menu Type ID */}
        <div>
          <label className="block text-sm font-medium">Menu Type ID</label>
          <input
            type="text"
            value={menuTypeId}
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="mt-3 w-32 h-32 object-cover rounded-lg border"
            />
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-full"
        >
          {loading ? "Creating..." : "Create Menu Item"}
        </button>
      </form>
    </div>
  );
}
