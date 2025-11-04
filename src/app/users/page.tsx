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
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "email" | "date">("date");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const router = useRouter();

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null,
    []
  );

  const fetchUsers = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://server.festgo.in/api/admin/users?page=${pageNumber}&limit=10`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();

      const newUsers =
        data?.success && Array.isArray(data.data) ? data.data : [];
      setUsers(newUsers);

      // Assuming backend sends total pages (else you can calculate if total count is available)
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredUsers([]);
      return;
    }
    try {
      const res = await fetch(
        `https://server.festgo.in/api/admin/users?limit=100`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      const allUsers =
        data?.success && Array.isArray(data.data) ? data.data : [];

      const filtered = allUsers.filter(
        (user: {
          fullName: string;
          email: string;
          number: string;
          state: string;
        }) =>
          user.fullName?.toLowerCase().includes(value.toLowerCase()) ||
          user.email?.toLowerCase().includes(value.toLowerCase()) ||
          user.number?.includes(value) ||
          user.state?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
    } catch (err) {
      toast.error("Error searching users");
    }
  };

  const handleSort = (type: "name" | "email" | "date") => {
    setSortBy(type);
    const sorted = [...(searchTerm ? filteredUsers : users)].sort((a, b) => {
      switch (type) {
        case "name":
          return (a.fullName || "").localeCompare(b.fullName || "");
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });
    if (searchTerm) setFilteredUsers(sorted);
    else setUsers(sorted);
    setShowSortMenu(false);
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const displayedUsers = searchTerm ? filteredUsers : users;

  return (
    <div className="mx-auto max-w-6xl p-6 my-20 overflow-hidden">
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

      {/* Stats */}
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

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Sort */}
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
            <span>Sort by {sortBy}</span>
          </button>

          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                {(
                  [
                    { key: "name", label: "Name" },
                    { key: "email", label: "Email" },
                    { key: "date", label: "Join Date" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    onClick={() =>
                      handleSort(item.key as "name" | "email" | "date")
                    }
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === item.key
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Sort by {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <BarLoader color="#4A90E2" loading={loading} />
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="rounded-2xl border border-gray-300 p-8 text-center">
          No users found.
        </div>
      ) : (
        <>
          {/* Horizontally scrollable table */}
          <div className="overflow-x-auto w-full border border-gray-300 rounded-xl bg-white">
            <div className="min-w-[1000px]">
              <div className="m-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" /> User List
                </h2>
                <p className="text-gray-600">Showing {users.length} users</p>
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
                  {displayedUsers.map((u, index) => (
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
          </div>

          {/* Horizontally Scrollable Pagination Bar */}
          {!searchTerm && totalPages > 1 && (
            <div className="mt-6 overflow-x-auto">
              <div className="flex justify-center min-w-max pb-2">
                <div className="flex space-x-2 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (num) => (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`px-4 py-2 rounded-lg border transition whitespace-nowrap min-w-[44px] flex items-center justify-center ${
                          page === num
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                        }`}
                      >
                        {num}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
