"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type UserInfo = {
  email: string;
  role: string;
};

function decodeJWT(token: string): UserInfo | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      email: payload.email,
      role: payload.role,
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

  const updateUserFromToken = () => {
    const token = localStorage.getItem("vendorToken");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUser(decoded);
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    updateUserFromToken();
  }, [pathname]); // Re-check user info on route change

  useEffect(() => {
    // Listen for login/logout in other tabs
    const handleStorage = () => {
      updateUserFromToken();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 flex items-center justify-between px-6 lg:px-20 py-4 bg-gray-100 shadow-sm">
      <div className="text-xl font-bold text-blue-700">FESTGO</div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-sm text-gray-600">
              {user.email} • {user.role}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-sm cursor-pointer"
            >
              Logout
            </button>
          </>
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
