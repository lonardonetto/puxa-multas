import { useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsLoading(true);
    
    // Simula um pequeno delay para a animação
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoading) {
      setDisplayChildren(children);
    }
  }, [children, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          {/* Spinner animado */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-muted"></div>
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          {/* Texto de carregamento */}
          <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {displayChildren}
    </div>
  );
}
