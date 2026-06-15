"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Desktop: grid-animated sidebar */}
      <div
        className="hidden lg:block overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: sidebarOpen ? "288px" : "0px" }}
      >
        <div className="w-72 h-full">
          <Sidebar isOpen={true} />
        </div>
      </div>

      {/* Mobile: overlay sidebar */}
      {isMobile && (
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <ChatWindow onToggleSidebar={handleToggleSidebar} />
      </main>
    </div>
  );
}
