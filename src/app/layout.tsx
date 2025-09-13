import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "희망의 씨앗 캠페인 | 당신의 선택이 누군가에게는 세상의 전부",
  description: "미디어 큐레이션으로 전하는 따뜻한 마음. 나만의 미디어팩을 만들어 희망의 씨앗을 나눠보세요.",
  keywords: ["미디어팩", "캠페인", "큐레이션", "공유", "희망"],
  authors: [{ name: "희망의 씨앗 캠페인" }],
  openGraph: {
    title: "희망의 씨앗 캠페인",
    description: "당신의 선택이 누군가에게는 세상의 전부가 될 수 있습니다.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "희망의 씨앗 캠페인",
    description: "당신의 선택이 누군가에게는 세상의 전부가 될 수 있습니다.",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </body>
    </html>
  );
}
