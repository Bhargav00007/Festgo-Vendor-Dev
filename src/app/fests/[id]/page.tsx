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

  useEffect(() => {
    const fetchFest = async () => {
      try {
        const vendorToken = localStorage.getItem("vendorToken");
        const res = await fetch(
          `https://server.festgo.in/api/beach-fests/${id}`,
          {
            headers: {
              Authorization: `Bearer ${vendorToken}`,
            },
          }
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

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      const vendorToken = localStorage.getItem("vendorToken");
      const res = await fetch(
        `https://server.festgo.in/api/beach-fests/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${vendorToken}`,
          },
        }
      );

      if (res.ok) {
        toast.success("Fest deleted successfully!");
        setTimeout(() => {
          router.push("/fests/list");
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
      <div className="max-w-5xl mx-auto p-4 space-y-6 mt-20">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => router.push("/fests/list")}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Fest List
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
                    Fest
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold text-gray-900">{fest.type}</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl shadow-lg border border-gray-100 p-1"
            >
              <DropdownMenuItem
                onClick={() => router.push(`/fests/edit/${id}`)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg"
              >
                <Pencil className="w-4 h-4 text-blue-500" /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-2 text-red-500 cursor-pointer hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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

        {/* Images */}
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

        {/* Google Maps Button */}
        {fest.gmap_url && (
          <div className="flex justify-start mt-20">
            <a
              href={fest.gmap_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition"
            >
              <ExternalLink className="w-5 h-5" />
              View on Google Maps
            </a>
          </div>
        )}

        {/* Coordinates */}
        <p className="text-sm text-gray-500">
          Latitude: {fest.latitude} | Longitude: {fest.longitude}
        </p>

        {/* Price */}
        <div className="bg-yellow-200 text-center py-4 rounded-full shadow text-xl font-bold">
          Entry Pass at ₹{fest.price_per_pass.toLocaleString()}/- onwards
        </div>

        {/* Available Passes */}
        <p className="text-center text-gray-600 text-sm">
          Available Passes: {fest.available_passes}
        </p>
      </div>

      {/* Custom Delete Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center">
          {/* Background Blur */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteDialogOpen(false)}
          ></div>

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-xl shadow-lg p-6 max-w-sm w-full z-10"
          >
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-2">Delete Fest?</h2>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete this
              fest from the database.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </>
  );
}
