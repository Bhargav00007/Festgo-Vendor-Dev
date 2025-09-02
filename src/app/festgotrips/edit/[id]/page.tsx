"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";
import { toast } from "react-toastify";
import { X, Plus } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

interface Fest {
  id: string;
  tripName: string;
  startDate: string;
  endDate: string;
  highlights: string[];
  pricing: Record<string, number>;
  pickupLocation: string;
  inclusions: string[];
  imageUrl: string; // ✅ string instead of array
  latitude?: number;
  longitude?: number;
  total_passes?: number;
  available_passes?: number;
  price_per_pass?: number;
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
          setLoading(false);
          return;
        }

        const res = await fetch(`https://server.festgo.in/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success && data.trip) {
          const trip = data.trip;
          setFest({
            id: trip.id,
            tripName: trip.tripName,
            startDate: trip.startDate,
            endDate: trip.endDate,
            highlights: Array.isArray(trip.highlights)
              ? trip.highlights
              : trip.highlights?.split(",").map((s: string) => s.trim()) || [],
            pricing: trip.pricing || {},
            pickupLocation: trip.pickupLocation,
            inclusions: Array.isArray(trip.inclusions)
              ? trip.inclusions
              : trip.inclusions?.split(",").map((s: string) => s.trim()) || [],
            imageUrl: trip.imageUrl || "", // ✅ backend returns string
            latitude: trip.latitude,
            longitude: trip.longitude,
            total_passes: trip.total_passes,
            available_passes: trip.available_passes,
            price_per_pass: trip.price_per_pass,
          });
        } else {
          toast.error("Failed to fetch trip details.");
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
        toast.error("Something went wrong while fetching data.");
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

      const updatedUrls = fest.imageUrl ? fest.imageUrl.split(",") : [];

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
          updatedUrls.push(data.url);
        } else {
          toast.error(`Upload failed for ${file.name}`);
        }
      }

      handleChange("imageUrl", updatedUrls.join(",")); // ✅ store back as string
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
    const urls = fest.imageUrl ? fest.imageUrl.split(",") : [];
    const updated = urls.filter((_, i) => i !== index);
    setFest({ ...fest, imageUrl: updated.join(",") }); // ✅ back to string
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fest) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        toast.error("No vendor token found. Please log in again.");
        setSaving(false);
        return;
      }

      const { id: festId, ...festData } = fest;

      const res = await fetch(`https://server.festgo.in/api/trips/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(festData),
      });

      if (res.ok) {
        toast.success("Trip updated successfully!");
        router.push(`/festgotrips`);
      } else {
        toast.error("Error updating trip!");
      }
    } catch (error) {
      console.error("Error updating trip:", error);
      toast.error("Something went wrong while updating trip.");
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
        Trip not found.
      </div>
    );
  }

  const imageList = fest.imageUrl ? fest.imageUrl.split(",") : []; // ✅ safe array for UI

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20">
      {/* Breadcrumb */}
      <div className="mb-10">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push("/festgotrips")}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Trips
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
                  onClick={() => router.push(`/festgotrips/${id}`)}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 transition-colors"
                >
                  Trip
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
                  Edit Trip
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-4">
          Edit Trip
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Update your trip details below
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Trip Name
          </label>
          <input
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
            value={fest.tripName}
            onChange={(e) => handleChange("tripName", e.target.value)}
            placeholder="Trip Name"
          />
        </div>

        {/* Start Date/End Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
              value={fest.startDate.split("T")[0]}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
              value={fest.endDate.split("T")[0]}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Pickup Location
          </label>
          <input
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
            value={fest.pickupLocation}
            onChange={(e) => handleChange("pickupLocation", e.target.value)}
            placeholder="Pickup Location"
          />
        </div>

        {/* Pricing */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Pricing (JSON format: {`{ "4": 5000, "8": 3000, ... }`})
          </label>
          <textarea
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl font-mono text-sm resize-y"
            value={JSON.stringify(fest.pricing, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange("pricing", parsed);
              } catch {
                // ignore invalid JSON
              }
            }}
            placeholder='Enter pricing as JSON like {"4":5000,"8":3000,"16":2000}'
            rows={5}
          />
        </div>

        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Highlights (comma separated)
          </label>
          <textarea
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
            value={fest.highlights.join(", ")}
            onChange={(e) =>
              handleChange(
                "highlights",
                e.target.value.split(",").map((s) => s.trim())
              )
            }
            placeholder="e.g. Snow trekking, River rafting, Local sightseeing, Campfire nights"
          />
        </div>

        {/* Inclusions */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Inclusions (comma separated)
          </label>
          <textarea
            className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none p-3 w-full rounded-xl"
            value={fest.inclusions.join(", ")}
            onChange={(e) =>
              handleChange(
                "inclusions",
                e.target.value.split(",").map((s) => s.trim())
              )
            }
            placeholder="e.g. Meals, Accommodation, Transport, Guide"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Images {uploading && "(Uploading...)"}
          </label>
          <div className="flex flex-wrap gap-4">
            {imageList.map((url, index) => (
              <div key={index} className="relative w-32 h-32">
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
                <img
                  src={url}
                  alt={`Trip Image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg "
                />
              </div>
            ))}

            {/* Upload button */}
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
