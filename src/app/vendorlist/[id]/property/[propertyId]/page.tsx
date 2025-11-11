/*eslint-disable @typescript-eslint/no-explicit-any*/
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BarLoader } from "react-spinners";
import { Icon } from "@iconify/react";
import PropertyImageGallery from "@/app/components/PropertyGallery";
import PaymentManagement from "@/app/components/PropertyPayment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type SelectedAttribute = {
  id: number;
  name: string;
  value?: string | string[] | null;
};

type Amenity = {
  value: string | string[] | null;
  category: string;
  amenity_id: number;
  is_selected: string;
  amenity_name: string;
  selected_attributes: SelectedAttribute[];
  selected_sub_attributes: {
    main_attribute: number | null;
    sub_attribute_1?: string | null;
    sub_attribute_2?: string | null;
    checkbox_attributes: number[];
  };
};

type Room = {
  id: string;
  propertyId: string;
  room_type: string;
  view: string;
  area: string;
  room_name: string;
  number_of_rooms: number;
  description: string;
  sleeping_arrangement: {
    beds: Array<{
      icon: string;
      bedType: string;
      quantity: string | number;
    }>;
    max_adults: string;
    base_adults: string;
    max_children: string;
    max_occupancy: string;
    max_extra_beds: string;
  };
  bathroom_available: number;
  price: {
    child_charge: number;
    extra_adult_charge: string;
    base_price_for_2_adults: string;
  };
  max_adults: number;
  max_children: number;
  meal_plan: string;
  room_amenities: Array<{
    amenity_id: number;
    amenity_name: string;
    category: string;
    is_selected: string;
    value?: string | string[] | null;
    selected_attributes?: SelectedAttribute[];
    selected_sub_attributes?: {
      main_attribute?: number | null;
      sub_attribute_1?: string | null;
      sub_attribute_2?: string | null;
      checkbox_attributes?: number[];
    };
  }>;
  photos: string[];
  videos: string[];
};

type Property = {
  id: string;
  vendorId: string;
  cuisines: string[];
  name: string;
  property_type: string;
  email: string;
  star_rating: number;
  property_built_date: string;
  accepting_bookings_since: string;
  mobile_number: string;
  landline_number: string;
  channelManagerName: string;
  sameAsWhatsapp: boolean;
  channelManager: boolean;
  current_step: number;
  description: string;
  status: number;
  in_progress: boolean;
  is_completed: boolean;
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string;
    pincode: string;
    locality: string;
    houseNumber: string;
    searchLocation: string;
  };
  amenities: Amenity[];
  policies: {
    petPolicy: string;
    houseRules: string[];
    quietHours: {
      enabled: boolean;
      endTime: string;
      startTime: string;
      description: string;
    };
    checkInTime: string;
    childPolicy: string;
    cleaningFee: number;
    customRules: string[];
    eventPolicy: string;
    maximumStay: number;
    minimumStay: number;
    checkOutTime: string;
    damagePolicy: {
      amount: number;
      refundPolicy: string;
      securityDepositRequired: boolean;
    };
    smokingPolicy: string;
    ageRestriction: {
      enabled: boolean;
      exceptions: string;
      minimumAge: number;
    };
    instantBooking: boolean;
    securityDeposit: number;
    guestVerification: {
      references: boolean;
      governmentId: boolean;
      profilePhoto: boolean;
      emailVerification: boolean;
      phoneVerification: boolean;
    };
    accessInstructions: {
      keyLocation: string;
      selfCheckIn: boolean;
      specialInstructions: string;
    };
    additionalGuestFee: number;
    advanceBookingDays: number;
    cancellationPolicy: string;
  };
  active: boolean;
  photos: string[];
  videos: string[];
  rooms: Room[];
  createdAt: string;
  updatedAt: string;
  // new optional field to store step-wise form data for edits
  strdata?: any;
};

