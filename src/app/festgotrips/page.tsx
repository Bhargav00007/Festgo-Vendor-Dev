"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaMapMarkerAlt } from "react-icons/fa";
import { BarLoader } from "react-spinners";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Trip {
  id: string;
  tripName: string;
  startDate: string;
  endDate: string;
  highlights: string[];
  pricing: Record<string, number>;
  pickupLocation: string;
  inclusions: string[];
  imageUrl: string; // single imageUrl as string, not array
}

export default function TripListPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [textColors, setTextColors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Fetch all trips with authorization header
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("vendorToken");
        if (!token) {
          console.error("No vendor token found in localStorage");
          setLoading(false);
          return;
        }

        const res = await fetch("https://server.festgo.in/api/trips", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to fetch trips: ${res.status} - ${errorText}`
          );
        }

        const data = await res.json();
        if (data.success && Array.isArray(data.trips)) {
          const mappedTrips: Trip[] = data.trips.map((trip: Trip) => ({
            ...trip,
            imageUrl: trip.imageUrl || "",
          }));
          setTrips(mappedTrips);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Detect image brightness and set text color
  useEffect(() => {
    trips.forEach((trip) => {
      if (trip.imageUrl) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = trip.imageUrl;
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
            [trip.id]: avgBrightness > 128 ? "black" : "white",
          }));
        };
      }
    });
  }, [trips]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold">
        <BarLoader color="#4A90E2" loading={loading} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 my-20">
      {/* Heading */}
      <div className="mb-10">
        {/* Top bar with heading and create button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Trips
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Browse, track, and manage all your upcoming and past trips in one
              place{" "}
            </p>
          </div>

          {/* Desktop create button */}
          <button
            onClick={() => router.push("/festgotrips/createtrips")}
            className="hidden sm:flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" /> Create
          </button>
        </div>

        {/* Mobile floating button */}
        <button
          onClick={() => router.push("/festgotrips/createtrips")}
          className="sm:hidden fixed bottom-6 right-6 z-10 flex items-center justify-center rounded-full bg-blue-600 w-16 h-16 text-white shadow-lg hover:bg-blue-700"
          aria-label="Create Trip"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* If no trips, show message but keep header and create button */}
      {!trips.length ? (
        <div className="flex justify-center items-center min-h-[300px] text-lg font-semibold">
          No trips found.
        </div>
      ) : (
        // Grid of trips
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
          {trips.map((trip) => {
            const startDate = new Date(trip.startDate);
            const day = startDate.getDate();
            const month = startDate.toLocaleString("en-US", { month: "short" });
            const textColor = textColors[trip.id] || "white";
            const prices = Object.values(trip.pricing || {});
            const minPrice = prices.length ? Math.min(...prices) : 0;

            return (
              <Link
                key={trip.id}
                href={`/festgotrips/${trip.id}`}
                className="relative bg-gray-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition transform aspect-square"
              >
                {/* Image */}
                {trip.imageUrl ? (
                  <img
                    src={trip.imageUrl}
                    alt={trip.tripName}
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
                  <h2 className="lg:text-xl text-2xl font-bold">
                    {trip.tripName}
                  </h2>
                  <p className="flex items-center text-md">
                    <FaMapMarkerAlt className="mr-1" />
                    {trip.pickupLocation}
                  </p>
                  <p className="text-md">
                    Rs {minPrice.toLocaleString()}/- onwards
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
