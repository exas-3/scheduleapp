import './globals.css';

export const metadata = {
  title: 'ShiftFlow - Διαχείριση Προσωπικού',
  description: 'Εφαρμογή διαχείρισης βαρδιών και προσωπικού',
};

export default function RootLayout({ children }) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  );
}
