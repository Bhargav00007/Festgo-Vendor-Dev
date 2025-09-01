"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function TripsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    tripName: "",
    startDate: "",
    endDate: "",
    highlights: "",
    "4": "",
    "8": "",
    "16": "",
    pickupLocation: "",
    inclusions: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // For UI indication during upload
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    setUploading(true);
    const uploadedUrls: string[] = [];
    for (const file of images) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("https://server.festgo.in/api/upload/public", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Upload failed: ${res.status} ${errorText}`);
        }

        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          throw new Error("Upload API returned unsuccessful response");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Error uploading one or more images. Please try again.");
        setUploading(false);
        throw error;
      }
    }
    setUploading(false);
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!images.length) {
      toast.error("At least one image must be uploaded.");
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) {
      toast.error("End date cannot be before start date.");
      return;
    }

    if (!form.tripName || !form.pickupLocation) {
      toast.error("Trip name and pickup location are required.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        toast.error("No vendor token found. Please log in first.");
        setLoading(false);
        return;
      }

      const uploadedUrls = await uploadImages();

      if (!uploadedUrls[0] || typeof uploadedUrls[0] !== "string") {
        toast.error(
          "There was an error uploading your images. Please try again."
        );
        setLoading(false);
        return;
      }

      const highlightsArr = form.highlights
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const inclusionsArr = form.inclusions
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const pricingObj: Record<string, number> = {};
      if (form["4"]) pricingObj["4"] = Number(form["4"]);
      if (form["8"]) pricingObj["8"] = Number(form["8"]);
      if (form["16"]) pricingObj["16"] = Number(form["16"]);

      const payload = {
        tripName: form.tripName,
        startDate: form.startDate,
        endDate: form.endDate,
        highlights: highlightsArr,
        pricing: pricingObj,
        pickupLocation: form.pickupLocation,
        inclusions: inclusionsArr,
        imageUrl: uploadedUrls[0],
      };

      const res = await fetch("https://server.festgo.in/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("API returned error status:", res.status, errorBody);
        toast.error(`Server error: ${res.status}`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        toast.success("Trip created successfully!");
        setForm({
          tripName: "",
          startDate: "",
          endDate: "",
          highlights: "",
          "4": "",
          "8": "",
          "16": "",
          pickupLocation: "",
          inclusions: "",
        });
        setImages([]);
        setMessage("");
        router.push("/festgotrips");
      } else {
        toast.error(
          `Failed to create trip: ${data.message || "Unknown error"}`
        );
        setMessage(`Failed to create trip: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error("Error creating trip");
      setMessage("Error creating trip");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto lg:px-20 mt-20">
      <div className="mx-4">
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => router.push("/trips/list")}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Create Trip
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Create Trip
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Plan, publish, and showcase epic adventure trips to your audience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-10 mt-5">
        <div>
          <label className="block font-semibold mb-2">Upload Images</label>
          <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center sm:gap-4 sm:overflow-x-auto sm:pb-2 gap-4">
            <label className="w-full h-32 sm:w-24 sm:h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-50">
              <Plus className="w-10 h-10 text-gray-500" />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageAdd}
                className="hidden"
              />
            </label>
            {images.map((img, index) => (
              <div
                key={index}
                className="relative w-full h-32 sm:w-24 sm:h-24 flex-shrink-0"
              >
                <img
                  src={URL.createObjectURL(img)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4 cursor-pointer" />
                </button>
              </div>
            ))}
          </div>
          {uploading && (
            <div className="mt-2 text-blue-700 font-semibold">
              Uploading images, please wait...
            </div>
          )}
        </div>

        {/* Trip Name */}
        <div>
          <label className="block font-semibold mb-2">Trip Name</label>
          <input
            name="tripName"
            value={form.tripName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g., Manali Adventure"
            required
          />
        </div>

        {/* Start/End Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
        </div>

        {/* Highlights */}
        <div>
          <label className="block font-semibold mb-2">
            Highlights (comma separated)
          </label>
          <textarea
            name="highlights"
            value={form.highlights}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g., Snow trekking, River rafting, Local sightseeing, Campfire nights"
            required
          />
        </div>

        {/* Pricing for groups */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-2">Price (4 pax)</label>
            <input
              name="4"
              type="number"
              value={form["4"]}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., 5000"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Price (8 pax)</label>
            <input
              name="8"
              type="number"
              value={form["8"]}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., 3000"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Price (16 pax)</label>
            <input
              name="16"
              type="number"
              value={form["16"]}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., 2000"
              required
            />
          </div>
        </div>

        {/* Pickup location */}
        <div>
          <label className="block font-semibold mb-2">Pickup Location</label>
          <input
            name="pickupLocation"
            value={form.pickupLocation}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g., Hyderabad"
            required
          />
        </div>

        {/* Inclusions */}
        <div>
          <label className="block font-semibold mb-2">
            Inclusions (comma separated)
          </label>
          <input
            name="inclusions"
            value={form.inclusions}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g., Meals, Accommodation, Transport, Guide"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className={`w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition font-semibold text-lg cursor-pointer ${
            loading || uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading
            ? "Creating Trip..."
            : uploading
            ? "Uploading Images..."
            : "Create Trip"}
        </button>
      </form>

      {message && <p className="mt-4 text-center font-semibold">{message}</p>}
    </div>
  );
}
