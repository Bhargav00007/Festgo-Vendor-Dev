"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Calendar } from "lucide-react";
import { BarLoader } from "react-spinners";

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
  gmap_url: string; // Using backend-provided map URL
  whats_included: string[];
}

export default function FestDetailPage() {
  const { id } = useParams();
  const [fest, setFest] = useState<Fest | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    const fetchFest = async () => {
      try {
        const res = await fetch(
          `https://server.festgo.in/api/beach-fests/${id}`
        );
        const data = await res.json();
        if (data.success && data.data) {
          setFest(data.data);
        }
      } catch (error) {
        console.error("Error fetching fest:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFest();
  }, [id]);

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
    <div className="max-w-5xl mx-auto p-4 space-y-6 mt-20">
      {/* Fest Type */}
      <h1 className="text-4xl font-bold text-gray-900">{fest.type}</h1>

      {/* Location */}
      <div className="flex items-center text-gray-600 text-lg">
        <MapPin className="w-5 h-5 mr-2 text-red-500" />
        {fest.location}
      </div>

      {/* Dates */}
      <div className="flex items-center text-gray-500">
        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
        {formatDate(fest.event_start)} - {formatDate(fest.event_end)}
      </div>

      {/* Horizontal Scrollable Images */}
      <div className="flex overflow-x-auto space-x-3 scrollbar-hide py-2">
        {fest.image_urls?.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Fest image ${idx + 1}`}
            className="w-150 h-80 object-cover rounded-lg shadow flex-shrink-0"
          />
        ))}
      </div>

      {/* Highlights */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Highlights</h2>
        <p className="text-gray-700 text-lg">{fest.highlights}</p>
      </div>

      {/* What's Included */}
      <div>
        <h2 className="text-2xl font-bold mb-2">What&apos;s Included</h2>
        <ul className="list-disc list-inside text-gray-700 text-lg">
          {fest.whats_included?.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Google Map from backend */}
      {fest.gmap_url && (
        <div>
          <iframe
            src={fest.gmap_url}
            width="100%"
            height="250"
            loading="lazy"
            allowFullScreen
            className="rounded-lg shadow"
          ></iframe>
        </div>
      )}

      {/* Coordinates */}
      <p className="text-sm text-gray-500">
        Latitude: {fest.latitude} | Longitude: {fest.longitude}
      </p>

      {/* Price Banner */}
      <div className="bg-yellow-200 text-center py-4 rounded-full shadow text-xl font-bold">
        Entry Pass at ₹{fest.price_per_pass.toLocaleString()}/- onwards
      </div>

      {/* Available Passes */}
      <p className="text-center text-gray-600 text-sm">
        Available Passes: {fest.available_passes}
      </p>
    </div>
  );
}
