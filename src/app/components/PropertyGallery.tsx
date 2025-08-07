"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { BarLoader } from "react-spinners";
import { Icon } from "@iconify/react";

type PropertyImageGalleryProps = {
  vendorId: string;
  propertyId: string;
  token?: string; // Optional token, fallback to localStorage
};

type PropertyPhoto = {
  imageURL: string;
  [key: string]: string;
};

type Property = {
  id: string;
  photos?: PropertyPhoto[];
};

export default function PropertyImageGallery({
  vendorId,
  propertyId,
  token,
}: PropertyImageGalleryProps) {
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);

      // Prefer passed token, fallback to localStorage
      const localToken = token ?? localStorage.getItem("vendorToken");
      if (!vendorId || !propertyId || !localToken) {
        setError("Missing vendorId/propertyId or authentication.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://server.festgo.in/api/admin/property/${vendorId}`,
          {
            headers: { Authorization: `Bearer ${localToken}` },
          }
        );

        if (!res.ok) {
          setError("Failed to fetch property details.");
          setLoading(false);
          return;
        }

        const propData = await res.json();
        const properties: Property[] = propData?.properties || [];
        const property = properties.find((p) => p.id === propertyId);

        if (!property) {
          setError("Property not found.");
          setLoading(false);
          return;
        }

        // Extract valid image URLs robustly
        const photoURLs = Array.isArray(property.photos)
          ? property.photos
              .map((photo) =>
                typeof photo === "string"
                  ? photo
                  : photo && typeof photo === "object" && photo.imageURL
                  ? photo.imageURL
                  : null
              )
              .filter(Boolean)
          : [];

        setPhotos(photoURLs as string[]);
      } catch (e) {
        setError("An error occurred while fetching images.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [vendorId, propertyId, token]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <BarLoader color="#3b82f6" />
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        <Icon icon="solar:gallery-bold" className="inline mr-2" width={18} />
        {error}
      </div>
    );
  if (!photos.length)
    return (
      <div className="p-6 text-center text-gray-500">
        <Icon icon="solar:gallery-bold" className="inline mr-2" width={18} />
        No property images available.
      </div>
    );

  // Number of photos to show when collapsed
  const INITIAL_PHOTOS = 6;

  // Photos to display based on expanded state
  const displayedPhotos = expanded ? photos : photos.slice(0, INITIAL_PHOTOS);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon icon="solar:gallery-bold" className="text-blue-600" width={22} />
        Property Photos
      </h3>
      {/* Mobile (Carousel style) */}
      <div className="lg:hidden flex gap-4 overflow-x-auto pb-2">
        {displayedPhotos.map((url, i) => (
          <div
            key={url + i}
            className="min-w-[220px] h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative"
          >
            <Image
              src={url}
              alt={`Photo ${i + 1}`}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 400px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      {/* Desktop/Mid-screen (Grid) */}
      <div className="hidden lg:grid gap-3 grid-cols-2 xl:grid-cols-3">
        {displayedPhotos.map((url, i) => (
          <div
            key={url + i}
            className="relative h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
          >
            <Image
              src={url}
              alt={`Photo ${i + 1}`}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
              sizes="(max-width: 1280px) 350px, 450px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Show More / Show Less button only if more photos exist */}
      {photos.length > INITIAL_PHOTOS && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {expanded
              ? "Show Less"
              : `Show More (${photos.length - INITIAL_PHOTOS})`}
          </button>
        </div>
      )}
    </div>
  );
}
