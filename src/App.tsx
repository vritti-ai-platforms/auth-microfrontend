import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
