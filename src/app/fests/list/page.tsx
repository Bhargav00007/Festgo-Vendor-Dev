"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaMapMarkerAlt } from "react-icons/fa";
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
  gmap_url: string;
  whats_included: string[];
}

export default function FestListPage() {
  const [fests, setFests] = useState<Fest[]>([]);
  const [loading, setLoading] = useState(true);
  const [textColors, setTextColors] = useState<Record<string, string>>({});

  // Fetch all fests
  useEffect(() => {
    const fetchFests = async () => {
      try {
        const res = await fetch("https://server.festgo.in/api/beach-fests", {
          method: "GET",
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setFests(data.data);
        }
      } catch (error) {
        console.error("Error fetching fests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFests();
  }, []);

  // Detect image brightness and set text color
  useEffect(() => {
    fests.forEach((fest) => {
      if (fest.image_urls?.[0]) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = fest.image_urls[0];
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);

          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          let totalBrightness = 0;
          let count = 0;

          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;
            count++;
          }

          const avgBrightness = totalBrightness / count;
          setTextColors((prev) => ({
            ...prev,
            [fest.id]: avgBrightness > 128 ? "black" : "white", // Threshold 128
          }));
        };
      }
    });
  }, [fests]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold">
        <BarLoader color="#4A90E2" loading={loading} />
      </div>
    );
  }

  if (!fests.length) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold">
        No fests found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 mt-20">
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-6 text-start">Fests</h1>

      {/* Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
        {fests.map((fest) => {
          const startDate = new Date(fest.event_start);
          const day = startDate.getDate();
          const month = startDate.toLocaleString("en-US", { month: "short" });

          const textColor = textColors[fest.id] || "white";

          return (
            <Link
              key={fest.id}
              href={`/fests/${fest.id}`}
              className="relative bg-gray-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition transform aspect-square"
            >
              {/* Image */}
              {fest.image_urls && fest.image_urls.length > 0 ? (
                <img
                  src={fest.image_urls[0]}
                  alt={fest.type}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}

              {/* Date badge with custom background image */}
              <div
                className="absolute top-0 right-0 text-white w-18 h-18 flex flex-col items-center justify-center text-xs font-bold bg-cover bg-center"
                style={{ backgroundImage: "url('/iconbg.webp')" }}
              >
                <span className="text-2xl">{day}</span>
                <span className="uppercase text-md">{month}</span>
              </div>

              {/* Text overlay at bottom */}
              <div
                className={`absolute bottom-0 left-0 p-4 drop-shadow-md`}
                style={{ color: textColor }}
              >
                <h2 className="lg:text-xl text-2xl font-bold">{fest.type}</h2>
                <p className="flex items-center text-md">
                  <FaMapMarkerAlt className="mr-1" />
                  {fest.location}
                </p>
                <p className="text-md">
                  Rs {fest.price_per_pass.toLocaleString()}/- onwards
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
