"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  MoreVertical,
  Trash2,
  Pencil,
  X,
  ExternalLink,
} from "lucide-react";
import { BarLoader } from "react-spinners";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Fest {
  id: string;
  tripName: string;
  startDate: string;
  endDate: string;
  highlights: string[];
  pricing: Record<string, number>;
  pickupLocation: string;
  inclusions: string[];
  imageUrl: string;
  image_urls?: string[];
  gmap_url?: string;
  latitude?: number;
  longitude?: number;
  price_per_pass?: number;
  available_passes?: number;
}

export default function FestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [fest, setFest] = useState<Fest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const numberOfDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  useEffect(() => {
    const fetchFest = async () => {
      try {
        const vendorToken = localStorage.getItem("vendorToken");
        const res = await fetch(`https://server.festgo.in/api/trips/${id}`, {
          headers: {
            Authorization: `Bearer ${vendorToken}`,
          },
        });
        const data = await res.json();
        if (data.success && data.trip) {
          const tripData = data.trip;
          const alignedFest: Fest = {
            id: tripData.id,
            tripName: tripData.tripName,
            startDate: tripData.startDate,
            endDate: tripData.endDate,
            highlights: Array.isArray(tripData.highlights)
              ? tripData.highlights
              : tripData.highlights?.split(",").map((s: string) => s.trim()) ||
                [],
            pricing: tripData.pricing || {},
            pickupLocation: tripData.pickupLocation,
            inclusions: Array.isArray(tripData.inclusions)
              ? tripData.inclusions
              : tripData.inclusions?.split(",").map((s: string) => s.trim()) ||
                [],
            imageUrl: tripData.imageUrl || (tripData.image_urls?.[0] ?? ""),
            image_urls: tripData.image_urls,
            gmap_url: tripData.gmap_url || "",
            latitude: tripData.latitude,
            longitude: tripData.longitude,
            price_per_pass: tripData.price_per_pass,
            available_passes: tripData.available_passes,
          };
          setFest(alignedFest);
        }
      } catch (error) {
        console.error("Error fetching fest:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFest();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      const vendorToken = localStorage.getItem("vendorToken");
      const res = await fetch(`https://server.festgo.in/api/trips/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${vendorToken}`,
        },
      });

      if (res.ok) {
        toast.success("Fest deleted successfully!");
        setTimeout(() => {
          router.push("/festgotrips");
        }, 1500);
      } else {
        toast.error("Failed to delete fest.");
      }
    } catch (error) {
      console.error("Error deleting fest:", error);
      toast.error("Something went wrong while deleting.");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

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
    <>
      {/* Hero Section */}
      <div className="relative w-full h-[350px] md:h-[450px] flex items-center justify-center mb-12 mt-14">
        <img
          src={fest.imageUrl || "/public/image.png"}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent z-10" />
        <div className="relative z-20 text-center w-full px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow mb-4 animate-fade-in">
            {fest.tripName}
          </h1>
          <div className="flex justify-center gap-6 text-lg md:text-xl text-white/80 font-medium mb-2 animate-fade-in flex-wrap">
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-400" />
              {fest.pickupLocation}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-300" />
              {formatDate(fest.startDate)} - {formatDate(fest.endDate)}
            </span>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition shadow-md"
                aria-label="Actions menu"
              >
                <MoreVertical className="w-6 h-6 text-white" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl shadow-md border border-gray-100 p-2 bg-white/90"
            >
              <DropdownMenuItem
                onClick={() => router.push(`/festgotrips/edit/${id}`)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg"
              >
                <Pencil className="w-5 h-5 text-blue-500" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-2 text-red-500 cursor-pointer hover:bg-red-100 rounded-lg"
              >
                <Trash2 className="w-5 h-5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Detail Bento Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-30 space-y-10 relative z-20">
        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {/* Days of trip */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="text-3xl font-extrabold text-blue-700">
              {numberOfDays(fest.startDate, fest.endDate)}
            </div>
            <div className="font-semibold text-gray-700">Days of Trip</div>
          </div>

          {/* Depart Date */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="text-3xl font-extrabold text-blue-700">
              {formatDate(fest.startDate)}
            </div>
            <div className="font-semibold text-gray-700">Depart Date</div>
          </div>

          {/* Pickup Location */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
            <MapPin className="w-8 h-8 text-blue-700 mb-2" />
            <div className="font-semibold text-gray-700">Pickup Location</div>
            <div>{fest.pickupLocation || "N/A"}</div>
          </div>

          {/* Member Prices */}
          <div className="bg-white rounded-2xl shadow-md p-6 text-gray-800">
            <div className="font-semibold text-lg mb-3">
              Pricing (per group)
            </div>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(fest.pricing).length ? (
                Object.entries(fest.pricing).map(([group, price]) => (
                  <li key={group}>
                    {group} pax &mdash; ₹{price.toLocaleString()}
                  </li>
                ))
              ) : (
                <li>No pricing info</li>
              )}
            </ul>
          </div>
        </div>

        {/* Highlights and Inclusions side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gradient-to-br from-blue-50 via-white to-yellow-50 rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">
              Highlights
            </h2>
            <p className="text-gray-700 text-lg whitespace-pre-line">
              {Array.isArray(fest.highlights)
                ? fest.highlights.join(", ")
                : fest.highlights}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 via-white to-blue-50 rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 text-yellow-900">
              What&apos;s Included
            </h2>
            {fest.inclusions?.length ? (
              <ul className="list-disc list-inside text-gray-700 text-lg mb-3">
                {fest.inclusions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 mb-3">No inclusions listed.</p>
            )}
            <p className="text-sm text-gray-500 italic">* Costs extra</p>
          </div>
        </div>

        {/* Gallery */}
        {fest.image_urls?.length ? (
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-10 mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {fest.image_urls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-[4/3] rounded-xl overflow-hidden shadow-md cursor-pointer border border-gray-100"
                >
                  <img
                    src={url}
                    alt={`Fest image ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Google Maps button */}
        {fest.gmap_url && (
          <div className="flex justify-center mt-10">
            <a
              href={fest.gmap_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md text-lg font-semibold transition"
            >
              <ExternalLink className="w-6 h-6" />
              View on Google Maps
            </a>
          </div>
        )}

        {/* Latitude and Longitude */}
        {fest.latitude !== undefined && fest.longitude !== undefined && (
          <div className="flex justify-center mt-6">
            <div className="bg-white/70 rounded-xl px-6 py-3 shadow text-center text-sm text-gray-500">
              Latitude: {fest.latitude} | Longitude: {fest.longitude}
            </div>
          </div>
        )}

        {/* Entry Pass & Available Passes */}
        {fest.price_per_pass !== undefined &&
          fest.available_passes !== undefined && (
            <div className="flex flex-col items-center gap-2 mt-8">
              <div className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-100 text-center py-5 px-10 rounded-full shadow-md text-2xl font-extrabold text-yellow-900">
                Entry Pass at ₹{fest.price_per_pass.toLocaleString()}/- onwards
              </div>
              <div className="text-center text-gray-700 text-base font-medium">
                Available Passes: {fest.available_passes}
              </div>
            </div>
          )}
      </div>

      {/* Delete Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteDialogOpen(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full z-10 border-t-8 border-red-500"
          >
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-red-600 flex items-center gap-2">
              <Trash2 className="w-6 h-6" /> Delete Fest?
            </h2>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. This will permanently delete this
              fest from the database.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        draggable
        closeOnClick
      />
    </>
  );
}
