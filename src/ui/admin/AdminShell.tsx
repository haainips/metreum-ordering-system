"use client";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email: string; role: string};
}) {

  return (
    <div className="flex gap-4 min-h-screen p-4 bg-zinc-100">
      
        <Sidebar
          role={user.role}
          email={user.email}
        />
        
        <div className="flex flex-col w-full space-y-2">
          <Navbar/>
          <div className="bg-white rounded-xl py-6 px-6 shadow-sm flex-1">
            {children}
          </div>
        </div>
    </div>
  );
}
