// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Finnance - Controle Pessoal',
  description: 'Aplicativo para controle financeiro pessoal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="app-container">
          <Header />
          
          <div className="main-content">
            <Navigation />
            
            <main className="content">
              {children}
            </main>
          </div>
          
          <footer className="footer">
            <p>© {new Date().getFullYear()} My Finnance - Projeto educativo Next.js</p>
          </footer>
        </div>
      </body>
    </html>
  );
}