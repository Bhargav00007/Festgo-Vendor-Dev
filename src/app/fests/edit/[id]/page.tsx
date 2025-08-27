"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";
import { toast } from "react-toastify";
import { X, Plus } from "lucide-react";
import "react-toastify/dist/ReactToastify.css"; // ✅ Ensure styles are loaded

interface Fest {
  id: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  total_passes: number;
  available_passes: number;
  price_per_pass: number;
  event_start: string;
  event_end: string;
  highlights: string;
  image_urls: string[];
  gmap_url: string;
  whats_included: string[];
}

export default function FestEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [fest, setFest] = useState<Fest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchFest = async () => {
      try {
        const token = localStorage.getItem("vendorToken");
        if (!token) {
          toast.error("No vendor token found. Please log in again.");
          return;
        }

        const res = await fetch(
          `https://server.festgo.in/api/beach-fests/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (data.success && data.data) {
          setFest(data.data);
        } else {
          toast.error("Failed to fetch fest details.");
        }
      } catch (error) {
        console.error("Error fetching fest:", error);
        toast.error("Something went wrong while fetching fest data.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFest();
  }, [id]);

  const handleChange = <K extends keyof Fest>(field: K, value: Fest[K]) => {
    setFest((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !fest) return;

    const files = Array.from(e.target.files);
    const token = localStorage.getItem("vendorToken");
    if (!token) {
      toast.error("No vendor token found. Please log in again.");
      return;
    }

    try {
      setUploading(true);

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("https://server.festgo.in/api/upload/public", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const data = await res.json();
        if (data?.url) {
          setFest((prev) =>
            prev
              ? { ...prev, image_urls: [...prev.image_urls, data.url] }
              : prev
          );
        } else {
          toast.error(`Upload failed for ${file.name}`);
        }
      }

      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Something went wrong while uploading images.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = (index: number) => {
    if (!fest) return;
    const updatedImages = fest.image_urls.filter((_, i) => i !== index);
    setFest({ ...fest, image_urls: updatedImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fest) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        toast.error("No vendor token found. Please log in again.");
        return;
      }

      const res = await fetch(
        `https://server.festgo.in/api/beach-fests/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(fest),
        }
      );

      if (res.ok) {
        toast.success("Fest updated successfully!");
        router.push(`/fests/${id}`);
      } else {
        toast.error("Error updating fest!");
      }
    } catch (error) {
      console.error("Error updating fest:", error);
      toast.error("Something went wrong while updating fest.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BarLoader color="#4A90E2" loading={loading} />
      </div>
    );
  }

  if (!fest) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Fest not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20">
      {/* Breadcrumb */}
      <div className="mb-10">
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => router.push("/festlist")}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Fests
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
                  <button
                    onClick={() => router.push(`/fests/${id}`)}
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 transition-colors"
                  >
                    Fest
                  </button>
                </div>
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
                    Edit Fest
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Edit Fest
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Update and refine your fest details to keep everything accurate and
          fresh
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fest Type */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Fest Type
          </label>
          <input
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
            value={fest.type}
            onChange={(e) => handleChange("type", e.target.value)}
            placeholder="Fest Type"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Location
          </label>
          <input
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
            value={fest.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Location"
          />
        </div>

        {/* Latitude / Longitude */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Latitude
            </label>
            <input
              type="number"
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
              value={fest.latitude}
              onChange={(e) =>
                handleChange("latitude", parseFloat(e.target.value))
              }
              placeholder="Latitude"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Longitude
            </label>
            <input
              type="number"
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
              value={fest.longitude}
              onChange={(e) =>
                handleChange("longitude", parseFloat(e.target.value))
              }
              placeholder="Longitude"
            />
          </div>
        </div>

        {/* Total Passes / Available Passes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Total Passes
            </label>
            <input
              type="number"
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
              value={fest.total_passes}
              onChange={(e) =>
                handleChange("total_passes", parseInt(e.target.value))
              }
              placeholder="Total Passes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Available Passes
            </label>
            <input
              type="number"
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
              value={fest.available_passes}
              onChange={(e) =>
                handleChange("available_passes", parseInt(e.target.value))
              }
              placeholder="Available Passes"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Price Per Pass
          </label>
          <input
            type="number"
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
            value={fest.price_per_pass}
            onChange={(e) =>
              handleChange("price_per_pass", parseFloat(e.target.value))
            }
            placeholder="Price Per Pass"
          />
        </div>

        {/* Event Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Event Start Date
            </label>
            <input
              type="date"
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
              value={fest.event_start.split("T")[0]}
              onChange={(e) => handleChange("event_start", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Event End Date
            </label>
            <input
              type="date"
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
              value={fest.event_end.split("T")[0]}
              onChange={(e) => handleChange("event_end", e.target.value)}
            />
          </div>
        </div>

        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Highlights
          </label>
          <textarea
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
            value={fest.highlights}
            onChange={(e) => handleChange("highlights", e.target.value)}
            placeholder="Highlights"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Images {uploading && "(Uploading...)"}
          </label>
          <div className="flex flex-wrap gap-4">
            {/* Uploaded Images */}
            {fest.image_urls.map((url, index) => (
              <div key={index} className="relative w-32 h-32">
                <img
                  src={url}
                  alt={`Fest Image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {/* Upload Box */}
            <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-100">
              <Plus size={28} className="text-gray-500" />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>

        {/* Google Map URL */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Google Map URL
          </label>
          <input
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
            value={fest.gmap_url}
            onChange={(e) => handleChange("gmap_url", e.target.value)}
            placeholder="Google Map URL"
          />
        </div>

        {/* What's Included */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            What&apos;s Included (comma separated)
          </label>
          <textarea
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
            value={fest.whats_included.join(",")}
            onChange={(e) =>
              handleChange("whats_included", e.target.value.split(","))
            }
            placeholder="What's Included"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-500 text-white py-3 px-6 w-full rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
