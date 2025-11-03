"use client";
import ChatInterface from "@/components/chat/chat-interface";
import ModeToggle from "./theme-mode/page";
import { useEffect } from "react";

export default function Home() {
  // Register service worker for background notifications
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return (
    <div className="relative h-screen">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      <ChatInterface />
    </div>
  );
}
