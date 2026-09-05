"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { API_BASE_URL } from "@/lib/env";

type NotificationCountContextValue = {
  count: number;
  resetCount: () => void;
};

const NotificationCountContext = createContext<NotificationCountContextValue | undefined>(
  undefined,
);

type NotificationCountProviderProps = {
  initialCount: number;
  children: ReactNode;
};

// Sumber angka badge: unreadNotificationCount dari GET /notifications/me (fetch awal,
// sekali per navigasi top-level lewat MainLayout), lalu naik live lewat SSE
// /notifications/stream setiap notifyUser() dipanggil di backend. Sengaja TIDAK
// gabung dengan count invitations/swap pending -- itu computed sudah lain, dan
// menggabungkannya berarti request tambahan di setiap page load.
export function NotificationCountProvider({
  initialCount,
  children,
}: NotificationCountProviderProps) {
  const [count, setCount] = useState(initialCount);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!API_BASE_URL) return;

    const source = new EventSource(`${API_BASE_URL}/notifications/stream`, {
      withCredentials: true,
    });
    sourceRef.current = source;

    // Payload SSE berisi notifikasi utuh (lihat notification.controller.ts ->
    // notificationEmitter), tapi badge cuma butuh tahu "ada 1 lagi", jadi cukup
    // increment tanpa parse isi payloadnya.
    source.onmessage = () => {
      setCount((prev) => prev + 1);
    };

    // EventSource otomatis reconnect sendiri kalau koneksi putus (network blip,
    // server restart) -- jangan close manual di sini.
    source.onerror = () => {};

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, []);

  function resetCount() {
    setCount(0);
  }

  return (
    <NotificationCountContext.Provider value={{ count, resetCount }}>
      {children}
    </NotificationCountContext.Provider>
  );
}

export function useNotificationCount(): NotificationCountContextValue {
  const context = useContext(NotificationCountContext);

  if (context === undefined) {
    throw new Error(
      "useNotificationCount must be used within a NotificationCountProvider",
    );
  }

  return context;
}
