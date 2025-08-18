"use client";

import { useRouter } from "next/navigation";

const eventTypes = [
  "Wedding",
  "Birthdays",
  "Corporate Events",
  "Engagement",
  "Anniversary",
  "House Warming",
  "Half Saree",
  "Others",
];

const colors = [
  "bg-pink-400",
  "bg-yellow-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-red-400",
  "bg-indigo-400",
  "bg-orange-400",
];

export default function EventsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-5 lg:p-10 mt-10">
      <h1 className="text-3xl font-bold text-center mb-10">
        Choose Your Event
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {eventTypes.map((type, index) => (
          <div
            key={type}
            onClick={() => router.push(`/events/${encodeURIComponent(type)}`)}
            className={`cursor-pointer flex items-center justify-center shadow-lg rounded-4xl aspect-square text-white font-semibold text-lg hover:scale-105 transition-transform ${colors[index]}`}
          >
            {type}
          </div>
        ))}
      </div>
    </div>
  );
}
