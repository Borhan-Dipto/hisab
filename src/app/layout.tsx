import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hisab — COD payout reconciliation",
  description: "Match courier cash-on-delivery payouts against your orders and see what you are still owed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
