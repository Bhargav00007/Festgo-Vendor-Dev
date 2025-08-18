"use client";

import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

type EventType = {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export default function EventTypesPage() {
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const token = localStorage.getItem("vendorToken");
        if (!token) {
          setError("No token found. Please login first.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          "https://server.festgo.in/api/events/event-types",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = (await res.json()) as EventType[];
        console.log("Fetched Event Types:", data);

        setEventTypes(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventTypes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BarLoader color="#3b82f6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">{error}</div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 mt-20">
      {/* Heading + Button Row */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Event Types
        </h1>

        {/* Desktop Button (right side) */}
        <button
          onClick={() => router.push("/events/create")}
          className="hidden sm:flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" /> Create
        </button>
      </div>

      {/* Tagline under heading */}
      <p className="mb-6 text-lg text-gray-600">
        Celebrate Diversity, Discover Every Event
      </p>

      {/* Mobile Floating Button */}
      <button
        onClick={() => router.push("/events/create")}
        className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700"
      >
        <Plus className="h-8 w-8" />
      </button>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {eventTypes.map((event) => (
          <div key={event.id} className="flex flex-col items-center">
            <div className="w-full h-full rounded-4xl overflow-hidden shadow-md">
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-3 text-lg font-medium text-gray-700 text-center">
              {event.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
