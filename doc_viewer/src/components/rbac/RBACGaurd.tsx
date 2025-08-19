// src/components/rbac/RBACGuard.tsx
import React from "react";
import { useRBAC } from "./RBACProvider";

export default function RBACGuard({ permission, children }) {
    const { permissions, loading } = useRBAC();
    if (loading) return null;
    if (!permissions?.[permission]) return null;
    return children;
}
