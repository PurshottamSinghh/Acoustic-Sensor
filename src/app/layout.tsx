import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "P.U.L.S.E. — Predictive Unsupervised Learning Sensor Edge",
  description:
    "P.U.L.S.E. — Predictive Unsupervised Learning Sensor Edge. Industrial IoT platform for intelligent vibration analysis and predictive maintenance using piezoelectric sensing technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
