/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, X, Trash2, MoreVertical } from "lucide-react";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";

// ---------------------- Modal Component ----------------------
function Modal({
  open,
  onClose,
  title,
  children,
  actionArea,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  actionArea?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);
  const handleAnimationEnd = () => {
    if (!open) setMounted(false);
  };
  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl transition-all duration-200 border border-gray-200 ${
          open
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-1"
        }`}
        onTransitionEnd={handleAnimationEnd}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 border border-gray-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">{children}</div>
        {actionArea && (
          <div className="mt-2 flex justify-end gap-2">{actionArea}</div>
        )}
      </div>
    </div>
  );
}

// ---------------------- Main Page ----------------------
export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);

  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    type: "Flat Discount",
    discount: "",
    bookingWindowStart: "",
    bookingWindowEnd: "",
    stayDatesStart: "",
    stayDatesEnd: "",
    promoCode: "",
    entityIds: "",
    entityNames: "",
    description: "",
    offerFor: "",
  });

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null,
    []
  );

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://server.festgo.in/api/offers/get", {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch offers");
        const data = await res.json();
        setOffers(data);
      } catch (err) {
        toast.error("Error fetching offers");
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [token]);

  // Handle Activate / Deactivate
  const toggleStatus = async (offer: any) => {
    const action =
      offer.status.toLowerCase() === "active" ? "deactivate" : "activate";
    try {
      const res = await fetch(
        `https://server.festgo.in/api/offers/${action}/${offer.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (!res.ok) throw new Error(`Failed to ${action} offer`);
      toast.success(`Offer ${action}d successfully`);

      setOffers((prev) =>
        prev.map((o) =>
          o.id === offer.id
            ? { ...o, status: action === "activate" ? "Active" : "Inactive" }
            : o
        )
      );
    } catch (err) {
      toast.error(`Error trying to ${action} offer`);
    }
  };

  // Handle Delete Offer
  const handleDeleteOffer = async () => {
    if (!selectedOffer) return;
    try {
      const res = await fetch(
        `https://server.festgo.in/offers/delete/${selectedOffer.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete offer");
      toast.success("Offer deleted successfully");
      setOffers((prev) => prev.filter((o) => o.id !== selectedOffer.id));
      setDeleteModal(false);
    } catch (err) {
      toast.error("Error deleting offer");
    }
  };

  // Handle Create Offer
  const handleCreateOffer = async () => {
    try {
      if (!form.name || !form.discount || !form.promoCode || !form.offerFor)
        return toast.error("Please fill all required fields");

      const body = {
        ...form,
        status: "active",
        entityIds: form.entityIds.split(",").map((id) => id.trim()),
        entityNames: form.entityNames.split(",").map((n) => n.trim()),
      };

      const res = await fetch("https://server.festgo.in/api/offers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create offer");
      toast.success("Offer created successfully");
      setModalOpen(false);
      setForm({
        name: "",
        type: "Flat Discount",
        discount: "",
        bookingWindowStart: "",
        bookingWindowEnd: "",
        stayDatesStart: "",
        stayDatesEnd: "",
        promoCode: "",
        entityIds: "",
        entityNames: "",
        description: "",
        offerFor: "",
      });

      // Redirect after creation
      router.push("/adminhome/adminoffers");
    } catch (err) {
      toast.error("Error creating offer");
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 my-20">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Offers
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage all offers and promotions
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="h-5 w-5" /> Create Offer
        </button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex flex-col items-center justify-center mt-10">
          <BarLoader color="#2563eb" />
          <p className="text-gray-600 mt-4">Loading offers...</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
          <table className="min-w-full border-collapse">
            <thead className="bg-white border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Discount
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Promo Code
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Booking Window
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Stay Dates
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Properties
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-gray-700 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {offers.length > 0 ? (
                offers.map((offer, i) => (
                  <tr
                    key={i}
                    className="border-b bg-white hover:bg-gray-50 transition-colors relative"
                  >
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {offer.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{offer.type}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {offer.discount}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {offer.promoCode}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {offer.bookingWindowStart} - {offer.bookingWindowEnd}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {offer.stayDatesStart} - {offer.stayDatesEnd}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {offer.entityNames?.join(", ")}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        offer.status.toLowerCase() === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {offer.status}
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      <button
                        className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer flex items-center justify-center gap-1 mx-auto"
                        onClick={() =>
                          setOpenActionMenu(openActionMenu === i ? null : i)
                        }
                      >
                        Actions <MoreVertical className="w-4 h-4" />
                      </button>

                      {openActionMenu === i && (
                        <div className="absolute right-10 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-xl z-50">
                          <button
                            onClick={() => toggleStatus(offer)}
                            className={`block w-full text-left px-4 py-2 text-sm font-medium ${
                              offer.status.toLowerCase() === "active"
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {offer.status.toLowerCase() === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOffer(offer);
                              setDeleteModal(true);
                              setOpenActionMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="inline-block w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No offers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Offer Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Offer"
        actionArea={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOffer}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 cursor-pointer"
            >
              Create
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col text-gray-700">
            <input
              type="text"
              placeholder="Offer Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            <input
              type="text"
              placeholder="Discount"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            <input
              type="text"
              placeholder="Promo Code"
              value={form.promoCode}
              onChange={(e) => setForm({ ...form, promoCode: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            <input
              type="text"
              placeholder="Offer Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            Booking Start
            <input
              type="date"
              value={form.bookingWindowStart}
              onChange={(e) =>
                setForm({ ...form, bookingWindowStart: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            Booking End
            <input
              type="date"
              value={form.bookingWindowEnd}
              onChange={(e) =>
                setForm({ ...form, bookingWindowEnd: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            Stay Start
            <input
              type="date"
              value={form.stayDatesStart}
              onChange={(e) =>
                setForm({ ...form, stayDatesStart: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            Stay End
            <input
              type="date"
              value={form.stayDatesEnd}
              onChange={(e) =>
                setForm({ ...form, stayDatesEnd: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-gray-700 col-span-2">
            <input
              type="text"
              value={form.entityIds}
              onChange={(e) => setForm({ ...form, entityIds: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Entity IDs (comma separated)
"
            />
          </label>

          <label className="flex flex-col text-gray-700 col-span-2">
            <input
              type="text"
              value={form.entityNames}
              onChange={(e) =>
                setForm({ ...form, entityNames: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Entity Names (comma separated)
"
            />
          </label>

          <label className="flex flex-col text-gray-700 col-span-2">
            <select
              value={form.offerFor}
              onChange={(e) => setForm({ ...form, offerFor: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
              aria-placeholder="Offer for"
            >
              <option value="">Select Offer For</option>
              <option value="property">Property</option>
              <option value="event">Event</option>
              <option value="beach_fests">Beach Fests</option>
              <option value="city_fests">City Fests</option>
            </select>
          </label>

          <label className="flex flex-col text-gray-700 col-span-2">
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 h-24"
            />
          </label>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Offer"
        actionArea={
          <>
            <button
              onClick={() => setDeleteModal(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteOffer}
              className="rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 cursor-pointer"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to permanently delete{" "}
          <strong>{selectedOffer?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
