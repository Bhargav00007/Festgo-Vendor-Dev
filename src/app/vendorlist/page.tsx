"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";
import { fetchVendorsWithProperties, Vendor } from "../lib/vendorproperties";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VendorListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "properties">("name");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const router = useRouter();

  // Commission state
  const [commission, setCommission] = useState<number | null>(null);
  const [loadingCommission, setLoadingCommission] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [newCommission, setNewCommission] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchVendorsWithProperties(token)
      .then((vendors) => setVendors(vendors))
      .catch((err) => {
        // Optionally handle auth errors, etc.
        localStorage.removeItem("vendorToken");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Fetch current commission
  const fetchCommission = async () => {
    try {
      const token = localStorage.getItem("vendorToken");
      if (!token) return;
      setLoadingCommission(true);
      const res = await fetch("https://server.festgo.in/api/admin/commission", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch commission");
      const json = await res.json();
      const value = json?.data?.commission;
      setCommission(typeof value === "number" ? value : null);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load commission");
    } finally {
      setLoadingCommission(false);
    }
  };

  // Update commission
  const updateCommission = async () => {
    try {
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        toast.error("Unauthorized");
        return;
      }
      const parsed = parseFloat(newCommission);
      if (Number.isNaN(parsed) || parsed < 0) {
        toast.error("Enter a valid commission value");
        return;
      }
      const res = await fetch("https://server.festgo.in/api/admin/commission", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commission: parsed }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Failed to update");
      }
      const updated = json?.data?.commission;
      setCommission(typeof updated === "number" ? updated : parsed);
      setShowCommissionModal(false);
      toast.success(json?.message || "Commission updated");
    } catch (err) {
      console.error("Update commission error:", err);
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  // fetch commission on mount
  useEffect(() => {
    fetchCommission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = vendors.filter(
      (vendor) =>
        vendor.username?.toLowerCase().includes(value.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(value.toLowerCase()) ||
        vendor.number?.includes(value)
    );
    setFilteredVendors(filtered);
  };

  const handleSort = (type: "name" | "properties") => {
    setSortBy(type);
    const sorted = [...filteredVendors].sort((a, b) => {
      if (type === "name") {
        return (a.username || "").localeCompare(b.username || "");
      } else {
        return (b.propertyCount || 0) - (a.propertyCount || 0);
      }
    });
    setFilteredVendors(sorted);
    setShowSortMenu(false);
  };

  useEffect(() => {
    setFilteredVendors(vendors);
  }, [vendors]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BarLoader color="#3b82f6" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 mt-20">
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Vendor Management
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage and monitor vendor accounts and their properties
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {vendors.length} Active Vendors
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Vendors
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  With Properties
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter((v) => (v.propertyCount ?? 0) > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-100">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Pending Setup
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter((v) => (v.propertyCount ?? 0) === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Card (new) */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          {/* keep the three existing cards shown above in their grid cells; the commission card occupies one cell below them */}
          {/* ...existing three stat cards are unchanged and rendered above; this is the new commission cell */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2v6h6v-6c0-1.105-1.343-2-3-2zM6 10V8a6 6 0 0112 0v2"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Commission Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingCommission ? (
                      <span className="inline-flex items-center gap-2">
                        <BarLoader color="#7c3aed" width={60} />
                      </span>
                    ) : commission !== null ? (
                      `${commission}%`
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    setNewCommission(
                      commission !== null ? String(commission) : ""
                    );
                    setShowCommissionModal(true);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Vendor Directory
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete list of all registered vendors
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {/* Search Box */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Sort Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                      />
                    </svg>
                    <span>Sort</span>
                  </button>

                  {/* Sort Menu */}
                  {showSortMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-500">
                      <div className="py-1">
                        <button
                          onClick={() => handleSort("name")}
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            sortBy === "name"
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Sort by Name
                        </button>
                        <button
                          onClick={() => handleSort("properties")}
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            sortBy === "properties"
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Sort by Properties
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor, index) => {
                  const imageIndex = (index % 12) + 1;
                  const profileSrc = `/profiles/user-${imageIndex}.jpg`;

                  return (
                    <tr
                      key={vendor.id}
                      className="hover:bg-gray-50 transition-all duration-150 cursor-pointer border-b border-gray-100"
                      onClick={() => router.push(`/vendorlist/${vendor.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <Image
                              src={profileSrc}
                              alt="Profile"
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/profiles/default-user.jpg";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {vendor.username?.trim() || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {vendor.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vendor.email || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vendor.number || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {vendor.role || "vendor"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-base text-gray-800 font-mono">
                            {vendor.propertyCount ?? 0}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            {vendor.propertyCount === 1
                              ? "Property"
                              : "Properties"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/vendorlist/${vendor.id}`);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          View Details
                          <svg
                            className="ml-1 -mr-0.5 h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tablet View */}
          <div className="hidden md:block lg:hidden">
            <div className="grid gap-4 p-6">
              {filteredVendors.map((vendor, index) => {
                const imageIndex = (index % 12) + 1;
                const profileSrc = `/profiles/user-${imageIndex}.jpg`;

                return (
                  <div
                    key={vendor.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-100"
                    onClick={() => router.push(`/vendorlist/${vendor.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={profileSrc}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/profiles/default-user.jpg";
                          }}
                        />
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {vendor.username?.trim() || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {vendor.email || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {vendor.role || "vendor"}
                        </span>
                        <div className="mt-1 text-xs text-gray-700">
                          {(vendor.propertyCount ?? 0) + " "}
                          {vendor.propertyCount === 1
                            ? "Property"
                            : "Properties"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <div className="space-y-3 p-4">
              {filteredVendors.map((vendor, index) => {
                const imageIndex = (index % 12) + 1;
                const profileSrc = `/profiles/user-${imageIndex}.jpg`;

                return (
                  <div
                    key={vendor.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-100"
                    onClick={() => router.push(`/vendorlist/${vendor.id}`)}
                  >
                    <div className="flex items-start space-x-4">
                      <Image
                        src={profileSrc}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/profiles/default-user.jpg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {vendor.username?.trim() || "N/A"}
                        </h3>
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-gray-600">
                            {vendor.email || "N/A"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {vendor.number || "N/A"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {vendor.role || "vendor"}
                            </span>
                            <span className="text-xs text-gray-700 font-mono">
                              {(vendor.propertyCount ?? 0) +
                                " " +
                                (vendor.propertyCount === 1
                                  ? "Property"
                                  : "Properties")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Commission Modal */}
      {showCommissionModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-500"
          onClick={() => setShowCommissionModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-96 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3">Update Commission</h3>
            <label className="text-sm text-gray-600">Commission (%)</label>
            <input
              type="number"
              min="0"
              className="w-full mt-2 p-2 border rounded"
              value={newCommission}
              onChange={(e) => setNewCommission(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCommissionModal(false)}
                className="px-4 py-2 rounded text-gray-700 border"
              >
                Cancel
              </button>
              <button
                onClick={updateCommission}
                className="px-4 py-2 rounded bg-purple-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
