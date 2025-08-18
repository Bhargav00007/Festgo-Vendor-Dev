"use client";

import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

// ✅ Define a type for EventType
type EventType = {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export default function EventTypesPage() {
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

        // ✅ Log all fetched data once
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
      <div className="p-6 text-center text-lg font-semibold">
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
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Event Types
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Celebrate Diversity, Discover Every Event
        </p>
      </div>
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
