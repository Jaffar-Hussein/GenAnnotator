import { Link } from "lucide-react";

// app/page.tsx (example)
export default function Page() {
  return (
    <main className="p-4 flex justify-center items-center h-screen">
      <h1>Hello from the Homepage</h1>
      <a href="/dashboard">
      <Link className="h-6 w-6" />
      </a>
    </main>
  );
}
