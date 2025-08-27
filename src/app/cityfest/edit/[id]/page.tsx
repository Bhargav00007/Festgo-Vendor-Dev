"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";
import "react-toastify/dist/ReactToastify.css"; // ✅ Ensure styles are loaded

interface Fest {
  id: string;
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

  useEffect(() => {
    const fetchFest = async () => {
      try {
        const token = localStorage.getItem("vendorToken");
        if (!token) {
          toast.error("No vendor token found. Please log in again.");
          return;
        }

        const res = await fetch(
          `https://server.festgo.in/api/city-fests/${id}`,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fest) return;
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    handleChange("image_urls", [...fest.image_urls, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    if (!fest) return;
    const updated = fest.image_urls.filter((_, i) => i !== index);
    handleChange("image_urls", updated);
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

      const res = await fetch(`https://server.festgo.in/api/city-fests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fest),
      });

      if (res.ok) {
        toast.success("Fest updated successfully!");
        router.push(`/cityfest/${id}`);
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
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent pb-1">
          Edit City Fest
        </h1>
        <p className="mt-1 text-lg text-gray-600">
          Update and refine your fest details to keep everything accurate and
          fresh
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Image Uploads */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Images
          </label>
          <div className="flex flex-wrap gap-4">
            {fest.image_urls.map((url, index) => (
              <div
                key={index}
                className="relative w-32 h-32 rounded-lg overflow-hidden border"
              >
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {/* Upload Box */}
            <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <Plus className="text-gray-400" size={32} />
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
