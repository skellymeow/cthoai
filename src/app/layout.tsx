import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/sidebar";
import { PageTrackingWrapper } from "@/components/PageTrackingWrapper";
import { SidebarProvider } from "@/components/SidebarProvider";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { ResponsiveMain } from "@/components/ResponsiveMain";
import { AuthProvider } from "@/components/auth/AuthProvider";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "CTHOWork AI - AI Tools Suite",
  description: "Professional AI-powered tools for modern workflows. Create, analyze, and innovate with cutting-edge artificial intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>
          <SidebarProvider>
            <ResponsiveLayout>
              <Sidebar />
              <ResponsiveMain>
                <PageTrackingWrapper>
                  {children}
                </PageTrackingWrapper>
              </ResponsiveMain>
            </ResponsiveLayout>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
