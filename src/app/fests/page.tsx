"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FestsPage() {
  const router = useRouter();

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
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        setMessage("❌ No vendor token found. Please log in first.");
        setLoading(false);
        return;
      }

      const uploadedUrls = await uploadImages();

      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        total_passes: parseInt(form.total_passes),
        available_passes: parseInt(form.available_passes),
        price_per_pass: parseFloat(form.price_per_pass),
        image_urls: uploadedUrls,
        whats_included: form.whats_included
          .split(",")
          .map((item) => item.trim()),
      };

      const res = await fetch("https://server.festgo.in/api/beach-fests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Fest created successfully!");
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

        // Redirect to /fests/list
        router.push("/fests/list");
      } else {
        setMessage("❌ Failed to create fest: " + data.message);
      }
    } catch (error) {
      setMessage("❌ Error creating fest");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto lg:px-20 mt-20">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Beach Fest</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-4xl p-10 space-y-10 shadow-sm"
      >
        {/* Image Upload */}
        <div>
          <label className="block font-semibold mb-2">Upload Images</label>

          <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center sm:gap-4 sm:overflow-x-auto sm:pb-2 gap-4">
            {/* Plus Icon for Adding */}
            <label className="w-full h-32 sm:w-24 sm:h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-50">
              <Plus className="w-8 h-8 text-gray-500" />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageAdd}
                className="hidden"
              />
            </label>

            {/* All Images Preview */}
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
                {/* Remove Button */}
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
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g., Beach Music Festival"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block font-semibold mb-2">Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g., Goa, India"
            required
          />
        </div>

        {/* Lat/Long */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">Latitude</label>
            <input
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Longitude</label>
            <input
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
        </div>

        {/* Total / Available */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">Total Passes</label>
            <input
              name="total_passes"
              value={form.total_passes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Available Passes</label>
            <input
              name="available_passes"
              value={form.available_passes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block font-semibold mb-2">Price per Pass (₹)</label>
          <input
            name="price_per_pass"
            value={form.price_per_pass}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>

        {/* Event Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">Event Start Date</label>
            <input
              type="date"
              name="event_start"
              value={form.event_start}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Event End Date</label>
            <input
              type="date"
              name="event_end"
              value={form.event_end}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
        </div>

        {/* Highlights */}
        <div>
          <label className="block font-semibold mb-2">Highlights</label>
          <textarea
            name="highlights"
            value={form.highlights}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g., Live DJ, Beach Games, Fireworks"
            required
          />
        </div>

        {/* Google Maps */}
        <div>
          <label className="block font-semibold mb-2">Google Maps URL</label>
          <input
            name="gmap_url"
            value={form.gmap_url}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>

        {/* What's Included */}
        <div>
          <label className="block font-semibold mb-2">
            What&apos;s Included (comma separated)
          </label>
          <input
            name="whats_included"
            value={form.whats_included}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g., Free Drinks, T-Shirts, After Party"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition font-semibold text-lg cursor-pointer"
        >
          {loading ? "Creating Fest..." : "Create Fest"}
        </button>
      </form>

      {message && <p className="mt-4 text-center font-semibold">{message}</p>}
    </div>
  );
}
