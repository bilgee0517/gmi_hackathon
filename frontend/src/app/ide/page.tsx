'use client';

import { useEffect, useState } from 'react';

const IDEPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a timeout to hide loading state after a reasonable time
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, position: 'relative' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg">Loading Theia IDE...</p>
          </div>
        </div>
      )}
      <iframe
        src="http://localhost:3001"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        title="Theia IDE"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default IDEPage;