import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Royal Glitch | Multiplayer Card Battler',
    description: 'Hide behind your mask. Survive the elimination. A dark, atmospheric multiplayer card battler for GGJ 2026.',
    keywords: ['card game', 'multiplayer', 'hearts', 'battle royale', 'game jam'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="bg-dark-bg text-white antialiased min-h-screen overflow-x-hidden">
                {children}
            </body>
        </html>
    );
}
