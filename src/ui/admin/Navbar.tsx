"use client";

import Clock from "../dashboard/Clock";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between bg-white rounded-xl backdrop-blur shadow-sm">
      <div className="w-full px-8">
        <div className="flex h-14 w-full items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2">
            <h1 className="ml-1 text-lg font-bold text-black">
              
            </h1>
          </div>

          {/* Right */}
          <Clock />
        </div>
      </div>
    </header>
  );
}
