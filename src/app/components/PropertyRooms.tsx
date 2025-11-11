/*eslint-disable @typescript-eslint/no-explicit-any*/
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { BarLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type SelectedAttribute = {
  id: number;
  name: string;
  value?: string | string[] | null;
};

type Bed = {
  icon: string;
  bedType: string;
  quantity: string | number;
};

type RoomAmenity = {
  otaName: string;
  category: string;
  amenityId: number;
  chargeType: number;
  isSelected: boolean;
  selectedSubAmenities: any[];
  amenity_name?: string;
  is_selected?: string;
  value?: string | string[] | null;
  selected_attributes?: SelectedAttribute[];
  selected_sub_attributes?: {
    main_attribute?: number | null;
    sub_attribute_1?: string | null;
    sub_attribute_2?: string | null;
    checkbox_attributes?: number[];
  };
};

type Photo = {
  tags: Array<{
    id: string;
    name: string;
  }>;
  type: string;
  imageURL: string;
  coverPhoto: boolean;
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
    beds: Bed[];
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
  free_cancellation: string;
  additional_info: string;
  meal_plan: string;
  inventory_details: any;
  room_amenities: RoomAmenity[];
  photos: Photo[];
  videos: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
};

type Property = {
  id: string;
  vendorId: string;
  name: string;
  rooms: Room[];
};

export default function PropertyRooms() {
  const params = useParams();
  const vendorId = params?.id as string;
  const propertyId = params?.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editedRooms, setEditedRooms] = useState<{ [key: string]: Room }>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyRooms = async () => {
      const token = localStorage.getItem("vendorToken");
      if (!token) return;

      try {
        const propRes = await fetch(
          `https://server.festgo.in/api/admin/property/${vendorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (propRes.ok) {
          const propData = await propRes.json();
          const properties = propData?.properties || [];
          const foundProperty = properties.find(
            (p: Property) => p.id === propertyId
          );
          setProperty(foundProperty || null);
        }
      } catch (error) {
        console.error("Error fetching property rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId && propertyId) {
      fetchPropertyRooms();
    }
  }, [vendorId, propertyId]);

  const handleEditClick = (room: Room) => {
    setEditingRoom(room.id);
    setEditedRooms((prev) => ({
      ...prev,
      [room.id]: JSON.parse(JSON.stringify(room)),
    }));
  };

  const handleCancelEdit = (roomId: string) => {
    setEditingRoom(null);
    setEditedRooms((prev) => {
      const newState = { ...prev };
      delete newState[roomId];
      return newState;
    });
  };

  const handleRoomChange = (roomId: string, field: string, value: any) => {
    setEditedRooms((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value,
      },
    }));
  };

  const handleNestedChange = (
    roomId: string,
    section: string,
    field: string,
    value: any
  ) => {
    setEditedRooms((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [section]: {
          ...prev[roomId][section],
          [field]: value,
        },
      },
    }));
  };

  const handlePriceChange = (roomId: string, field: string, value: any) => {
    setEditedRooms((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        price: {
          ...prev[roomId].price,
          [field]: value,
        },
      },
    }));
  };

  const handleBedChange = (
    roomId: string,
    bedIndex: number,
    field: string,
    value: any
  ) => {
    setEditedRooms((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        sleeping_arrangement: {
          ...prev[roomId].sleeping_arrangement,
          beds: prev[roomId].sleeping_arrangement.beds.map((bed, index) =>
            index === bedIndex ? { ...bed, [field]: value } : bed
          ),
        },
      },
    }));
  };

  const handleSaveRoom = async (roomId: string) => {
    const room = editedRooms[roomId];
    if (!room) return;

    try {
      setSaving(roomId);
      const token = localStorage.getItem("vendorToken");

      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      // Transform the room data to match the API format
      const payload = {
        id: room.id,
        propertyId: room.propertyId,
        room_type: room.room_type,
        view: room.view,
        area: room.area,
        room_name: room.room_name,
        number_of_rooms: Number(room.number_of_rooms),
        description: room.description,
        sleeping_arrangement: {
          beds: room.sleeping_arrangement.beds.map((bed) => ({
            icon: bed.icon,
            bedType: bed.bedType,
            quantity:
              typeof bed.quantity === "string"
                ? parseInt(bed.quantity) || 0
                : bed.quantity,
          })),
          max_adults: String(room.sleeping_arrangement.max_adults),
          base_adults: String(room.sleeping_arrangement.base_adults),
          max_children: String(room.sleeping_arrangement.max_children),
          max_occupancy: String(room.sleeping_arrangement.max_occupancy),
          max_extra_beds: String(room.sleeping_arrangement.max_extra_beds),
        },
        bathroom_available: Number(room.bathroom_available),
        price: {
          child_charge: Number(room.price.child_charge),
          extra_adult_charge: String(room.price.extra_adult_charge),
          base_price_for_2_adults: String(room.price.base_price_for_2_adults),
        },
        max_adults: Number(room.max_adults),
        max_children: Number(room.max_children),
        free_cancellation: room.free_cancellation || "No",
        additional_info: room.additional_info || "",
        meal_plan: room.meal_plan,
        inventory_details: room.inventory_details,
        room_amenities: room.room_amenities,
        photos: room.photos,
        videos: room.videos,
      };

      const response = await fetch(
        `https://server.festgo.in/api/admin/rooms/${roomId}/edit`,
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
        throw new Error(json?.message || "Failed to update room");
      }

      // Update local state
      setProperty((prev) =>
        prev
          ? {
              ...prev,
              rooms: prev.rooms.map((r) => (r.id === roomId ? room : r)),
            }
          : null
      );

      setEditingRoom(null);
      setEditedRooms((prev) => {
        const newState = { ...prev };
        delete newState[roomId];
        return newState;
      });

      toast.success("Room updated successfully!");
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update room"
      );
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl">
        <div className="text-center">
          <BarLoader color="#3B82F6" />
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {property?.rooms && property.rooms.length > 0 ? (
        property.rooms.map((room) => {
          const isEditing = editingRoom === room.id;
          const editedRoom = editedRooms[room.id] || room;

          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200"
            >
              {/* Edit/Cancel/Save Buttons */}
              <div className="flex justify-end mb-6">
                {!isEditing ? (
                  <button
                    onClick={() => handleEditClick(room)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <Icon icon="solar:pen-bold" width={18} />
                    <span>Edit Room</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancelEdit(room.id)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 flex items-center gap-2 transition-colors"
                    >
                      <Icon icon="solar:close-circle-bold" width={18} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={() => handleSaveRoom(room.id)}
                      disabled={saving === room.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center gap-2 transition-colors"
                    >
                      <Icon icon="solar:check-circle-bold" width={18} />
                      <span>{saving === room.id ? "Saving..." : "Save"}</span>
                    </button>
                  </div>
                )}
              </div>

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
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedRoom.room_name}
                          onChange={(e) =>
                            handleRoomChange(
                              room.id,
                              "room_name",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-2xl font-bold"
                        />
                      ) : (
                        <h4 className="text-2xl font-bold text-gray-900">
                          {room.room_name}
                        </h4>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2">
                        {isEditing ? (
                          <>
                            <select
                              value={editedRoom.room_type}
                              onChange={(e) =>
                                handleRoomChange(
                                  room.id,
                                  "room_type",
                                  e.target.value
                                )
                              }
                              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 capitalize"
                            >
                              <option value="standard">Standard</option>
                              <option value="deluxe">Deluxe</option>
                              <option value="suite">Suite</option>
                              <option value="executive">Executive</option>
                            </select>
                            <select
                              value={editedRoom.view}
                              onChange={(e) =>
                                handleRoomChange(
                                  room.id,
                                  "view",
                                  e.target.value
                                )
                              }
                              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 capitalize"
                            >
                              <option value="city">City View</option>
                              <option value="garden">Garden View</option>
                              <option value="pool">Pool View</option>
                              <option value="ocean">Ocean View</option>
                            </select>
                          </>
                        ) : (
                          <p className="text-gray-600 capitalize font-medium">
                            {room.room_type} Room • {room.view} View
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Area */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">
                        Area
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedRoom.area}
                          onChange={(e) =>
                            handleRoomChange(room.id, "area", e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 font-semibold">
                          {room.area}
                        </p>
                      )}
                    </div>

                    {/* Number of Rooms */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">
                        Number of Rooms
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedRoom.number_of_rooms}
                          onChange={(e) =>
                            handleRoomChange(
                              room.id,
                              "number_of_rooms",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 font-semibold">
                          {room.number_of_rooms}
                        </p>
                      )}
                    </div>

                    {/* Max Adults */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">
                        Max Adults
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedRoom.max_adults}
                          onChange={(e) =>
                            handleRoomChange(
                              room.id,
                              "max_adults",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 font-semibold">
                          {room.max_adults}
                        </p>
                      )}
                    </div>

                    {/* Max Children */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">
                        Max Children
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedRoom.max_children}
                          onChange={(e) =>
                            handleRoomChange(
                              room.id,
                              "max_children",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 font-semibold">
                          {room.max_children}
                        </p>
                      )}
                    </div>

                    {/* Bathrooms */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">
                        Bathrooms
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedRoom.bathroom_available}
                          onChange={(e) =>
                            handleRoomChange(
                              room.id,
                              "bathroom_available",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 font-semibold">
                          {room.bathroom_available}
                        </p>
                      )}
                    </div>

                    {/* Meal Plan */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">
                        Meal Plan
                      </label>
                      {isEditing ? (
                        <select
                          value={editedRoom.meal_plan}
                          onChange={(e) =>
                            handleRoomChange(
                              room.id,
                              "meal_plan",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1 capitalize"
                        >
                          <option value="free_breakfast">Free Breakfast</option>
                          <option value="all_inclusive">All Inclusive</option>
                          <option value="half_board">Half Board</option>
                          <option value="full_board">Full Board</option>
                          <option value="bed_breakfast">Bed & Breakfast</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 capitalize font-semibold">
                          {room.meal_plan.replace(/_/g, " ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sleeping Arrangement */}
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">
                      Sleeping Arrangement
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {editedRoom.sleeping_arrangement?.beds?.map(
                        (bed, bedIndex) => (
                          <div
                            key={bedIndex}
                            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                          >
                            {isEditing ? (
                              <>
                                <input
                                  type="text"
                                  value={bed.icon}
                                  onChange={(e) =>
                                    handleBedChange(
                                      room.id,
                                      bedIndex,
                                      "icon",
                                      e.target.value
                                    )
                                  }
                                  className="w-12 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                                  placeholder="🛏️"
                                />
                                <select
                                  value={bed.bedType}
                                  onChange={(e) =>
                                    handleBedChange(
                                      room.id,
                                      bedIndex,
                                      "bedType",
                                      e.target.value
                                    )
                                  }
                                  className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 capitalize"
                                >
                                  <option value="single">Single</option>
                                  <option value="double">Double</option>
                                  <option value="queen">Queen</option>
                                  <option value="king">King</option>
                                  <option value="twin">Twin</option>
                                </select>
                                <input
                                  type="number"
                                  value={
                                    typeof bed.quantity === "number"
                                      ? bed.quantity
                                      : parseInt(bed.quantity as string) || 0
                                  }
                                  onChange={(e) =>
                                    handleBedChange(
                                      room.id,
                                      bedIndex,
                                      "quantity",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  min="0"
                                />
                              </>
                            ) : (
                              <>
                                <span className="text-2xl">{bed.icon}</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {bed.quantity} {bed.bedType} bed
                                  {typeof bed.quantity === "number" &&
                                  bed.quantity > 1
                                    ? "s"
                                    : ""}
                                </span>
                              </>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">
                      Description
                    </h5>
                    {isEditing ? (
                      <textarea
                        value={editedRoom.description}
                        onChange={(e) =>
                          handleRoomChange(
                            room.id,
                            "description",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">
                        {room.description}
                      </p>
                    )}
                  </div>

                  {/* Room Amenities */}
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4">
                      Room Amenities
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {editedRoom.room_amenities
                        ?.filter(
                          (amenity) =>
                            amenity.isSelected || amenity.is_selected === "true"
                        )
                        .map((amenity) => (
                          <div
                            key={amenity.amenityId}
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <Icon
                              icon="solar:check-circle-bold"
                              className="text-green-600"
                              width={16}
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {amenity.otaName || amenity.amenity_name}
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
                        {room.photos.slice(0, 6).map((photo, photoIndex) => (
                          <div key={photoIndex} className="relative group">
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

                {/* Pricing Section */}
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
                      {/* Base Rate */}
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-600">
                          Base Rate (2 Adults)
                        </span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedRoom.price?.base_price_for_2_adults}
                            onChange={(e) =>
                              handlePriceChange(
                                room.id,
                                "base_price_for_2_adults",
                                e.target.value
                              )
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        ) : (
                          <span className="font-bold text-lg text-green-600">
                            ₹{room.price?.base_price_for_2_adults}
                          </span>
                        )}
                      </div>

                      {/* Extra Adult */}
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-600">Extra Adult</span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedRoom.price?.extra_adult_charge}
                            onChange={(e) =>
                              handlePriceChange(
                                room.id,
                                "extra_adult_charge",
                                e.target.value
                              )
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        ) : (
                          <span className="font-semibold text-gray-900">
                            ₹{room.price?.extra_adult_charge}
                          </span>
                        )}
                      </div>

                      {/* Child Charge */}
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-600">Child Charge</span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedRoom.price?.child_charge}
                            onChange={(e) =>
                              handlePriceChange(
                                room.id,
                                "child_charge",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        ) : (
                          <span className="font-semibold text-gray-900">
                            ₹{room.price?.child_charge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
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
            This property doesn&apos;t have any room configurations yet.
          </p>
        </div>
      )}
    </div>
  );
}
