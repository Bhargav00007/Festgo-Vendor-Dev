"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

// ✅ Type for the payload sent to API
interface CityFestPayload {
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
  gmap_url: string;
  whats_included: string[];
  image_urls: string[];
  categoryId?: string;
}

export default function CreateFestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  const [form, setForm] = useState({
    type: "",
    location: "",
    latitude: "",
    longitude: "",
    total_passes: "",
    available_passes: "",
    price_per_pass: "",
    event_start: "",
    event_end: "",
    highlights: "",
    gmap_url: "",
    whats_included: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
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
    const uploadedUrls: string[] = [];
    for (const file of images) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://server.festgo.in/api/upload/public", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        uploadedUrls.push(data.url);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const totalPasses = parseInt(form.total_passes);
    const availablePasses = parseInt(form.available_passes);
    if (availablePasses > totalPasses) {
      toast.error("Available passes cannot be more than total passes.");
      return;
    }

    const startDate = new Date(form.event_start);
    const endDate = new Date(form.event_end);
    if (endDate < startDate) {
      toast.error("Event end date cannot be before start date.");
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

      // ✅ Payload with proper typing
      const payload: CityFestPayload = {
        type: form.type,
        location: form.location,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        total_passes: totalPasses,
        available_passes: availablePasses,
        price_per_pass: parseFloat(form.price_per_pass),
        event_start: form.event_start,
        event_end: form.event_end,
        highlights: form.highlights,
        gmap_url: form.gmap_url,
        whats_included: form.whats_included
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
        image_urls: uploadedUrls,
        ...(categoryId ? { categoryId } : {}),
      };

      const res = await fetch(
        "https://server.festgo.in/api/city-fests/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success("Fest created successfully!");
        setForm({
          type: "",
          location: "",
          latitude: "",
          longitude: "",
          total_passes: "",
          available_passes: "",
          price_per_pass: "",
          event_start: "",
          event_end: "",
          highlights: "",
          gmap_url: "",
          whats_included: "",
        });
        setImages([]);
        router.push("/cityfest");
      } else {
        toast.error("Failed to create fest: " + data.message);
      }
    } catch (error) {
      toast.error("Error creating fest");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto lg:px-20 mt-20">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push("/cityfest/categories")}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Categories
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
                  Create City Fest
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent pb-1 mb-5">
        Create New City Fest
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
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
        </div>
        {/* Fest Type */}
        <div>
          <label className="block font-semibold mb-2">Fest Type</label>
          <input
            type="text"
            name="type"
            placeholder="e.g., City Music Festival"
            value={form.type}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block font-semibold mb-2">Location</label>
          <input
            type="text"
            name="location"
            placeholder="e.g., Goa, India"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Latitude and Longitude */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              placeholder="Latitude"
              value={form.latitude}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              placeholder="Longitude"
              value={form.longitude}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>

        {/* Passes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">Total Passes</label>
            <input
              type="number"
              name="total_passes"
              placeholder="Total Passes"
              value={form.total_passes}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Available Passes</label>
            <input
              type="number"
              name="available_passes"
              placeholder="Available Passes"
              value={form.available_passes}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block font-semibold mb-2">Price per Pass (₹)</label>
          <input
            type="number"
            step="any"
            name="price_per_pass"
            placeholder="Price per Pass"
            value={form.price_per_pass}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Event Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">Event Start Date</label>
            <input
              type="datetime-local"
              name="event_start"
              value={form.event_start}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Event End Date</label>
            <input
              type="datetime-local"
              name="event_end"
              value={form.event_end}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>

        {/* Highlights */}
        <div>
          <label className="block font-semibold mb-2">Highlights</label>
          <textarea
            name="highlights"
            placeholder="e.g., Live DJ, Beach Games, Fireworks"
            value={form.highlights}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Google Maps URL */}
        <div>
          <label className="block font-semibold mb-2">Google Maps URL</label>
          <input
            type="text"
            name="gmap_url"
            placeholder="https://maps.google.com/..."
            value={form.gmap_url}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* What's Included */}
        <div>
          <label className="block font-semibold mb-2">
            What&apos;s Included (comma separated)
          </label>
          <input
            type="text"
            name="whats_included"
            placeholder="e.g., Free Drinks, T-Shirts, After Party"
            value={form.whats_included}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition font-semibold text-lg cursor-pointer flex items-center justify-center"
        >
          {loading ? (
            "Creating..."
          ) : (
            <>
              <Plus className="mr-2" size={16} /> Create Fest
            </>
          )}
        </button>
      </form>

      {message && <p className="mt-4 text-center font-semibold">{message}</p>}
    </div>
  );
}
