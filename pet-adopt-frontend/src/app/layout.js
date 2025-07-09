import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./provider";
import Navbar from "./_components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "Pet Adoption App",
  description: "Adopt pets or list them",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
