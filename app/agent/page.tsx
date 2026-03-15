import AgentChat from '@/components/AgentChat';

export default function AgentPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agente de Inteligencia Artificial</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Consulta el estado de tu inventario en tiempo real usando lenguaje natural.
        </p>
      </div>
      <AgentChat />
    </div>
  );
}