type Vendor = {
  id: string;
  username?: string;
  email?: string;
  number?: string;
  role?: string;
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params?.id as string;
  const propertyId = params?.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Property | null>(null);
  const [savingChanges, setSavingChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch vendor details
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

        // Fetch property details
        const propRes = await fetch(
          `https://server.festgo.in/api/admin/property/${vendorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (propRes.status === 401 || propRes.status === 403) {
          localStorage.removeItem("vendorToken");
          router.push("/login");
          return;
        }

        const propData = await propRes.json();
        const properties = propData?.properties || [];
        const foundProperty = properties.find(
          (p: Property) => p.id === propertyId
        );
        setProperty(foundProperty || null);
      } catch (error) {
        console.error("Error fetching property details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId && propertyId) {
      fetchData();
    }
  }, [vendorId, propertyId, router]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAmenitiesByCategory = (category: string) => {
    return (
      property?.amenities.filter(
        (amenity) =>
          amenity.category === category && amenity.is_selected === "true"
      ) || []
    );
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: "solar:home-2-bold-duotone",
      description: "Basic property information",
    },
    {
      id: "amenities",
      label: "Amenities",
      icon: "solar:widget-bold-duotone",
      description: "Property features and services",
    },
    {
      id: "rooms",
      label: "Rooms",
      icon: "solar:bed-bold-duotone",
      description: "Room types and configurations",
    },
    {
      id: "policies",
      label: "Policies",
      icon: "solar:document-text-bold-duotone",
      description: "Rules and regulations",
    },
    {
      id: "location",
      label: "Location",
      icon: "solar:map-point-bold-duotone",
      description: "Address and coordinates",
    },
    {
      id: "payments",
      label: "Payments",
      icon: "solar:card-bold-duotone",
      description: "Payment management",
    },
  ];

  const handleEditClick = () => {
    setEditedProperty({ ...property! });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProperty(null);
  };

  // helper to ensure strdata shape exists
  const ensureStrdata = (p: Property) => {
    if (!p.strdata) {
      p.strdata = {
        step_1: {},
        step_2: {},
        step_3: { amenities: [] },
        step_4: { rooms: [] },
        step_5: {},
        step_6: {},
        step_7: {},
      };
    }
    return p.strdata;
  };

  const handlePropertyChange = (field: keyof Property, value: any) => {
    if (!editedProperty) return;
    const updated: Property = { ...editedProperty, [field]: value } as Property;

    // sync to strdata.step_1 for core fields
    const sd = ensureStrdata(updated);
    try {
      if (field === "name") sd.step_1.propertyName = value || "";
      if (field === "email") sd.step_1.email = value || "";
      if (field === "mobile_number") sd.step_1.mobileNumber = value || "";
      if (field === "property_built_date") {
        const year = value ? new Date(value).getFullYear() : "";
        sd.step_1.builtYear = year ? String(year) : "";
      }
      if (field === "star_rating")
        sd.step_1.hotelStarRating = String(value || "");
      if (field === "accepting_bookings_since") {
        const year = value ? new Date(value).getFullYear() : "";
        sd.step_1.acceptingBookingSince = year ? String(year) : "";
      }
      if (field === "cuisines")
        sd.step_1.cuisines = Array.isArray(value)
          ? value
          : String(value || "")
              .split(",")
              .map((s: any) => s.trim())
              .filter(Boolean);
      // attach back
      updated.strdata = sd;
    } catch (err) {
      // non-blocking
      console.error("sync strdata step_1 error", err);
    }

    setEditedProperty(updated);
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    if (!editedProperty) return;
    const sectionObj = { ...((editedProperty as any)[section] || {}) };
    sectionObj[field] = value;
    const updated: any = { ...editedProperty, [section]: sectionObj };

    // sync to strdata for location (step_2) and policies (step_6)
    const sd = ensureStrdata(updated as Property);
    try {
      if (section === "location") {
        if (field === "city") sd.step_2.city = value || "";
        if (field === "state") sd.step_2.state = value || "";
        if (field === "country") sd.step_2.country = value || "";
        if (field === "pincode") sd.step_2.pincode = value || "";
        if (field === "locality") sd.step_2.locality = value || "";
        if (field === "houseNumber") sd.step_2.houseNumber = value || "";
        if (field === "lat" || field === "lng") {
          sd.step_2.mapLocation = sd.step_2.mapLocation || {};
          sd.step_2.mapLocation[field] = value;
        }
      }
      if (section === "policies") {
        // common mappings
        if (
          [
            "checkInTime",
            "checkOutTime",
            "minimumStay",
            "maximumStay",
            "cleaningFee",
            "additionalGuestFee",
            "securityDeposit",
          ].includes(field)
        ) {
          sd.step_6[field] = value;
        }
        if (field === "damagePolicy") {
          sd.step_6.damagePolicy = {
            ...(sd.step_6.damagePolicy || {}),
            ...value,
          };
        }
      }
      updated.strdata = sd;
    } catch (err) {
      console.error("sync strdata nested error", err);
    }

    setEditedProperty(updated as Property);
  };

  const handleSaveChanges = async () => {
    if (!editedProperty) return;
    try {
      setSavingChanges(true);
      const token = localStorage.getItem("vendorToken");

      // ensure strdata present
      const payload = { ...editedProperty } as any;
      payload.strdata = ensureStrdata(payload);

      const response = await fetch(
        `https://server.festgo.in/api/admin/property/${propertyId}/edit`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.message || "Failed to save changes");
      }

      // update local state with returned data if available, otherwise use editedProperty
      const updatedPropertyFromServer = json?.data || json;
      // merge strdata if server didn't return it
      const finalProperty = {
        ...editedProperty,
        ...(typeof updatedPropertyFromServer === "object"
          ? updatedPropertyFromServer
          : {}),
      } as Property;
      if (!finalProperty.strdata) finalProperty.strdata = payload.strdata;

      setProperty(finalProperty);
      setIsEditing(false);
      setEditedProperty(null);
      toast.success(json?.message || "Property updated successfully!");
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save changes"
      );
    } finally {
      setSavingChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <BarLoader color="#3B82F6" />
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <Icon
            icon="solar:home-cross-bold"
            width={64}
            className="mx-auto text-gray-400 mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Property Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The property you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href={`/vendorlist/${vendorId}`}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            <Icon icon="solar:arrow-left-bold" width={16} className="mr-2" />
            Back to Vendor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 mt-20">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Enhanced Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <button
                    onClick={() => router.push("/vendorlist")}
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    Vendors
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
                    <button
                      onClick={() => router.push(`/vendorlist/${vendorId}`)}
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 transition-colors"
                    >
                      {vendor?.username || "Vendor"}
                    </button>
                  </div>
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
                      Property Details
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Property Header Card with Edit Button - IMPROVED PLACEMENT */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex flex-col gap-6">
              {/* Top Row: Title and Edit Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Icon
                      icon="solar:home-2-bold"
                      className="text-white"
                      width={32}
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProperty?.name || ""}
                          onChange={(e) =>
                            handlePropertyChange("name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        property?.name
                      )}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Icon
                          icon="solar:star-bold"
                          className="text-yellow-500"
                          width={20}
                        />
                        <span className="font-semibold text-gray-900">
                          {property?.star_rating}
                        </span>
                        <span className="text-gray-600">
                          Star {property?.property_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon
                          icon="solar:map-point-bold"
                          className="text-gray-400"
                          width={16}
                        />
                        <span className="text-gray-600">
                          {property?.location.city}, {property?.location.state}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit/Cancel/Save Buttons - TOP RIGHT CORNER */}
                <div className="hidden md:flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={handleEditClick}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-md"
                      title="Edit property details"
                    >
                      <Icon icon="solar:pen-bold" width={18} />
                      <span className="font-medium">Edit</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2.5 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 flex items-center gap-2 transition-colors shadow-md"
                        title="Cancel editing"
                      >
                        <Icon icon="solar:close-circle-bold" width={18} />
                        <span className="font-medium">Cancel</span>
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        disabled={savingChanges}
                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center gap-2 transition-colors shadow-md"
                        title="Save changes to property"
                      >
                        <Icon icon="solar:check-circle-bold" width={18} />
                        <span className="font-medium">
                          {savingChanges ? "Saving..." : "Save"}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    property?.is_completed
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  <Icon
                    icon={
                      property?.is_completed
                        ? "solar:check-circle-bold"
                        : "solar:close-circle-bold"
                    }
                    width={16}
                    className="mr-1.5"
                  />
                  {property?.is_completed ? "Active" : "Inactive"}
                </span>

                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <Icon icon="solar:chart-bold" width={16} className="mr-1.5" />
                  {property.status}% Complete
                </span>

                {property.channelManager && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    <Icon
                      icon="solar:settings-bold"
                      width={16}
                      className="mr-1.5"
                    />
                    {property.channelManagerName}
                  </span>
                )}

                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <Icon icon="solar:bed-bold" width={16} className="mr-1.5" />
                  {property.rooms?.length || 0} Room Types
                </span>
              </div>
              {/* Mobile: place edit controls under the title */}
              <div className="md:hidden">
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg mb-2 flex items-center justify-center "
                  >
                    <Icon icon="solar:pen-bold" width={22} />{" "}
                    <span className="ml-2">Edit vendor Propety</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2.5 bg-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={savingChanges}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg"
                    >
                      {savingChanges ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            <nav className="flex space-x-8 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center gap-3 py-4 px-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                    }`}
                  >
                    <Icon icon={tab.icon} width={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-xs text-gray-500">
                      {tab.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon
                    icon="solar:info-circle-bold-duotone"
                    className="text-blue-600"
                    width={24}
                  />
                  Property Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property Type */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Property Type
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProperty?.property_type || ""}
                        onChange={(e) =>
                          handlePropertyChange("property_type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 capitalize font-medium">
                        {property?.property_type}
                      </p>
                    )}
                  </div>

                  {/* Star Rating */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Star Rating
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editedProperty?.star_rating || ""}
                        onChange={(e) =>
                          handlePropertyChange(
                            "star_rating",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {property?.star_rating} Stars
                      </p>
                    )}
                  </div>

                  {/* Built Date */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Built Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={
                          editedProperty?.property_built_date
                            ? new Date(editedProperty.property_built_date)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handlePropertyChange(
                            "property_built_date",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {formatDate(property?.property_built_date)}
                      </p>
                    )}
                  </div>

                  {/* Accepting Bookings Since */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Accepting Bookings Since
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={
                          editedProperty?.accepting_bookings_since
                            ? new Date(editedProperty.accepting_bookings_since)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handlePropertyChange(
                            "accepting_bookings_since",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {formatDate(property?.accepting_bookings_since)}
                      </p>
                    )}
                  </div>

                  {/* Cuisines */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Cuisines
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProperty?.cuisines?.join(", ") || ""}
                        onChange={(e) =>
                          handlePropertyChange(
                            "cuisines",
                            e.target.value.split(",").map((c) => c.trim())
                          )
                        }
                        placeholder="Enter cuisines separated by commas"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 capitalize font-medium">
                        {property?.cuisines?.join(", ") || "Not specified"}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Same as Mobile */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      WhatsApp Same as Mobile
                    </label>
                    {isEditing ? (
                      <select
                        value={editedProperty?.sameAsWhatsapp ? "yes" : "no"}
                        onChange={(e) =>
                          handlePropertyChange(
                            "sameAsWhatsapp",
                            e.target.value === "yes"
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {property?.sameAsWhatsapp ? "Yes" : "No"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon
                    icon="solar:document-text-bold-duotone"
                    className="text-green-600"
                    width={24}
                  />
                  Description
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedProperty?.description || ""}
                    onChange={(e) =>
                      handlePropertyChange("description", e.target.value)
                    }
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {property?.description}
                  </p>
                )}
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon
                    icon="solar:phone-bold-duotone"
                    className="text-indigo-600"
                    width={24}
                  />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mobile */}
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      isEditing
                        ? "bg-white border-gray-300"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isEditing ? "bg-gray-100" : "bg-green-100"
                      }`}
                    >
                      <Icon
                        icon="solar:phone-bold"
                        className={
                          isEditing ? "text-gray-600" : "text-green-600"
                        }
                        width={24}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500">
                        Mobile
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedProperty?.mobile_number || ""}
                          onChange={(e) =>
                            handlePropertyChange(
                              "mobile_number",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 font-semibold">
                          {property?.mobile_number}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Landline */}
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      isEditing
                        ? "bg-white border-gray-300"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isEditing ? "bg-gray-100" : "bg-blue-100"
                      }`}
                    >
                      <Icon
                        icon="solar:phone-bold"
                        className={
                          isEditing ? "text-gray-600" : "text-blue-600"
                        }
                        width={24}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500">
                        Landline
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedProperty?.landline_number || ""}
                          onChange={(e) =>
                            handlePropertyChange(
                              "landline_number",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 font-semibold">
                          {property?.landline_number || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border md:col-span-2 ${
                      isEditing
                        ? "bg-white border-gray-300"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isEditing ? "bg-gray-100" : "bg-red-100"
                      }`}
                    >
                      <Icon
                        icon="solar:letter-bold"
                        className={isEditing ? "text-gray-600" : "text-red-600"}
                        width={24}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedProperty?.email || ""}
                          onChange={(e) =>
                            handlePropertyChange("email", e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 font-semibold">
                          {property?.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Photos Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon
                    icon="solar:gallery-bold-duotone"
                    className="text-purple-600"
                    width={24}
                  />
                  Property Photos
                </h3>
                <PropertyImageGallery
                  vendorId={vendorId}
                  propertyId={propertyId}
                />
              </div>
            </div>

            {/* Sidebar - Quick Stats and Vendor Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon
                    icon="solar:chart-bold-duotone"
                    className="text-purple-600"
                    width={24}
                  />
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Completion Status
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${property.status}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {property.status}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Active Status
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        property.is_completed
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {property.is_completed ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      In Progress
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        property.in_progress
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {property.in_progress ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {vendor && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Icon
                      icon="solar:user-bold-duotone"
                      className="text-orange-600"
                      width={24}
                    />
                    Vendor Information
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">
                        Name
                      </label>
                      <p className="text-gray-900 font-medium">
                        {vendor.username || "Not provided"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-gray-900 font-medium">
                        {vendor.email || "Not provided"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <p className="text-gray-900 font-medium">
                        {vendor.number || "Not provided"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">
                        Role
                      </label>
                      <p className="text-gray-900 font-medium">
                        {vendor.role || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "amenities" && (
          <div className="space-y-8">
            {[
              "Mandatory",
              "Basic Facilities",
              "General Services",
              "Food and Drink",
              "Entertainment",
              "Health and wellness",
            ].map((category) => {
              const categoryAmenities = getAmenitiesByCategory(category);
              if (categoryAmenities.length === 0) return null;

              return (
                <div
                  key={category}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Icon
                      icon="solar:widget-bold-duotone"
                      className="text-blue-600"
                      width={24}
                    />
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryAmenities.map((amenity) => (
                      <div
                        key={amenity.amenity_id}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200"
                      >
                        <Icon
                          icon="solar:check-circle-bold"
                          className="text-green-600"
                          width={20}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {amenity.amenity_name}
                          </p>
                          {amenity.value &&
                            typeof amenity.value === "string" && (
                              <p className="text-sm text-gray-600">
                                {amenity.value}
                              </p>
                            )}
                          {amenity.value && Array.isArray(amenity.value) && (
                            <p className="text-sm text-gray-600">
                              {amenity.value.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="space-y-6">
            {property.rooms && property.rooms.length > 0 ? (
              property.rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                          <Icon
                            icon="solar:bed-bold"
                            className="text-white"
                            width={28}
                          />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900">
                            {room.room_name}
                          </h4>
                          <p className="text-gray-600 capitalize font-medium">
                            {room.room_type} Room • {room.view} View
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">
                            Area
                          </label>
                          <p className="text-gray-900 font-semibold">
                            {room.area}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">
                            Number of Rooms
                          </label>
                          <p className="text-gray-900 font-semibold">
                            {room.number_of_rooms}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">
                            Max Adults
                          </label>
                          <p className="text-gray-900 font-semibold">
                            {room.max_adults}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">
                            Max Children
                          </label>
                          <p className="text-gray-900 font-semibold">
                            {room.max_children}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">
                            Bathrooms
                          </label>
                          <p className="text-gray-900 font-semibold">
                            {room.bathroom_available}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">
                            Meal Plan
                          </label>
                          <p className="text-gray-900 capitalize font-semibold">
                            {room.meal_plan.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">
                          Sleeping Arrangement
                        </h5>
                        <div className="flex flex-wrap gap-3">
                          {room.sleeping_arrangement?.beds?.map(
                            (bed, bedIndex) => (
                              <div
                                key={bedIndex}
                                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                              >
                                <span className="text-2xl">{bed.icon}</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {bed.quantity} {bed.bedType} bed
                                  {typeof bed.quantity === "number" &&
                                  bed.quantity > 1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">
                          Description
                        </h5>
                        <p className="text-gray-700 leading-relaxed">
                          {room.description}
                        </p>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-4">
                          Room Amenities
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {room.room_amenities
                            ?.filter(
                              (amenity) => amenity.is_selected === "true"
                            )
                            .map((amenity) => (
                              <div
                                key={amenity.amenity_id}
                                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                              >
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="text-green-600"
                                  width={16}
                                />
                                <span className="text-sm font-medium text-gray-900">
                                  {amenity.amenity_name}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Room Photos */}
                      {room.photos && room.photos.length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-lg font-semibold text-gray-900 mb-4">
                            Room Photos ({room.photos.length})
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {room.photos
                              .slice(0, 6)
                              .map((photo, photoIndex) => (
                                <div
                                  key={photoIndex}
                                  className="relative group"
                                >
                                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md"></div>
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Icon
                                        icon="solar:eye-bold"
                                        className="text-white"
                                        width={20}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {room.photos.length > 6 && (
                              <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <div className="text-center">
                                  <Icon
                                    icon="solar:gallery-bold"
                                    className="text-gray-400 mx-auto mb-1"
                                    width={20}
                                  />
                                  <p className="text-xs text-gray-500">
                                    +{room.photos.length - 6} more
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:w-80">
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Icon
                            icon="solar:dollar-bold-duotone"
                            className="text-green-600"
                            width={20}
                          />
                          Pricing
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span className="text-gray-600">
                              Base Rate (2 Adults)
                            </span>
                            <span className="font-bold text-lg text-green-600">
                              ₹{room.price?.base_price_for_2_adults}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span className="text-gray-600">Extra Adult</span>
                            <span className="font-semibold text-gray-900">
                              ₹{room.price?.extra_adult_charge}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span className="text-gray-600">Child Charge</span>
                            <span className="font-semibold text-gray-900">
                              ₹{room.price?.child_charge}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Icon
                  icon="solar:bed-cross-bold"
                  width={64}
                  className="mx-auto text-gray-400 mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Rooms Configured
                </h3>
                <p className="text-gray-600">
                  This property doesn&pos;t have any room configurations yet.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "policies" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Check-in/Check-out Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon
                    icon="solar:clock-circle-bold-duotone"
                    className="text-blue-600"
                    width={24}
                  />
                  Check-in/Check-out
                </h3>
                <div className="space-y-4">
                  {/* Check-in Time */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Check-in Time
                    </span>
                    {isEditing ? (
                      <input
                        type="time"
                        value={editedProperty?.policies?.checkInTime || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "policies",
                            "checkInTime",
                            e.target.value
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">
                        {property?.policies?.checkInTime}
                      </span>
                    )}
                  </div>

                  {/* Check-out Time */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Check-out Time
                    </span>
                    {isEditing ? (
                      <input
                        type="time"
                        value={editedProperty?.policies?.checkOutTime || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "policies",
                            "checkOutTime",
                            e.target.value
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">
                        {property?.policies?.checkOutTime}
                      </span>
                    )}
                  </div>

                  {/* Minimum Stay */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Minimum Stay
                    </span>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={editedProperty?.policies?.minimumStay || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "policies",
                            "minimumStay",
                            Number(e.target.value)
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">
                        {property?.policies?.minimumStay} night(s)
                      </span>
                    )}
                  </div>

                  {/* Maximum Stay */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Maximum Stay
                    </span>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={editedProperty?.policies?.maximumStay || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "policies",
                            "maximumStay",
                            Number(e.target.value)
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">
                        {property?.policies?.maximumStay} night(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon
                    icon="solar:shield-check-bold-duotone"
                    className="text-green-600"
                    width={24}
                  />
                  Policies
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">
                      Pet Policy
                    </label>
                    <p className="text-gray-900 font-medium">
                      {property.policies?.petPolicy}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">
                      Child Policy
                    </label>
                    <p className="text-gray-900 font-medium">
                      {property.policies?.childPolicy}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">
                      Smoking Policy
                    </label>
                    <p className="text-gray-900 font-medium">
                      {property.policies?.smokingPolicy}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">
                      Event Policy
                    </label>
                    <p className="text-gray-900 font-medium">
                      {property.policies?.eventPolicy}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">
                      Cancellation Policy
                    </label>
                    <p className="text-gray-900 capitalize font-medium">
                      {property.policies?.cancellationPolicy}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon
                    icon="solar:document-text-bold-duotone"
                    className="text-purple-600"
                    width={24}
                  />
                  House Rules
                </h3>
                <div className="space-y-3">
                  {property.policies?.houseRules?.length > 0 ? (
                    property.policies.houseRules.map((rule, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <Icon
                          icon="solar:check-circle-bold"
                          className="text-green-600"
                          width={18}
                        />
                        <span className="text-gray-900 font-medium">
                          {rule}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      No house rules specified
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Fees & Deposits Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon
                    icon="solar:dollar-bold-duotone"
                    className="text-orange-600"
                    width={24}
                  />
                  Fees & Deposits
                </h3>
                <div className="space-y-4">
                  {/* Security Deposit */}
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-gray-600 font-medium">
                      Security Deposit
                    </span>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editedProperty?.policies?.securityDeposit || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "policies",
                            "securityDeposit",
                            Number(e.target.value)
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-bold text-orange-600">
                        ₹{property?.policies?.securityDeposit}
                      </span>
                    )}
                  </div>

                  {/* Cleaning Fee */}
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-gray-600 font-medium">
                      Cleaning Fee
                    </span>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editedProperty?.policies?.cleaningFee || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "policies",
                            "cleaningFee",
                            Number(e.target.value)
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-bold text-blue-600">
                        ₹{property?.policies?.cleaningFee}
                      </span>
                    )}
                  </div>

                  {/* Additional Guest Fee */}
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-gray-600 font-medium">
                      Additional Guest Fee
                    </span>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={
                          editedProperty?.policies?.additionalGuestFee || ""
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            "policies",
                            "additionalGuestFee",
                            Number(e.target.value)
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-bold text-green-600">
                        ₹{property?.policies?.additionalGuestFee}
                      </span>
                    )}
                  </div>

                  {/* Damage Deposit */}
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-gray-600 font-medium">
                      Damage Deposit
                    </span>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={
                          editedProperty?.policies?.damagePolicy?.amount || ""
                        }
                        onChange={(e) =>
                          handleNestedChange("policies", "damagePolicy", {
                            ...(editedProperty?.policies?.damagePolicy || {}),
                            amount: Number(e.target.value),
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-bold text-red-600">
                        ₹{property?.policies?.damagePolicy?.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon
                    icon="solar:settings-bold-duotone"
                    className="text-indigo-600"
                    width={24}
                  />
                  Booking Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Instant Booking
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        property.policies?.instantBooking
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {property.policies?.instantBooking
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Advance Booking
                    </span>
                    <span className="font-semibold text-gray-900">
                      {property.policies?.advanceBookingDays} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Self Check-in
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        property.policies?.accessInstructions?.selfCheckIn
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {property.policies?.accessInstructions?.selfCheckIn
                        ? "Available"
                        : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>

              {property.policies?.quietHours?.enabled && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Icon
                      icon="solar:moon-bold-duotone"
                      className="text-indigo-600"
                      width={24}
                    />
                    Quiet Hours
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <span className="text-gray-600 font-medium">From</span>
                      <span className="font-semibold text-indigo-600">
                        {property.policies.quietHours.startTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <span className="text-gray-600 font-medium">To</span>
                      <span className="font-semibold text-indigo-600">
                        {property.policies.quietHours.endTime}
                      </span>
                    </div>
                    {property.policies.quietHours.description && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-sm font-medium text-gray-500">
                          Description
                        </label>
                        <p className="text-gray-900 font-medium">
                          {property.policies.quietHours.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "location" && (
          <div className="space-y-6">
            {/* Address Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Icon
                  icon="solar:map-point-bold-duotone"
                  className="text-red-600"
                  width={24}
                />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* House Number */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm font-medium text-gray-500">
                    House Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProperty?.location?.houseNumber || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "location",
                          "houseNumber",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold mt-2">
                      {property?.location?.houseNumber}
                    </p>
                  )}
                </div>

                {/* Locality */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm font-medium text-gray-500">
                    Locality
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProperty?.location?.locality || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "location",
                          "locality",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold mt-2">
                      {property?.location?.locality}
                    </p>
                  )}
                </div>

                {/* City */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm font-medium text-gray-500">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProperty?.location?.city || ""}
                      onChange={(e) =>
                        handleNestedChange("location", "city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold mt-2">
                      {property?.location?.city}
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm font-medium text-gray-500">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProperty?.location?.state || ""}
                      onChange={(e) =>
                        handleNestedChange("location", "state", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold mt-2">
                      {property?.location?.state}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm font-medium text-gray-500">
                    Country
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProperty?.location?.country || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "location",
                          "country",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold mt-2">
                      {property?.location?.country}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm font-medium text-gray-500">
                    Pincode
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProperty?.location?.pincode || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "location",
                          "pincode",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold mt-2">
                      {property?.location?.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Icon
                  icon="solar:global-bold-duotone"
                  className="text-blue-600"
                  width={24}
                />
                Coordinates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <label className="text-sm font-medium text-gray-500">
                    Latitude
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {property.location?.lat}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <label className="text-sm font-medium text-gray-500">
                    Longitude
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {property.location?.lng}
                  </p>
                </div>
                <div className="md:col-span-2 p-4 bg-green-50 rounded-xl border border-green-200">
                  <label className="text-sm font-medium text-gray-500">
                    Search Location
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {property.location?.searchLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Map placeholder */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Icon
                  icon="solar:map-bold-duotone"
                  className="text-purple-600"
                  width={24}
                />
                Interactive Map
              </h3>
              <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <Icon
                    icon="solar:map-bold"
                    width={64}
                    className="mx-auto text-blue-400 mb-4"
                  />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Map integration available here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Google Maps, Mapbox, or other mapping service
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                    <Icon
                      icon="solar:global-bold"
                      width={16}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Coordinates: {property.location?.lat},{" "}
                      {property.location?.lng}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <PaymentManagement propertyId={propertyId} />
        )}
      </div>
    </div>
  );
}
