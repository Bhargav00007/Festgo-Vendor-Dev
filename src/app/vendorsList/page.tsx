"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BarLoader } from "react-spinners";

type Vendor = {
  id: string;
  username?: string;
  email?: string;
  number?: string;
  role?: string;
  property?: {
    id: string;
  } | null;
};

export default function VendorListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM4NDc1MWEyLTI2ODEtNDVlMi1hMDkwLWQ4MzJkNjAyZmNhMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDA2MzE4NywiZXhwIjoxNzU0NDk1MTg3fQ.giQIgUmoWO6QEp5Gd9yrtmdnOp8xnKPW8Xh12Mz19uc";

  useEffect(() => {
    const fetchVendorsWithProperties = async () => {
      try {
        const res = await fetch("https://server.festgo.in/api/admin/vendors", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const vendorList: Vendor[] = Array.isArray(data)
          ? data
          : data.vendors || [];

        const vendorsWithProps = await Promise.all(
          vendorList.map(async (vendor) => {
            try {
              const propRes = await fetch(
                `https://server.festgo.in/api/admin/property/${vendor.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              const propData = await propRes.json();
              const property =
                Array.isArray(propData?.properties) && propData.properties[0]
                  ? propData.properties[0]
                  : null;

              return {
                ...vendor,
                property: property ? { id: property.id } : null,
              };
            } catch {
              return { ...vendor, property: null };
            }
          })
        );

        setVendors(vendorsWithProps);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorsWithProperties();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BarLoader color="#3b82f6" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="border border-gray-300 rounded-2xl bg-white p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Vendors</h1>

        <div className="border border-gray-200 rounded-xl">
          {vendors.length === 0 ? (
            <p className="text-gray-600 p-4">No vendors found.</p>
          ) : (
            vendors.map((vendor, index) => {
              const propertyId = vendor.property?.id;
              const imageIndex = (index % 12) + 1;
              const profileSrc = `/profiles/user-${imageIndex}.jpg`;

              return (
                <React.Fragment key={vendor.id}>
                  <Link href={`/vendorsList/${vendor.id}`}>
                    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-all cursor-pointer">
                      <Image
                        src={profileSrc}
                        alt="User Profile"
                        width={50}
                        height={50}
                        className="rounded-full border object-cover"
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                        <div>
                          <div className="text-lg font-semibold text-black">
                            {vendor.username?.trim()
                              ? vendor.username
                              : "Username: n/a"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Vendor ID: {vendor.id}
                          </div>
                          <div className="text-sm text-gray-600">
                            Property ID: {propertyId || "N/A"}
                          </div>
                        </div>
                        <div className="hidden sm:block text-sm text-gray-500 mt-2 sm:mt-0 sm:text-right">
                          <div>Email: {vendor.email || "n/a"}</div>
                          <div>Number: {vendor.number || "n/a"}</div>
                          <div>Role: {vendor.role || "n/a"}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <hr className="border-gray-200" />
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
