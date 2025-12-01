// src/components/rbac/RBACProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchUserSessionAndPermissions } from "../../services/rbacService";

export const RBACContext = createContext(null);

export const RBACProvider = ({ children }) => {
    const [session, setSession] = useState({ token: null, user: null, permissions: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadPermissions() {
            try {
                const { token, user, permissions } = await fetchUserSessionAndPermissions();
                setSession({ token, user, permissions });
            } catch (e) {
                setError(e.message || "Failed to fetch session/permissions");
            } finally {
                setLoading(false);
            }
        }
        loadPermissions();
    }, []);

    return (
        <RBACContext.Provider value={{ ...session, loading, error }}>
            {children}
        </RBACContext.Provider>
    );
};


// Simple permission hook
export const useRBAC = () => {
    const ctx = useContext(RBACContext);
    if (!ctx) throw new Error("useRBAC must be used within RBACProvider");
    return ctx;
};
