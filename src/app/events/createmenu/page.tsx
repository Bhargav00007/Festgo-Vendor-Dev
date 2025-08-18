"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EventTypesCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Event type name is required.");
      return;
    }
    if (!imageFile) {
      setError("Please select an image.");
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

      // 1. Upload image first
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
      const imageUrl = uploadData.url; // response contains `url`

      // 2. Create event type
      const res = await fetch(
        "https://server.festgo.in/api/events/event-types",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, imageUrl }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to create: ${res.status}`);
      }

      const data = await res.json();
      console.log("Created Event Type:", data);

      setSuccess("Event type created successfully!");
      setName("");
      setImageFile(null);

      // Redirect after 1.5s
      setTimeout(() => {
        router.push("/events");
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 mt-20">
      <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        Create Event Type
      </h1>
      <p className="mb-6 text-gray-600 text-lg">
        Add a new event type to FestGo
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
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
            className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Image */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Upload Image
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files ? e.target.files[0] : null)
            }
            className="w-full"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-full shadow-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event Type"}
        </button>
      </form>
    </div>
  );
}
