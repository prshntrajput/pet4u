import { Inter } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/app/_component/providers/ReduxProviders';
import QueryProvider from '@/app/_component/providers/Queryprovider';
import AuthInitializer from './_component/providers/AuthInitializer';
import { Toaster } from '@/components/ui/sonner';
import SocketProvider from './_component/providers/SocketProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PET4U - Find Your Perfect Pet Companion',
  description: 'Connect with pet shelters and find your perfect pet companion. Adopt, don\'t shop!',
  keywords: 'pet adoption, animal shelter, adopt pets, dogs, cats, pet rescue',
  authors: [{ name: 'PET4U Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <AuthInitializer>
          <QueryProvider>
            <SocketProvider>
            {children}
            <Toaster position="top-right" richColors />
            </SocketProvider>
          </QueryProvider>
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
