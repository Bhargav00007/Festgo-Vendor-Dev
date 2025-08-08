"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type UserInfo = {
  email: string;
  role: string;
  username?: string;
  number?: string;
};

function decodeJWT(token: string): UserInfo | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      email: payload.email,
      role: payload.role,
      username: payload.username,
      number: payload.number,
    };
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateUserFromToken = () => {
    const token = localStorage.getItem("vendorToken");
    if (token) {
      const userData = localStorage.getItem("logindata");
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUser({
          email: parsedData.user.email,
          role: parsedData.user.role,
          username: parsedData.user.username,
          number: parsedData.user.number,
        });
      } else {
        const decodedUser = decodeJWT(token);
        setUser(decodedUser);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    updateUserFromToken();
  }, [pathname]);

  useEffect(() => {
    const handleStorage = () => updateUserFromToken();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = () => router.push("/login");

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    setUser(null);
    router.push("/login");
  };

  // ❗️Hide Navbar completely on login page
  if (pathname === "/login") return null;

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-6 lg:px-20 py-4 bg-gray-100 shadow-sm z-50">
      <div className="text-2xl font-bold text-blue-700 ml-8 lg:ml-0">
        FESTGO
      </div>

      <div className="flex items-center gap-4 relative">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <img
              src="/profiles/user-4.jpg"
              alt=""
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300"
              onClick={() => setShowDropdown((prev) => !prev)}
            />

            {showDropdown && (
              <div className="absolute right-2 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-sm z-50 p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  User Profile
                </h3>
                <div className="flex items-center gap-4">
                  <img
                    src="/profiles/user-4.jpg"
                    alt=""
                    className="w-20 h-20 rounded-full border-2 border-gray-300"
                  />
                  <div className="text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">Username:</span>{" "}
                      {user.username || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {user.email}
                    </p>
                    <p>
                      <span className="font-semibold">Number:</span>{" "}
                      {user.number || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Role:</span> {user.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm w-full cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm cursor-pointer"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
