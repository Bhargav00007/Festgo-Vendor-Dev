"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Users, List } from "lucide-react";
import { BarLoader } from "react-spinners";

interface UserType {
  id: string;
  firstname: string | null;
  lastname: string | null;
  username: string | null;
  email: string | null;
  number: string | null;
  image_url: string;
  date_of_birth: string | null;
  gender: string | null;
  pincode: string | null;
  state: string | null;
  logintype: string | null;
  referralCode: string | null;
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null,
    []
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://server.festgo.in/api/admin/users?page=1&limit=10",
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data?.success && Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6 my-20">
      <ToastContainer />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Users
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            List of all registered users
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-4 rounded-xl border border-gray-300 bg-white p-4 hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <List className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users (Page)</p>
            <p className="text-xl font-semibold">{users.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <BarLoader color="#4A90E2" loading={loading} />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-gray-300 p-8 text-center">
          No users found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
          <div className="m-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" /> User List
            </h2>
            <p className="text-gray-600">Showing 10 users per page</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                {[
                  "S.No",
                  "Profile",
                  "Name",
                  "Email",
                  "Phone",
                  "Gender",
                  "State",
                  "Referral",
                  "Login Type",
                  "Joined On",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/users/${u.id}`)}
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">
                    <img
                      src={u.image_url || "/profiles/user-1.jpg"}
                      alt={u.fullName || "User"}
                      width={40}
                      height={40}
                      className="rounded-full border border-gray-200 object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.fullName || "User"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {u.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {u.number || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {u.gender || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {u.state || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {u.referralCode || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {u.logintype || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
