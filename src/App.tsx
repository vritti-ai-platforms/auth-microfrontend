import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@vritti/quantum-ui/Sonner';
import { ThemeProvider } from '@vritti/quantum-ui/theme';
import type React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
