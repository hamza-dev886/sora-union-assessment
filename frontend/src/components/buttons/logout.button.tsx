"use client";

import { signOut } from "next-auth/react";

export const LogoutButton = () => {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <button onClick={handleLogout} className=" w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium transition-colors">
      Logout
    </button>
  );
};
