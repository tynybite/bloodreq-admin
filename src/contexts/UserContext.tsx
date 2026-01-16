
"use client";

import { createContext, useContext, ReactNode } from "react";

// Define simplified user interface relevant for UI
export interface AdminUser {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
}

interface UserContextType {
    user: AdminUser | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, user }: { children: ReactNode; user: AdminUser | null }) {
    return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
