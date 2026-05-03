import { Poppins } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/app/_component/providers/ReduxProviders';
import QueryProvider from '@/app/_component/providers/Queryprovider';
import AuthInitializer from './_component/providers/AuthInitializer';
import { Toaster } from '@/components/ui/sonner';
import SocketProvider from './_component/providers/SocketProviders';
import { ThemeProvider } from '@/components/theme-provider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Pet4u — Find Your Perfect Pet Companion',
  description: 'Connect with verified shelters and find your perfect pet companion. Smart matching, simple adoption.',
  keywords: 'pet adoption, animal shelter, adopt pets, dogs, cats, pet rescue, India',
  authors: [{ name: 'Pet4u' }],
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans`}>
        <ThemeProvider 
        attribute="class"
        defaultTheme="light"
        enableSytem
        disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
