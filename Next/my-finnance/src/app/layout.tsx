import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Meu Financeiro - Controle Pessoal',
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

            <nav className="nav-container">
              <p>Menu de navegação aqui</p>
            </nav>
            
            {/* Conteúdo da página */}
            <main className="content">
              {children}
            </main>
          </div>
          
          <footer className="footer">
            <p>© 2024 Meu Financeiro - Projeto educativo Next.js</p>
          </footer>
        </div>
      </body>
    </html>
  );
}