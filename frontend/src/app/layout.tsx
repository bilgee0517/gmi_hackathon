// applies <html>, <head>, Tailwind classes, providers, etc.
import './globals.css';

export const metadata = { title: 'SynthEd' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900">
        {children}        {/* dashboard layout will be injected further down */}
      </body>
    </html>
  );
}
