"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";

type PaymentData = {
  id: string;
  bookingId: string;
  userId: string;
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  numRooms: number;
  amountPaid: number;
  commission: number;
  commissionPercentage: number;
  tds: number;
  gst: number;
  netAmount: number;
  property: {
    name: string;
    email: string;
    mobile_number: string;
  };
  createdAt: string;
  updatedAt: string;
};

type CommissionData = {
  id?: string;
  commission: number;
  createdAt?: string;
  updatedAt?: string;
};

interface PaymentManagementProps {
  propertyId: string;
}

export default function PaymentManagement({
  propertyId,
}: PaymentManagementProps) {
  const [commission, setCommission] = useState<CommissionData | null>(null);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [newCommission, setNewCommission] = useState("");
  const [paidPayments, setPaidPayments] = useState<PaymentData[]>([]);
  const [unpaidPayments, setUnpaidPayments] = useState<PaymentData[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCommission = async () => {
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await fetch(
        "https://server.festgo.in/api/admin/commission",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setCommission(data);
    } catch (error) {
      console.error("Error fetching commission:", error);
    }
  };

  const updateCommission = async () => {
    try {
      if (!newCommission || parseFloat(newCommission) <= 0) {
        toast.error("Please enter a valid commission percentage");
        return;
      }

      const token = localStorage.getItem("vendorToken");
      const response = await fetch(
        "https://server.festgo.in/api/admin/commission",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ commission: parseFloat(newCommission) }),
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to update commission");

      setCommission({
        commission: data.data.commission,
        updatedAt: data.data.updatedAt,
        id: data.data.id,
        createdAt: data.data.createdAt,
      });

      setShowCommissionModal(false);
      setNewCommission("");
      toast.success(data.message || "Commission rate updated successfully!");
    } catch (error) {
      console.error("Error updating commission:", error);
      toast.error("Failed to update commission");
    }
  };

  const fetchPayments = async (type: "paid" | "unpaid") => {
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await fetch(
        `https://server.festgo.in/api/admin/property-payments/${type}?propertyId=${propertyId}&page=1&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error(`Failed to fetch ${type} payments`);

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        type === "paid"
          ? setPaidPayments(data.data)
          : setUnpaidPayments(data.data);
      } else {
        type === "paid" ? setPaidPayments([]) : setUnpaidPayments([]);
      }
    } catch (error) {
      console.error(`Error fetching ${type} payments:`, error);
      toast.error(`Failed to load ${type} payments`);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    if (selectedPayments.length === 0) return;

    try {
      const token = localStorage.getItem("vendorToken");
      const formData = new FormData();
      formData.append("bookingIds", JSON.stringify(selectedPayments));
      if (paymentImage) formData.append("paymentReference", paymentImage);

      const response = await fetch(
        "https://server.festgo.in/api/admin/property-payments/mark-paid",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to mark payment as paid");

      await fetchPayments("unpaid");
      await fetchPayments("paid");
      setShowPaymentModal(false);
      setSelectedPayments([]);
      setPaymentImage(null);
      toast.success("Payment marked as paid successfully!");
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      toast.error("Failed to mark payment as paid");
    }
  };

  const downloadExcel = async (type: "paid" | "unpaid") => {
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await fetch(
        `https://server.festgo.in/api/admin/property-payments/export/${type}?propertyId=${propertyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error(`Failed to download ${type} payments`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-payments.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`${type} payments downloaded successfully!`);
    } catch (error) {
      console.error(`Error downloading ${type} payments:`, error);
      toast.error(`Failed to download ${type} payments`);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amt);

  useEffect(() => {
    if (propertyId) {
      fetchCommission();
      fetchPayments("paid");
      fetchPayments("unpaid");
    }
  }, [propertyId]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Commission Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Icon
              icon="solar:percent-bold-duotone"
              className="text-purple-600"
              width={24}
            />
            Commission Rate
          </h3>
          <button
            onClick={() => setShowCommissionModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg"
          >
            <Icon icon="solar:pen-bold" width={16} /> Update Commission
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-purple-600 bg-purple-50 px-4 py-3 rounded-xl border border-purple-200">
            {commission?.commission}%
          </div>
          <div className="text-sm text-gray-500">
            <p>Last updated:</p>
            <p className="font-medium text-gray-700">
              {commission?.updatedAt
                ? new Date(commission.updatedAt).toLocaleString()
                : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid Payments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Icon
                icon="solar:card-bold-duotone"
                className="text-red-600"
                width={24}
              />
              Unpaid Payments
              <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                {unpaidPayments.length}
              </span>
            </h3>
            <button
              onClick={() => downloadExcel("unpaid")}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg"
              disabled={!unpaidPayments.length}
            >
              <Icon icon="solar:export-bold" width={16} /> Export Excel
            </button>
          </div>

          <div className="space-y-4">
            {unpaidPayments.map((p) => (
              <div
                key={p.id}
                className={`p-4 bg-red-50 rounded-xl border ${
                  selectedPayments.includes(p.id)
                    ? "border-blue-400"
                    : "border-red-200"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {formatCurrency(p.amountPaid)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Booking ID: {p.bookingId}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(p.id)}
                    onChange={() =>
                      setSelectedPayments((prev) =>
                        prev.includes(p.id)
                          ? prev.filter((id) => id !== p.id)
                          : [...prev, p.id]
                      )
                    }
                    className="w-5 h-5 accent-blue-600 mt-1 cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm border-t border-red-200 pt-3">
                  <div>
                    <span className="text-gray-500">Check-in:</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(p.checkInDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Check-out:</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(p.checkOutDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Guests:</span>
                    <p className="font-medium text-gray-900">
                      {p.numAdults} Adults, {p.numChildren} Children
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Rooms:</span>
                    <p className="font-medium text-gray-900">{p.numRooms}</p>
                  </div>
                </div>
              </div>
            ))}

            {unpaidPayments.length > 0 && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Mark Selected as Paid
              </button>
            )}
          </div>
        </div>

        {/* Paid Payments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Icon
                icon="solar:card-bold-duotone"
                className="text-green-600"
                width={24}
              />
              Paid Payments
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                {paidPayments.length}
              </span>
            </h3>
            <button
              onClick={() => downloadExcel("paid")}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg"
              disabled={!paidPayments.length}
            >
              <Icon icon="solar:export-bold" width={16} /> Export Excel
            </button>
          </div>
          {paidPayments.map((p) => (
            <div
              key={p.id}
              className="p-4 bg-green-50 rounded-xl border border-green-200"
            >
              <p className="font-bold text-lg text-gray-900">
                {formatCurrency(p.amountPaid)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Booking ID: {p.bookingId}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Paid: {formatDate(p.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mark As Paid Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-500 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-3">Confirm Payment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload optional payment reference (image or screenshot):
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPaymentImage(e.target.files?.[0] || null)}
              className="mb-4"
            />
            <p className="text-gray-700 mb-6">
              You are marking {selectedPayments.length} booking(s) as paid. This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayments([]);
                }}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={markAsPaid}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
