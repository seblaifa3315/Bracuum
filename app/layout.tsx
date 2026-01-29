import "./globals.css";
import { Poppins, Orbitron } from "next/font/google";
import type { Metadata } from "next";
import { CartProvider } from "@/lib/context/CartContext";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"), // change to your real domain later

  title: {
    default: "Bracuum - 2-in-1 Vacuum & Cleaning Solution",
    template: "%s | Bracuum",
  },

  description:
    "Bracuum combines vacuuming and brushing in one powerful device, making cleaning faster, smarter, and effortless.",

  keywords: [
    "Bracuum",
    "vacuum cleaner",
    "2-in-1 cleaning",
    "home cleaning",
    "efficient cleaning",
  ],

  authors: [
    { name: "Bracuum Team", url: "https://yourwebsite.com" },
  ],

  icons: {
    icon: "/logo-no-bg-dark.png",
    shortcut: "/logo-no-bg-dark.png",
  },

  openGraph: {
    title: "Bracuum - 2-in-1 Vacuum & Cleaning Solution",
    description:
      "Experience effortless cleaning with Bracuum, the ultimate 2-in-1 vacuum and brush device for your home.",
    url: "https://yourwebsite.com",
    siteName: "Bracuum",
    images: [
      {
        url: "/logo-no-bg-dark.png",
        width: 800,
        height: 600,
        alt: "Bracuum Device",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Bracuum - 2-in-1 Vacuum & Cleaning Solution",
    description:
      "Effortless cleaning made easy with Bracuum, the ultimate home cleaning device.",
    images: ["/logo-no-bg-dark.png"],
    creator: "@BracuumOfficial",
  },
};

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"], // optional
  display: "swap",
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} ${orbitron.variable} font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}