interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = 'Carregando...' }: PageLoaderProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner profissional */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="w-14 h-14 rounded-full border-4 border-green-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        
        {/* Barra de progresso animada */}
        <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full animate-loading" 
            style={{ width: '40%' }}
          ></div>
        </div>
        
        {/* Texto */}
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse-soft">{message}</p>
      </div>
    </div>
  );
}
