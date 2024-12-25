import type { Metadata } from "next";
import { Bodoni_Moda as AppFont } from "next/font/google";
import "./globals.css";
import TomeLogo from "./ui/graphics/TomeLogo";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const appFont = AppFont({
  subsets: ["latin"],
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${appFont.className} antialiased min-h-screen flex flex-col`}
      >
        <div className="pt-4">
          <TomeLogo />
        </div>
        <div className="flex flex-1 flex-col justify-start p-6">
          {children}
        </div>
      </body>
    </html>
  );
}