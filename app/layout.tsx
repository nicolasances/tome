'use client'

import "./fonts.css";
import "./globals.css";
import { TomeContextProvider } from "@/context/TomeContext";
import { CarModeContextProvider } from "@/context/CarModeContext";
import { AudioProvider } from "@/context/AudioContext";
import { HeaderProvider } from "@/context/HeaderContext";
import TomeHeader from "@/app/ui/TomeHeader";
import { DesktopSidebar } from "@/app/ui/DesktopSidebar";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/app/ui/AuthGuard";

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></meta>
        <meta name="theme-color" content="#00acc1" />
        <meta name="description" content="Tome app" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* <link
          rel="apple-touch-icon"
          href="/apple-icon?<generated>"
          type="image/<generated>"\
          sizes="<generated>"
        /> */}
        <title>Tome</title>
      </head>
      <body
        style={{ fontFamily: "'Comfortaa', sans-serif" }}
        className="antialiased h-screen flex flex-row"
      >
        <AuthProvider>
          <AuthGuard>
            <SettingsProvider>
              <AudioProvider>
                <CarModeContextProvider>
                  <HeaderProvider>

                    {/* Desktop sidebar */}
                    <div className="hidden lg:flex">
                      <DesktopSidebar />
                    </div>

                    <div className="flex flex-col flex-1 min-w-0 h-screen">
                      {/* Mobile header */}
                      <div className="lg:hidden">
                        <TomeHeader />
                      </div>

                      <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
                        <TomeContextProvider>
                          {children}
                        </TomeContextProvider>
                      </div>
                    </div>

                  </HeaderProvider>
                </CarModeContextProvider>
              </AudioProvider>
            </SettingsProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
