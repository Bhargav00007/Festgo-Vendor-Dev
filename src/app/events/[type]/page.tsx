"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Gift,
  Camera,
  Music,
  Truck,
  Mic,
  Sparkles,
  Shapes,
} from "lucide-react";

export default function EventFormPage() {
  const { type } = useParams();
  const [formData, setFormData] = useState({
    location: "",
    eventDate: "",
    guests: "",
    budget: "",
    venueOption: "I need a venue (Festgo will suggest)",
    soundSystem: "Referred by Festgo",
    photography: "Referred by Festgo",
    services: [] as string[],
    referralCode: "",
  });
  const [themeImage, setThemeImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (service: string) => {
    setFormData((prev) => {
      const updated = prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service];
      return { ...prev, services: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("vendorToken");
      if (!token) throw new Error("Authorization token missing");

      let uploadedImageUrl = "";

      if (themeImage) {
        const imgData = new FormData();
        imgData.append("file", themeImage);

        const uploadRes = await fetch(
          "https://server.festgo.in/api/upload/public",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imgData,
          }
        );

        if (!uploadRes.ok) throw new Error("Image upload failed");

        const uploadJson = await uploadRes.json();
        uploadedImageUrl = uploadJson?.url || "";
      }

      const payload = {
        eventType: type,
        location: formData.location,
        eventDate: formData.eventDate,
        numberOfGuests: formData.guests,
        budget: formData.budget,
        referenceTheme: uploadedImageUrl,
        venueOption: formData.venueOption,
        soundSystem: formData.soundSystem,
        photography: formData.photography,
        additionalServices: formData.services,
        referralCode: formData.referralCode,
      };

      const res = await fetch(
        "https://server.festgo.in/api/events/event-types",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Submission failed");

      toast.success("Event request submitted successfully!");
    } catch (err: unknown) {
      toast.error(
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message || "Something went wrong!"
          : "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  const additionalServices = [
    { name: "Decoration", icon: Sparkles, color: "text-pink-500" },
    { name: "Return Gifts", icon: Gift, color: "text-green-500" },
    { name: "Anchor/Emcee", icon: Mic, color: "text-purple-500" },
    { name: "Transportation", icon: Truck, color: "text-yellow-600" },
    { name: "DJ/Sound", icon: Music, color: "text-blue-500" },
    { name: "Others", icon: Shapes, color: "text-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 lg:p-8 mt-20">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-6 text-center">
        Request for {type}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto  p-6 space-y-4 "
      >
        {/* Event Type */}
        <div>
          <label className="block mb-2 font-medium">Event Type</label>
          <input
            type="text"
            value={type}
            readOnly
            className="w-full border border-gray-300 p-2 rounded-lg bg-gray-100"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block mb-2 font-medium">Event Location</label>
          <input
            type="text"
            name="location"
            className="w-full border border-gray-300 p-2 rounded-lg"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block mb-2 font-medium">Event Date</label>
          <input
            type="date"
            name="eventDate"
            className="w-full border border-gray-300 p-2 rounded-lg"
            value={formData.eventDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Guests */}
        <div>
          <label className="block mb-2 font-medium">Number of Guests</label>
          <input
            type="number"
            name="guests"
            className="w-full border border-gray-300 p-2 rounded-lg"
            value={formData.guests}
            onChange={handleChange}
            required
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block mb-2 font-medium">Event Budget</label>
          <input
            type="number"
            name="budget"
            placeholder="Enter your budget"
            className="w-full border border-gray-300 p-2 rounded-lg"
            value={formData.budget}
            onChange={handleChange}
            required
          />
        </div>

        {/* Theme Image */}
        <div>
          <label className="block mb-2 font-medium">
            Reference Theme (Image)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThemeImage(e.target.files?.[0] || null)}
          />
        </div>

        {/* Venue Option */}
        <div>
          <label className="block mb-2 font-medium">Venue Option</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="venueOption"
                value="I need a venue (Festgo will suggest)"
                checked={
                  formData.venueOption ===
                  "I need a venue (Festgo will suggest)"
                }
                onChange={handleChange}
              />
              I need a venue (Festgo will suggest)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="venueOption"
                value="Not Required"
                checked={formData.venueOption === "Not Required"}
                onChange={handleChange}
              />
              Not Required
            </label>
          </div>
        </div>

        {/* Sound System */}
        <div>
          <label className="block mb-2 font-medium">Sound System</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="soundSystem"
                value="Referred by Festgo"
                checked={formData.soundSystem === "Referred by Festgo"}
                onChange={handleChange}
              />
              Referred by Festgo
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="soundSystem"
                value="Not Required"
                checked={formData.soundSystem === "Not Required"}
                onChange={handleChange}
              />
              Not Required
            </label>
          </div>
        </div>

        {/* Photography */}
        <div>
          <label className="block mb-2 font-medium">Photography</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="photography"
                value="Referred by Festgo"
                checked={formData.photography === "Referred by Festgo"}
                onChange={handleChange}
              />
              Referred by Festgo
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="photography"
                value="Not Required"
                checked={formData.photography === "Not Required"}
                onChange={handleChange}
              />
              Not Required
            </label>
          </div>
        </div>

        {/* Additional Services */}
        <div>
          <label className="block mb-2 font-medium">Additional Services</label>
          <div className="grid grid-cols-2 gap-3">
            {additionalServices.map(({ name, icon: Icon, color }) => (
              <label
                key={name}
                className="flex items-center gap-2 border border-gray-300 p-2 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.services.includes(name)}
                  onChange={() => handleCheckboxChange(name)}
                />
                <Icon size={18} className={color} /> {name}
              </label>
            ))}
          </div>
        </div>

        {/* Referral Code */}
        <div>
          <label className="block mb-2 font-medium">Referral Code</label>
          <input
            type="text"
            name="referralCode"
            placeholder="Referral Code"
            className="w-full border border-gray-300 p-2 rounded-lg"
            value={formData.referralCode}
            onChange={handleChange}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-full font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
