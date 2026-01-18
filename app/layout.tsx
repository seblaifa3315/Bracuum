import "./globals.css";
import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

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
    icon: "/bracuum-fresh.png",
    shortcut: "/bracuum-fresh.png",
  },

  openGraph: {
    title: "Bracuum - 2-in-1 Vacuum & Cleaning Solution",
    description:
      "Experience effortless cleaning with Bracuum, the ultimate 2-in-1 vacuum and brush device for your home.",
    url: "https://yourwebsite.com",
    siteName: "Bracuum",
    images: [
      {
        url: "/bracuum-fresh.png", // becomes absolute using metadataBase
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
    images: ["/bracuum-fresh.png"],
    creator: "@BracuumOfficial",
  },
};

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"], // optional
  display: "swap",
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}