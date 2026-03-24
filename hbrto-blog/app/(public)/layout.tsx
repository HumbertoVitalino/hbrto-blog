import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400">
            Dev Journal
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-12">
        {children}
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 Dev Journal. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  );
}
