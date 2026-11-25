import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FísicaLab Virtual Pro | Simuladores y Calculadora',
  description: 'Plataforma interactiva de física con simulaciones visuales en tiempo real, gráficas, calculadora paso a paso y banco colaborativo de ejercicios.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
