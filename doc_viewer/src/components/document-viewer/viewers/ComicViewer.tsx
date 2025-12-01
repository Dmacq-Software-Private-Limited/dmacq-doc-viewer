import React, { useEffect, useState } from 'react';

const ComicViewer = ({ documentUrl, documentName }: { documentUrl: string, documentName: string }) => {
    const [images, setImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (documentName.toLowerCase().endsWith(".cbr")) {
            setError("In-browser preview for .cbr (RAR archives) is not supported. Please use .cbz (ZIP archives).");
            setLoading(false);
            return;
        }

        const loadComic = async () => {
            try {
                const res = await fetch(documentUrl);
                if (!res.ok) throw new Error(`Failed to fetch comic: ${res.statusText}`);
                const blob = await res.blob();

                // Dynamically import jszip
                const JSZip = (await import("jszip")).default;
                const zip = await JSZip.loadAsync(blob);

                const imageFiles = Object.values(zip.files)
                    .filter(file => !file.dir && /\.(jpe?g|png|webp|gif)$/i.test(file.name))
                    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

                if (imageFiles.length === 0) {
                    throw new Error("No image files found in the CBZ archive.");
                }

                const imageUrls = await Promise.all(
                    imageFiles.map(file => file.async("base64").then(base64 => `data:image/jpeg;base64,${base64}`))
                );
                setImages(imageUrls);
            } catch (err) {
                console.error("ComicViewer error:", err);
                setError(err instanceof Error ? err.message : "Failed to load comic book");
            } finally {
                setLoading(false);
            }
        };
        loadComic();
    }, [documentUrl, documentName]);

    if (loading) return <div className="text-center p-4">Loading comic pages...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div className="p-4 flex flex-col items-center bg-gray-800 overflow-auto h-full">
            {images.map((img, idx) => (
                <img
                    key={idx}
                    src={img}
                    alt={`Page ${idx + 1}`}
                    className="mb-4 shadow-lg rounded max-w-full"
                    style={{ maxWidth: '80vw' }}
                />
            ))}
        </div>
    );
};

export default ComicViewer;