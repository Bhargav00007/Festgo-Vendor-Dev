/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, X } from "lucide-react";
import { BarLoader } from "react-spinners";

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

  // Handle Create Offer
  const handleCreateOffer = async () => {
    try {
      if (!form.name || !form.discount || !form.promoCode)
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

      // Refresh offers
      const newData = await fetch("https://server.festgo.in/api/offers/get");
      const updatedOffers = await newData.json();
      setOffers(updatedOffers);
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
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {offers.length > 0 ? (
                offers.map((offer, i) => (
                  <tr
                    key={i}
                    className="border-b bg-white hover:bg-gray-50 transition-colors"
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
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleStatus(offer)}
                        className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                          offer.status.toLowerCase() === "active"
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-green-100 text-green-600 hover:bg-green-200"
                        }`}
                      >
                        {offer.status.toLowerCase() === "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
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
          <input
            type="text"
            placeholder="Offer Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Discount (e.g., 10%)"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Promo Code"
            value={form.promoCode}
            onChange={(e) => setForm({ ...form, promoCode: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Offer Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="date"
            placeholder="Booking Start"
            value={form.bookingWindowStart}
            onChange={(e) =>
              setForm({ ...form, bookingWindowStart: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="date"
            placeholder="Booking End"
            value={form.bookingWindowEnd}
            onChange={(e) =>
              setForm({ ...form, bookingWindowEnd: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="date"
            placeholder="Stay Start"
            value={form.stayDatesStart}
            onChange={(e) =>
              setForm({ ...form, stayDatesStart: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="date"
            placeholder="Stay End"
            value={form.stayDatesEnd}
            onChange={(e) => setForm({ ...form, stayDatesEnd: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Entity IDs (comma separated)"
            value={form.entityIds}
            onChange={(e) => setForm({ ...form, entityIds: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 col-span-2"
          />
          <input
            type="text"
            placeholder="Entity Names (comma separated)"
            value={form.entityNames}
            onChange={(e) => setForm({ ...form, entityNames: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 col-span-2"
          />
          <input
            type="text"
            placeholder="Offer For"
            value={form.offerFor}
            onChange={(e) => setForm({ ...form, offerFor: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 col-span-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 h-24 col-span-2"
          />
        </div>
      </Modal>
    </div>
  );
}
