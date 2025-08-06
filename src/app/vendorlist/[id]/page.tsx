"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BarLoader } from "react-spinners";
import { Icon } from "@iconify/react";

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
  imageURL?: string;
  location?: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string;
    pincode: string;
    locality: string;
  };
  cuisines?: string[];
  status?: number;
  current_step?: number;
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
  const router = useRouter();
  const vendorId = params?.id as string;

  const [properties, setProperties] = useState<Property[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPropertyId, setUpdatingPropertyId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const vendorRes = await fetch(
          "https://server.festgo.in/api/admin/vendors",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (vendorRes.status === 401 || vendorRes.status === 403) {
          localStorage.removeItem("vendorToken");
          router.push("/login");
          return;
        }

        const vendorData = await vendorRes.json();
        const allVendors: Vendor[] = Array.isArray(vendorData)
          ? vendorData
          : vendorData.vendors || [];

        const foundVendor = allVendors.find((v) => v.id === vendorId);
        setVendor(foundVendor || null);

        const propRes = await fetch(
          `https://server.festgo.in/api/admin/property/${vendorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (propRes.status === 401 || propRes.status === 403) {
          localStorage.removeItem("vendorToken");
          router.push("/login");
          return;
        }

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
  }, [vendorId, router]);

  const togglePropertyStatus = async (
    propertyId: string,
    currentStatus: boolean
  ) => {
    const token = localStorage.getItem("vendorToken");
    if (!token) return;

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

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <BarLoader color="#3B82F6" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => router.push('/vendorlist')}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Vendors
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Vendor Details</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Vendor Header Card */}
        {vendor && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-8 sm:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Image
                      src={profileSrc}
                      alt="Vendor Profile"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/profiles/default-user.jpg";
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {vendor.username?.trim() || "Unnamed Vendor"}
                    </h1>
                    <p className="text-sm text-gray-600 font-mono mt-1">ID: {vendor.id}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
                        </svg>
                        {vendor.role || "Vendor"}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        properties.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                        </svg>
                        {properties.length} Properties
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-0 grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {properties.filter(p => p.is_completed).length}
                    </div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {properties.filter(p => !p.is_completed).length}
                    </div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span className="text-sm text-gray-600">Email</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">{vendor.email || "Not provided"}</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-600">Phone</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">{vendor.number || "Not provided"}</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">Status</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Section */}
        <div className="space-y-6">
          {properties.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Properties Found</h3>
              <p className="mt-2 text-sm text-gray-500">
                This vendor hasn't created any properties yet. Properties will appear here once they're added.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Property Portfolio</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage and monitor all properties for this vendor
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      {properties.length} Properties
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type & Rating</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop, index) => (
                      <tr
                        key={prop.id}
                        className="hover:bg-gray-50 transition-all border-b border-gray-100"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                              {prop.photos && prop.photos.length > 0 ? (
                                <Image
                                  src={prop.photos[0]}
                                  alt={`${prop.name} thumbnail`}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-blue-600">
                                            <path d="M21.25 8V16C21.25 16.4142 20.9142 16.75 20.5 16.75H3.5C3.08579 16.75 2.75 16.4142 2.75 16V8C2.75 7.58579 3.08579 7.25 3.5 7.25H20.5C20.9142 7.25 21.25 7.58579 21.25 8Z" stroke="currentColor" stroke-width="1.5"/>
                                            <path d="M2.75 9.25L8.25 14.75L15.75 7.25L21.25 12.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                            <circle cx="16.5" cy="10.5" r="1" fill="currentColor"/>
                                          </svg>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                  <Icon icon="solar:home-2-bold" className="text-blue-600" width={24} />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 truncate max-w-40">
                                {prop.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {prop.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {prop.property_type}
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon icon="solar:star-bold" className="text-yellow-500" width={16} />
                              <span className="text-sm text-gray-600">{prop.star_rating} Star</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">{prop.location?.city || prop.city}</div>
                            <div className="text-sm text-gray-600">
                              {prop.location?.state || prop.state}, {prop.location?.country || prop.country}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">{prop.mobile_number}</div>
                            <div className="text-xs text-gray-600 truncate max-w-32">{prop.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            prop.is_completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {prop.is_completed ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${prop.status || 0}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-600">{prop.status || 0}% Complete</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/vendorlist/${vendorId}/property/${prop.id}`}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              <Icon icon="solar:eye-bold" width={14} className="mr-1" />
                              View Details
                            </Link>
                            <button
                              onClick={() => togglePropertyStatus(prop.id, prop.is_completed)}
                              disabled={updatingPropertyId === prop.id}
                              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                prop.is_completed
                                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                                  : "text-green-600 bg-green-50 hover:bg-green-100"
                              } ${
                                updatingPropertyId === prop.id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {updatingPropertyId === prop.id ? (
                                <Icon icon="eos-icons:loading" width={14} className="mr-1" />
                              ) : (
                                <Icon 
                                  icon={prop.is_completed ? "solar:close-circle-bold" : "solar:check-circle-bold"} 
                                  width={14} 
                                  className="mr-1" 
                                />
                              )}
                              {updatingPropertyId === prop.id
                                ? "Updating..."
                                : prop.is_completed
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden">
                <div className="space-y-4 p-6">
                  {properties.map((prop) => (
                    <div key={prop.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          {prop.photos && prop.photos.length > 0 ? (
                            <Image
                              src={prop.photos[0]}
                              alt={`${prop.name} thumbnail`}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-blue-600">
                                        <path d="M21.25 8V16C21.25 16.4142 20.9142 16.75 20.5 16.75H3.5C3.08579 16.75 2.75 16.4142 2.75 16V8C2.75 7.58579 3.08579 7.25 3.5 7.25H20.5C20.9142 7.25 21.25 7.58579 21.25 8Z" stroke="currentColor" stroke-width="1.5"/>
                                        <path d="M2.75 9.25L8.25 14.75L15.75 7.25L21.25 12.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <circle cx="16.5" cy="10.5" r="1" fill="currentColor"/>
                                      </svg>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                              <Icon icon="solar:home-2-bold" className="text-blue-600" width={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{prop.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {prop.property_type} • {prop.star_rating}★ • {prop.location?.city || prop.city}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              prop.is_completed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {prop.is_completed ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">{prop.status || 0}% Complete</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Link 
                              href={`/vendorlist/${vendorId}/property/${prop.id}`}
                              className="flex-1 text-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => togglePropertyStatus(prop.id, prop.is_completed)}
                              disabled={updatingPropertyId === prop.id}
                              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                                prop.is_completed
                                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                                  : "text-green-600 bg-green-50 hover:bg-green-100"
                              } ${
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
