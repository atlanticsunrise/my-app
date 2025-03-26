import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Welcome to CareerConnect!</h1>
      <p className="mb-4">Your journey to finding the perfect career starts here.</p>
      <div className="space-x-4">
        <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Login
        </Link>
        <Link href="/register" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Register
        </Link>
      </div>
       {/* Later, show dashboard link if logged in */}
    </div>
  );
}
