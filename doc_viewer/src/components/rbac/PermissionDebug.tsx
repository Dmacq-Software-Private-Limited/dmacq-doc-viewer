// src/components/rbac/PermissionsDebug.tsx
import React from "react";
import { useRBAC } from "./RBACProvider";

const PermissionsDebug = () => {
    const { permissions, token, loading, error } = useRBAC();

    if (loading) return <div>Loading permissions from backend...</div>;
    if (error) return <div style={{ color: "red" }}>RBAC error: {error}</div>;

    return (
        <div style={{ margin: "2rem 0", background: "#eee", padding: "1rem" }}>
            <h3>RBAC Debug Info</h3>
            <pre>{JSON.stringify({ token, permissions }, null, 2)}</pre>
        </div>
    );
};

export default PermissionsDebug;
