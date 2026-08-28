'use client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { store } from '../../store';
import { initI18n } from '../../lib/i18n';
import { injectStore } from '../../lib/api/client';
import ToastContainer from './Toast';

// Wire Redux store into the API client once at module load time
injectStore(store);

// Initialise i18n once at module load time
initI18n();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }) {
  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastContainer />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </Provider>
  );
}
