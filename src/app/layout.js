import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VAC-Connect",
  description: "Secured connection",
  icons: {
    icon: "Assets/vacLogo.png",
    apple: "Assets/vacLogo.png"

  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="icon" href="./Assets/vacLogo.png" sizes="any" />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
