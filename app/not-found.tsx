import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">404 - Página No Encontrada</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700 transition-colors shadow-md"
      >
        Volver al Inicio
      </Link>
    </div>
  );
}
