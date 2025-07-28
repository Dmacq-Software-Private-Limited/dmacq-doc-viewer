import React, { useEffect, useState } from 'react';

const DBViewer = ({ documentUrl }: { documentUrl: string }) => {
    const [tables, setTables] = useState<{ name: string; columns: string[]; rows: any[][] }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDB = async () => {
            try {
                if (documentUrl.toLowerCase().endsWith(".mdb") || documentUrl.toLowerCase().endsWith(".accdb")) {
                    setError("In-browser preview for .mdb/.accdb is not supported. Please convert to a supported format like .sqlite.");
                    setLoading(false);
                    return;
                }

                const res = await fetch(documentUrl);
                if (!res.ok) throw new Error(`Failed to fetch DB file: ${res.statusText}`);
                const buffer = await res.arrayBuffer();

                // Dynamically import sql.js
                const initSqlJs = (await import("sql.js")).default;
                const SQL = await initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` });
                const db = new SQL.Database(new Uint8Array(buffer));

                const tableRes = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
                const tableNames = tableRes[0]?.values?.map(row => row[0] as string) || [];

                if (tableNames.length === 0) {
                    setTables([]);
                } else {
                    const loadedTables = tableNames.map((name) => {
                        const result = db.exec(`SELECT * FROM "${name}" LIMIT 100`)[0];
                        return {
                            name,
                            columns: result?.columns || [],
                            rows: result?.values || [],
                        };
                    });
                    setTables(loadedTables);
                }

                db.close();
            } catch (err) {
                console.error("DBViewer error:", err);
                setError(err instanceof Error ? err.message : "Failed to read database");
            } finally {
                setLoading(false);
            }
        };

        loadDB();
    }, [documentUrl]);

    if (loading) return <div className="text-center p-4">Loading database...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
    if (tables.length === 0) return <div className="text-center p-4">No tables found in the database.</div>;

    return (
        <div className="p-4 space-y-8 bg-gray-50 overflow-auto h-full">
            {tables.map((table) => (
                <div key={table.name}>
                    <h2 className="text-xl font-bold mb-3 text-gray-700">{table.name}</h2>
                    <div className="overflow-auto border border-gray-200 rounded-lg shadow-md">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100">
                            <tr>
                                {table.columns.map((col, i) => (
                                    <th key={i} className="px-4 py-2 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">{col}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {table.rows.map((row, i) => (
                                <tr key={i} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50">
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-4 py-2 border-t border-gray-200 text-sm text-gray-800">{String(cell)}</td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DBViewer;