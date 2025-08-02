"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type Property = {
  id: string;
  vendorId: string;
  name: string;
  email: string;
  mobile_number: string;
  landline_number: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  property_type: string;
  star_rating: number;
  description: string;
  property_built_date: string;
  accepting_bookings_since: string;
  is_completed: boolean;
  in_progress: boolean;
  photos: string[];
};

type Vendor = {
  id: string;
  username?: string;
  email?: string;
  number?: string;
  role?: string;
};

export default function VendorPropertyPage() {
  const params = useParams();
  const vendorId = params?.id as string;

  const [properties, setProperties] = useState<Property[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPropertyId, setUpdatingPropertyId] = useState<string | null>(
    null
  );

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM4NDc1MWEyLTI2ODEtNDVlMi1hMDkwLWQ4MzJkNjAyZmNhMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDA2MzE4NywiZXhwIjoxNzU0NDk1MTg3fQ.giQIgUmoWO6QEp5Gd9yrtmdnOp8xnKPW8Xh12Mz19uc";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vendor list
        const vendorRes = await fetch(
          "https://server.festgo.in/api/admin/vendors",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const vendorData = await vendorRes.json();
        const allVendors: Vendor[] = Array.isArray(vendorData)
          ? vendorData
          : vendorData.vendors || [];

        const foundVendor = allVendors.find((v) => v.id === vendorId);
        setVendor(foundVendor || null);

        // Fetch properties
        const propRes = await fetch(
          `https://server.festgo.in/api/admin/property/${vendorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const propData = await propRes.json();
        setProperties(propData?.properties || []);
      } catch (error) {
        console.error("Error fetching vendor details or properties:", error);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchData();
    }
  }, [vendorId]);

  const togglePropertyStatus = async (
    propertyId: string,
    currentStatus: boolean
  ) => {
    setUpdatingPropertyId(propertyId);

    const endpoint = currentStatus
      ? `https://server.festgo.in/api/admin/property/${propertyId}/deauthorize`
      : `https://server.festgo.in/api/admin/property/${propertyId}/authorize`;

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to toggle status");

      setProperties((prev) =>
        prev.map((prop) =>
          prop.id === propertyId
            ? { ...prop, is_completed: !currentStatus }
            : prop
        )
      );
    } catch (error) {
      console.error("Error toggling property status:", error);
    } finally {
      setUpdatingPropertyId(null);
    }
  };

  const imageIndex =
    vendorId && vendorId.length > 0
      ? ((vendorId.charCodeAt(0) + vendorId.length) % 12) + 1
      : 1;
  const profileSrc = `/profiles/user-${imageIndex}.jpg`;

  if (loading) return <div className="p-4">Loading vendor properties...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Vendor Info */}
      {vendor && (
        <div className="flex items-center gap-4 border border-gray-300 rounded-xl p-4 bg-white ">
          <Image
            src={profileSrc}
            alt="Vendor Profile"
            width={60}
            height={60}
            className="rounded-full object-cover border"
          />
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full">
            <div>
              <div className="text-xl font-semibold text-blue-700">
                {vendor.username?.trim() || "Username: n/a"}
              </div>
              <div className="text-sm text-gray-600">ID: {vendor.id}</div>
            </div>
            <div className="text-sm text-gray-500 mt-2 sm:mt-0 sm:text-right">
              <div>Email: {vendor.email || "n/a"}</div>
              <div>Number: {vendor.number || "n/a"}</div>
              <div>Role: {vendor.role || "n/a"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Property List */}
      <div className="space-y-6">
        {properties.length === 0 ? (
          <div className="text-gray-500 border border-gray-300 rounded-xl p-4 text-center">
            No properties found.
          </div>
        ) : (
          properties.map((prop) => (
            <div
              key={prop.id}
              className="border border-gray-300 rounded-2xl p-6  bg-white"
            >
              <p className="text-sm mb-2 text-gray-500">
                <strong>Property ID:</strong> {prop.id}
              </p>
              <h2 className="text-xl font-semibold mb-1">{prop.name}</h2>
              <p className="text-sm text-gray-600 mb-2">
                {prop.property_type} • {prop.star_rating}★
              </p>
              <p className="text-sm mb-1">
                <strong>City:</strong> {prop.city}, {prop.state}, {prop.country}{" "}
                - {prop.pincode}
              </p>
              <p className="text-sm mb-1">
                <strong>Mobile:</strong> {prop.mobile_number} |{" "}
                <strong>Landline:</strong> {prop.landline_number || "N/A"}
              </p>
              <p className="text-sm mb-1">
                <strong>Email:</strong> {prop.email}
              </p>
              <p className="text-sm mb-1">
                <strong>Built:</strong>{" "}
                {new Date(prop.property_built_date).getFullYear()} |{" "}
                <strong>Accepting Bookings Since:</strong>{" "}
                {new Date(prop.accepting_bookings_since).getFullYear()}
              </p>
              <p className="text-sm mb-2">
                <strong>Description:</strong> {prop.description}
              </p>
              <p className="text-sm mb-1">
                <strong>Status:</strong>{" "}
                {prop.is_completed ? "🟢 Active" : "🔴 Inactive"}
              </p>
              <div className="mt-4">
                <button
                  onClick={() =>
                    togglePropertyStatus(prop.id, prop.is_completed)
                  }
                  disabled={updatingPropertyId === prop.id}
                  className={`px-4 py-2 text-sm font-semibold rounded transition ${
                    prop.is_completed
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white ${
                    updatingPropertyId === prop.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {updatingPropertyId === prop.id
                    ? "Updating..."
                    : prop.is_completed
                    ? "Deactivate"
                    : "Activate"}
                </button>
              </div>

              {prop.photos && prop.photos.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Photos:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {prop.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-40 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
