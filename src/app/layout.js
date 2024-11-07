import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VAC-Connect",
  description: "Secured connection",
  icons: {
    icon: "favicon.ico",
    apple: "Assets/vacLogo.png"
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
