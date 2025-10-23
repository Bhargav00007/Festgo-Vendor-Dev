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
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
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

      if (!response.ok) {
        throw new Error(data.message || "Failed to update commission");
      }

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} payments`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        if (type === "paid") {
          setPaidPayments(data.data || []);
        } else {
          setUnpaidPayments(data.data || []);
        }
      } else {
        console.error(`Invalid response format for ${type} payments:`, data);
        if (type === "paid") {
          setPaidPayments([]);
        } else {
          setUnpaidPayments([]);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type} payments:`, error);
      toast.error(`Failed to load ${type} payments`);
      if (type === "paid") {
        setPaidPayments([]);
      } else {
        setUnpaidPayments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    if (!selectedPayment) return;
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await fetch(
        "https://server.festgo.in/api/admin/property-payments/mark-paid",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentId: selectedPayment }),
        }
      );

      if (response.ok) {
        await fetchPayments("unpaid");
        await fetchPayments("paid");
        setShowPaymentModal(false);
        setSelectedPayment(null);
        toast.success("Payment marked as paid successfully!");
      } else {
        throw new Error("Failed to mark payment as paid");
      }
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download ${type} payments`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-payments.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`${type} payments downloaded successfully!`);
    } catch (error) {
      console.error(`Error downloading ${type} payments:`, error);
      toast.error(`Failed to download ${type} payments`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (propertyId) {
      fetchCommission();
      fetchPayments("paid");
      fetchPayments("unpaid");
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Commission Management */}
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
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <Icon icon="solar:pen-bold" width={16} />
            Update Commission
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
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-sm"
              disabled={unpaidPayments.length === 0}
            >
              <Icon icon="solar:export-bold" width={16} />
              Export Excel
            </button>
          </div>
          <div className="space-y-4">
            {unpaidPayments.length > 0 ? (
              unpaidPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 bg-red-50 rounded-xl border border-red-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">
                        {formatCurrency(payment.amountPaid)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Booking ID: {payment.bookingId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPayment(payment.id);
                        setShowPaymentModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-sm ml-4"
                    >
                      <Icon icon="solar:check-circle-bold" width={16} />
                      Mark Paid
                    </button>
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm border-t border-red-200 pt-3">
                    <div>
                      <span className="text-gray-500">Check-in:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(payment.checkInDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Check-out:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(payment.checkOutDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Guests:</span>
                      <p className="font-medium text-gray-900">
                        {payment.numAdults} Adults, {payment.numChildren}{" "}
                        Children
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Rooms:</span>
                      <p className="font-medium text-gray-900">
                        {payment.numRooms}
                      </p>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Commission:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(payment.commission)} (
                        {payment.commissionPercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">TDS:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(payment.tds)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">GST:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(payment.gst)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1 font-semibold border-t border-red-200 pt-1">
                      <span className="text-gray-700">Net Amount:</span>
                      <span className="text-green-600">
                        {formatCurrency(payment.netAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Icon
                  icon="solar:card-bold-duotone"
                  className="mx-auto text-gray-400 mb-3"
                  width={48}
                />
                <p className="text-gray-600 font-medium">
                  No unpaid payments found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  All payments have been processed
                </p>
              </div>
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
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-sm"
              disabled={paidPayments.length === 0}
            >
              <Icon icon="solar:export-bold" width={16} />
              Export Excel
            </button>
          </div>
          <div className="space-y-4">
            {paidPayments.length > 0 ? (
              paidPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 bg-green-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">
                        {formatCurrency(payment.amountPaid)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Booking ID: {payment.bookingId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Paid: {formatDate(payment.updatedAt)}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium flex items-center gap-1 shadow-sm ml-4">
                      <Icon icon="solar:check-circle-bold" width={14} />
                      Paid
                    </span>
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm border-t border-green-200 pt-3">
                    <div>
                      <span className="text-gray-500">Check-in:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(payment.checkInDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Check-out:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(payment.checkOutDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Guests:</span>
                      <p className="font-medium text-gray-900">
                        {payment.numAdults} Adults, {payment.numChildren}{" "}
                        Children
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Rooms:</span>
                      <p className="font-medium text-gray-900">
                        {payment.numRooms}
                      </p>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Commission:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(payment.commission)} (
                        {payment.commissionPercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">TDS:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(payment.tds)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">GST:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(payment.gst)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1 font-semibold border-t border-green-200 pt-1">
                      <span className="text-gray-700">Net Amount:</span>
                      <span className="text-green-600">
                        {formatCurrency(payment.netAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Property Information */}
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {payment.property.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.property.email} •{" "}
                      {payment.property.mobile_number}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Icon
                  icon="solar:card-bold-duotone"
                  className="mx-auto text-gray-400 mb-3"
                  width={48}
                />
                <p className="text-gray-600 font-medium">
                  No paid payments found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  No payments have been marked as paid yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commission Update Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Icon
                  icon="solar:percent-bold-duotone"
                  className="text-purple-600"
                  width={24}
                />
                Update Commission Rate
              </h3>
              <button
                onClick={() => {
                  setShowCommissionModal(false);
                  setNewCommission("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <Icon icon="solar:close-circle-bold" width={24} />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                New Commission Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newCommission}
                  onChange={(e) => setNewCommission(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                  placeholder="Enter percentage"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <span className="absolute right-4 top-4 text-gray-500 text-lg font-medium">
                  %
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter a value between 0 and 100
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCommissionModal(false);
                  setNewCommission("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={updateCommission}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm"
              >
                <Icon icon="solar:check-circle-bold" width={20} />
                Update Commission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon
                  icon="solar:card-bold"
                  className="text-blue-600"
                  width={24}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Confirm Payment
                </h3>
                <p className="text-sm text-gray-600">
                  Mark this payment as completed
                </p>
              </div>
            </div>

            {selectedPayment && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-gray-900">
                  Booking ID:{" "}
                  {
                    unpaidPayments.find((p) => p.id === selectedPayment)
                      ?.bookingId
                  }
                </p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {formatCurrency(
                    unpaidPayments.find((p) => p.id === selectedPayment)
                      ?.amountPaid || 0
                  )}
                </p>
              </div>
            )}

            <p className="mb-6 text-gray-700">
              Are you sure you want to mark this payment as paid? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={markAsPaid}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm"
              >
                <Icon icon="solar:check-circle-bold" width={20} />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
