'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">¡Algo salió mal!</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
      </p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700 transition-colors shadow-md"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
