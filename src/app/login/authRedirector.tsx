"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthRedirector() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    const isLoginPage = pathname === "/login";

    if (!token && !isLoginPage) {
      router.push("/login");
    }

    if (token && isLoginPage) {
      router.push("/vendorslist");
    }
  }, [pathname, router]);

  return null;
}
