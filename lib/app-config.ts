import { cookies } from 'next/headers';

export const APP_MODE_COOKIE = 'app-mode';

export type AppMode = 'demo' | 'real';

/**
 * Obtiene el modo de la aplicación.
 * Nota: Esta función ya no puede ser usada directamente en componentes de servidor si Next.js requiere await para cookies.
 * Pero para mantener compatibilidad, usaremos un enfoque que no bloquee o se usará en contextos asíncronos.
 */
export const getAppMode = (): AppMode => {
  // En Next.js 15+, cookies() devuelve una promesa. 
  // Intentar acceder sincrónicamente fallará en tiempo de compilación.
  // Por ahora, priorizamos la variable de entorno para estabilidad en la arquitectura modular.
  return process.env.NEXT_PUBLIC_APP_MODE === 'demo' ? 'demo' : 'real';
};

export const isDemoMode = (mode?: AppMode) => {
  const currentMode = mode || getAppMode();
  return currentMode === 'demo';
};

export const tableNames = {
  productos: 'productos',
  salidas: 'salidas',
};

export const architectureStyle = 'modular-monolith-microservice-ready';
