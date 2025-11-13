/*eslint-disable @typescript-eslint/no-explicit-any*/
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { BarLoader } from "react-spinners";
import { Icon } from "@iconify/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type PropertyImageGalleryProps = {
  vendorId: string;
  propertyId: string;
  token?: string;
};

type PropertyPhoto = {
  tags: Array<{
    id: string;
    name: string;
  }>;
  type: string;
  imageURL: string;
  coverPhoto: boolean;
};

type Property = {
  id: string;
  vendorId: string;
  name: string;
  photos?: PropertyPhoto[];
  strdata?: any;
  [key: string]: any;
};

export default function PropertyImageGallery({
  vendorId,
  propertyId,
  token,
}: PropertyImageGalleryProps) {
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);

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
        const foundProperty = properties.find((p) => p.id === propertyId);

        if (!foundProperty) {
          setError("Property not found.");
          setLoading(false);
          return;
        }

        setProperty(foundProperty);

        // Extract photos array
        const propertyPhotos = Array.isArray(foundProperty.photos)
          ? foundProperty.photos
          : [];

        setPhotos(propertyPhotos);
      } catch (error) {
        setError("An error occurred while fetching images.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [vendorId, propertyId, token]);

  const handleDeleteImage = (index: number) => {
    if (!editing) return;

    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleSetCoverPhoto = (index: number) => {
    if (!editing) return;

    const newPhotos = [...photos];
    // Remove current cover photo status
    newPhotos.forEach((photo) => (photo.coverPhoto = false));
    // Set new cover photo
    newPhotos[index].coverPhoto = true;

    // Move cover photo to first position
    const coverPhoto = newPhotos.splice(index, 1)[0];
    newPhotos.unshift(coverPhoto);

    setPhotos(newPhotos);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || !files.length || !editing) return;

    const localToken = token ?? localStorage.getItem("vendorToken");
    if (!localToken) {
      toast.error("Authentication token not found");
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Create form data for upload
        const formData = new FormData();
        formData.append("file", file);

        // Upload file to public endpoint
        const uploadResponse = await fetch(
          "https://server.festgo.in/api/upload/public",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image ${i + 1}`);
        }

        const uploadResult = await uploadResponse.json();
        const imageUrl = uploadResult.url;

        if (!imageUrl) {
          throw new Error(`No URL returned for image ${i + 1}`);
        }

        // Create new photo object
        const newPhoto: PropertyPhoto = {
          tags: [
            {
              id: propertyId,
              name: property?.name || "Property",
            },
          ],
          type: "image",
          imageURL: imageUrl,
          coverPhoto: false,
        };

        // Add to photos array
        setPhotos((prev) => [...prev, newPhoto]);
      }

      toast.success(`Successfully uploaded ${files.length} image(s)`);
      event.target.value = ""; // Reset file input
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!property || !editing) return;

    const localToken = token ?? localStorage.getItem("vendorToken");
    if (!localToken) {
      toast.error("Authentication token not found");
      return;
    }

    setSaving(true);

    try {
      // Prepare updated property data
      const updatedProperty = {
        ...property,
        photos: photos,
        strdata: {
          ...property.strdata,
          step_5: photos.reduce((acc, photo, index) => {
            acc[index] = photo;
            return acc;
          }, {} as any),
        },
      };

      const response = await fetch(
        `https://server.festgo.in/api/admin/property/${propertyId}/edit`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProperty),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.message || "Failed to save changes");
      }

      toast.success("Property images updated successfully!");
      setEditing(false);
      setProperty(updatedProperty);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original photos
    if (property) {
      setPhotos(Array.isArray(property.photos) ? property.photos : []);
    }
    setEditing(false);
  };

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

  // Number of photos to show when collapsed
  const INITIAL_PHOTOS = 6;

  // Photos to display based on expanded state
  const displayedPhotos = expanded ? photos : photos.slice(0, INITIAL_PHOTOS);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header with Edit/Cancel/Save buttons */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Icon
            icon="solar:gallery-bold"
            className="text-blue-600"
            width={22}
          />
          Property Photos
        </h3>

        <div className="flex gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-2 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Icon icon="solar:pen-bold" width={20} />
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 flex items-center gap-2 transition-colors"
              >
                <Icon icon="solar:close-circle-bold" width={18} />
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center gap-2 transition-colors"
              >
                <Icon icon="solar:check-circle-bold" width={18} />
                <span>{saving ? "Saving..." : "Save"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload Section - Only show when editing */}
      {editing && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Add New Photos
              </h4>
              <p className="text-sm text-blue-700">
                Upload new images to your property gallery
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:bg-blue-400">
                <Icon icon="solar:plus-circle-bold" width={18} />
                <span>{uploading ? "Uploading..." : "Add Photos"}</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Mobile (Carousel style) */}
      <div className="lg:hidden flex gap-4 overflow-x-auto pb-2">
        {displayedPhotos.map((photo, i) => (
          <div
            key={photo.imageURL + i}
            className="min-w-[220px] h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative"
          >
            <Image
              src={photo.imageURL}
              alt={`Photo ${i + 1}`}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 400px"
              priority={i === 0}
            />

            {/* Edit Mode Overlay */}
            {editing && (
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                <div className="flex gap-2">
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteImage(i)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Icon icon="solar:trash-bin-trash-bold" width={16} />
                  </button>

                  {/* Set as Cover Photo Button */}
                  {!photo.coverPhoto && (
                    <button
                      onClick={() => handleSetCoverPhoto(i)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Icon icon="solar:star-bold" width={16} />
                    </button>
                  )}

                  {/* Cover Photo Badge */}
                  {photo.coverPhoto && (
                    <div className="p-2 bg-green-600 text-white rounded-full">
                      <Icon icon="solar:star-bold" width={16} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add New Photo Box - Only show when editing */}
        {editing && (
          <label className="min-w-[220px] h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className="text-center">
              <Icon
                icon="solar:plus-circle-bold"
                width={32}
                className="mx-auto text-gray-400 mb-2"
              />
              <p className="text-sm text-gray-600">Add Photos</p>
            </div>
          </label>
        )}
      </div>

      {/* Desktop/Mid-screen (Grid) */}
      <div className="hidden lg:grid gap-3 grid-cols-2 xl:grid-cols-3">
        {displayedPhotos.map((photo, i) => (
          <div
            key={photo.imageURL + i}
            className="relative h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group"
          >
            <Image
              src={photo.imageURL}
              alt={`Photo ${i + 1}`}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
              sizes="(max-width: 1280px) 350px, 450px"
              priority={i === 0}
            />

            {/* Cover Photo Badge */}
            {photo.coverPhoto && (
              <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Icon icon="solar:star-bold" width={12} />
                Cover
              </div>
            )}

            {/* Edit Mode Overlay */}
            {editing && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                <div className="flex gap-2">
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteImage(i)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Delete photo"
                  >
                    <Icon icon="solar:trash-bin-trash-bold" width={16} />
                  </button>

                  {/* Set as Cover Photo Button */}
                  {!photo.coverPhoto && (
                    <button
                      onClick={() => handleSetCoverPhoto(i)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      title="Set as cover photo"
                    >
                      <Icon icon="solar:star-bold" width={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Delete Button - Always visible in edit mode */}
            {editing && (
              <button
                onClick={() => handleDeleteImage(i)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                title="Delete photo"
              >
                <Icon icon="solar:trash-bin-trash-bold" width={14} />
              </button>
            )}
          </div>
        ))}

        {/* Add New Photo Box - Only show when editing */}
        {editing && (
          <label className="h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className="text-center">
              <Icon
                icon="solar:plus-circle-bold"
                width={48}
                className="mx-auto text-gray-400 mb-2"
              />
              <p className="text-lg font-medium text-gray-600">Add Photos</p>
              <p className="text-sm text-gray-500 mt-1">Click to upload</p>
            </div>
          </label>
        )}
      </div>

      {/* Show More / Show Less button only if more photos exist */}
      {!editing && photos.length > INITIAL_PHOTOS && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium cursor-pointer text-gray-700 bg-white hover:bg-gray-50"
          >
            {expanded
              ? "Show Less"
              : `Show More (${photos.length - INITIAL_PHOTOS})`}
          </button>
        </div>
      )}

      {/* Cover Photo Instructions */}
      {editing && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-800">
            <Icon icon="solar:info-circle-bold" width={16} />
            <span className="text-sm font-medium">
              Cover Photo: The first image in the gallery will be used as the
              cover photo. Click the star icon on any image to set it as cover.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
