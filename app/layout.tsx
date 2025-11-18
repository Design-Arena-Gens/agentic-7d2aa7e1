import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agentic Chat",
  description: "AI agent chat powered by Vercel AI SDK",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Agentic Chat</h1>
            <p className="subtitle">Bring your own API key or use mock mode</p>
          </header>
          <main>{children}</main>
          <footer className="footer">Built with Next.js and Vercel AI SDK</footer>
        </div>
      </body>
    </html>
  );
}
