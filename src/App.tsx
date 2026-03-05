import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@vritti/quantum-ui/Sonner';
import { ThemeProvider } from '@vritti/quantum-ui/theme';
import type React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRender } from './components/AppRender';
import { AuthProvider } from './providers/AuthProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      throwOnError: true,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRender />
          </AuthProvider>
        </BrowserRouter>
        <Toaster position="bottom-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
