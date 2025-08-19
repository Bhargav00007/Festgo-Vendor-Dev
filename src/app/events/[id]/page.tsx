"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { BarLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
}

export default function UserEventsPage() {
  const { id } = useParams();
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null,
    []
  );

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://server.festgo.in/api/events/user-events/${id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch user events");
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error("Error fetching user events");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserEvents();
  }, [id, token]);

  return (
    <div className="mx-auto max-w-5xl p-6 my-20">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <BarLoader color="#A855F7" loading={loading} />
        </div>
      ) : events.length === 0 ? (
        <div className="text-gray-600">No events found for this category.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              {ev.imageUrl && (
                <img
                  src={ev.imageUrl}
                  alt={ev.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold">{ev.title}</h2>
                <p className="text-sm text-gray-600">{ev.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(ev.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
