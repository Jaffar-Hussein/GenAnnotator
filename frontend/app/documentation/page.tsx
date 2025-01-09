"use client";
import Link from "next/link";


export default function Documentation() {
  return (
    <div className="relative top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] text-center">
      <h3>Documentation Coming Soon</h3>
      <h4>Check back later for more information.</h4>
        <Link href="/" className="text-primary underline">
            Go back home
        </Link>
    </div>
  );
}
