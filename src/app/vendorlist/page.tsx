"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const fetchVendorsWithProperties = async (token: string) => {
    try {
      const res = await fetch("https://server.festgo.in/api/admin/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("vendorToken");
        router.push("/login");
        return;
      }

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

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchVendorsWithProperties(token);
  }, [router]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BarLoader color="#3b82f6" />
      </div>
    );

  return (
    <div className="max-w-7xl px-4 py-6 mx-auto">
      <div className="border border-gray-300 rounded-2xl bg-white p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Vendors</h1>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-3">No.</th>
                <th className="p-3">Profile</th>
                <th className="p-3">Email</th>
                <th className="p-3">Number</th>
                <th className="p-3">Role</th>
                <th className="p-3">Property ID</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, index) => {
                const imageIndex = (index % 12) + 1;
                const profileSrc = `/profiles/user-${imageIndex}.jpg`;
                const propertyId = vendor.property?.id || "N/A";

                return (
                  <tr
                    key={vendor.id}
                    className="hover:bg-gray-50 transition-all cursor-pointer"
                    onClick={() => router.push(`/vendorlist/${vendor.id}`)}
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 flex items-center gap-3">
                      <Image
                        src={profileSrc}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full border object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/profiles/default-user.jpg";
                        }}
                      />
                      <div>
                        <div className="font-medium text-black">
                          {vendor.username?.trim() || "Username: n/a"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {vendor.id}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{vendor.email || "n/a"}</td>
                    <td className="p-3">{vendor.number || "n/a"}</td>
                    <td className="p-3">{vendor.role || "n/a"}</td>
                    <td className="p-3">{propertyId}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden">
          {vendors.map((vendor, index) => {
            const imageIndex = (index % 12) + 1;
            const profileSrc = `/profiles/user-${imageIndex}.jpg`;
            const propertyId = vendor.property?.id || "N/A";

            return (
              <React.Fragment key={vendor.id}>
                <Link href={`/vendorlist/${vendor.id}`}>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src={profileSrc}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full border object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/profiles/default-user.jpg";
                        }}
                      />
                      <div>
                        <div className="font-medium text-black">
                          {vendor.username?.trim() || "Username: n/a"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {vendor.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>Email: {vendor.email || "n/a"}</div>
                      <div>Number: {vendor.number || "n/a"}</div>
                      <div>Role: {vendor.role || "n/a"}</div>
                      <div>Property ID: {propertyId}</div>
                    </div>
                  </div>
                </Link>
                <hr className="border-gray-200" />
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
