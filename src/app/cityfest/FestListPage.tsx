"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FaMapMarkerAlt } from "react-icons/fa";
import { BarLoader } from "react-spinners";
import { Plus } from "lucide-react";

interface Fest {
  id: string;
  type: string;
  categoryId?: string;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId");

  useEffect(() => {
    const fetchFests = async () => {
      try {
        const res = await fetch("https://server.festgo.in/api/city-fests", {
          method: "GET",
        });
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          let fetchedFests: Fest[] = data.data;

          if (categoryId) {
            fetchedFests = fetchedFests.filter(
              (fest) => fest.categoryId?.toString() === categoryId.toString()
            );
          }

          const uniqueFests = Array.from(
            new Map(fetchedFests.map((f) => [f.id, f])).values()
          );

          setFests(uniqueFests);
        } else {
          setFests([]);
        }
      } catch (error) {
        console.error("Error fetching fests:", error);
        setFests([]);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchFests();
  }, [categoryId]);

  useEffect(() => {
    fests.forEach((fest) => {
      if (fest.image_urls?.[0]) {
        const img = new window.Image();
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
            totalBrightness += (r + g + b) / 3;
            count++;
          }
          const avgBrightness = totalBrightness / count;

          setTextColors((prev) => ({
            ...prev,
            [fest.id]: avgBrightness > 128 ? "black" : "white",
          }));
        };
      }
    });
  }, [fests]);

  const handleCreateClick = () => {
    if (categoryId) {
      router.push(`/cityfest/create?categoryId=${categoryId}`);
    } else {
      router.push("/cityfest/create");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 my-20">
      {/* Breadcrumbs */}
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
                City fest Categories
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
                  City Fest
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Header + Create Button */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent pb-1">
              City Fests
            </h1>
            <p className="mt-1 text-lg text-gray-600">
              Browse, track, and manage all your City Fests in one place
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="hidden sm:flex items-center gap-2 cursor-pointer rounded-full bg-blue-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" /> Create
          </button>
        </div>

        {/* Floating Create Button on Mobile */}
        <button
          onClick={handleCreateClick}
          className="sm:hidden fixed bottom-6 right-6 z-10 flex items-center justify-center rounded-full bg-blue-600 w-16 h-16 text-white shadow-lg hover:bg-blue-700"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px] text-lg font-semibold">
          <BarLoader color="#4A90E2" loading={loading} />
        </div>
      ) : fests.length ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
          {fests.map((fest) => {
            const startDate = new Date(fest.event_start);
            const day = startDate.getDate();
            const month = startDate.toLocaleString("en-US", {
              month: "short",
            });
            const textColor = textColors[fest.id] || "white";

            return (
              <Link
                key={fest.id}
                href={`/cityfest/${fest.id}`}
                className="relative bg-gray-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition transform aspect-square"
              >
                {fest.image_urls?.length > 0 ? (
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

                <div
                  className="absolute top-0 right-0 text-white w-18 h-18 flex flex-col items-center justify-center text-xs font-bold bg-cover bg-center"
                  style={{ backgroundImage: "url('/iconbg.webp')" }}
                >
                  <span className="text-2xl">{day}</span>
                  <span className="uppercase text-md">{month}</span>
                </div>

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
      ) : (
        <div className="w-full py-24 flex flex-col items-center">
          <div className="text-2xl text-gray-500 font-semibold mb-2">
            No posts found in this category.
          </div>
        </div>
      )}
    </div>
  );
}
