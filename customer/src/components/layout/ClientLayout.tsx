'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import MainLayout from './MainLayout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000 }}
      />
      <MainLayout>
        {children}
      </MainLayout>
    </AuthProvider>
  );
};

export default ClientLayout; 