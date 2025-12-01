import React, { useState, useEffect } from 'react';

interface Props {
  document: {
    name: string;
    url: string;
  };
}

const MhtViewer: React.FC<Props> = ({ document }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setContent('');

    const fetchMhtContent = async () => {
      try {
        const response = await fetch(document.url);
        if (!response.ok) {
          throw new Error(`Gagal mengambil file MHT: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        setContent(text);

      } catch (err) {
        console.error("MhtViewer error:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui saat memuat file.");
      } finally {
        setLoading(false);
      }
    };

    fetchMhtContent();
  }, [document.url]); 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-600">
        Memuat pratinjau MHT...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500 p-4 text-center">
        <div>
          <p className="font-bold">Gagal Memuat Pratinjau</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  
  return (
    <iframe
      srcDoc={content}
      style={{ width: '100%', height: '100%', border: 'none' }}
      title={document.name}
      sandbox="allow-scripts allow-same-origin" 
    />
  );
};

export default MhtViewer;