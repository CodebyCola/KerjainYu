"use client";

import { createContext, useContext, ReactNode } from "react";
import { User } from "@/types/user";

const SessionContext = createContext<User | null | undefined>(undefined);

type SessionProviderProps = {
    user: User | null;
    children: ReactNode;
};

export function SessionProvider({ user, children }: SessionProviderProps) {
    return (
        <SessionContext.Provider value={user}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession(): User | null {
    const context = useContext(SessionContext);

    if (context === undefined) {
        throw new Error("useSession must be used within a SessionProvider");
    }

    return context;
}