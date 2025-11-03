import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "../styles/main.sass";

const Montser = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tour App",
  description: "Super tour application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${Montser.variable} antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
