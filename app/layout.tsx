'use client'

import { Comfortaa as AppFont } from "next/font/google";
import "./globals.css";
import Header from "./ui/layout/Header";
import { TomeContextProvider } from "@/context/TomeContext";

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

// export const metadata: Metadata = {
//   title: "Tome",
//   description: "Toto Memory & Knowledge",
// };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <meta name="theme-color" content="#00acc1" />
        <meta name="description" content="Tome app" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* <link
          rel="apple-touch-icon"
          href="/apple-icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        /> */}
        <title>Tome</title>
      </head>
      <body
        className={`${appFont.className} antialiased min-h-screen flex flex-row`}
      >
        <div className="xl:w-[10vw] 2xl:w-[20vw] bg-black opacity-[0.3]">
        </div>
        <div className="w-full xl:w-[80vw] 2xl:w-[60vw] shadow-2xl xl:px-8">
          <div className="">
            <Header />
          </div>
          <TomeContextProvider>
            {children}
          </TomeContextProvider>

        </div>
        <div className="xl:w-[10vw] 2xl:w-[20vw] bg-black opacity-[0.3]">
        </div>
      </body>
    </html>
  );
}
