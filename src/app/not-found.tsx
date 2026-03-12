import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-lg text-gray-600">Page not found</p>
      <Link href="/" className="text-blue-600 hover:underline font-medium">
        Go back home
      </Link>
    </div>
  );
}
