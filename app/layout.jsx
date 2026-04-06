import './globals.css';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

export const metadata = {
  title: 'Lost & Found',
  description: 'Lost and Found dashboard with login and signup.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} font-sans bg-[#050913] text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
