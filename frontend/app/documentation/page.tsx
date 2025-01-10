
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Documentation() {
  return (
    <div className="relative top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] text-center">
      <h3 className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500  bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        Documentation Coming Soon
      </h3>
      <h4 className="text-xl text-slate-300 max-w-lg mx-auto mt-8 text-center">
        Check back later for more information.
      </h4>
      <Button
        variant="outline"
        asChild
        className="bg-slate-800 text-slate-200 hover:bg-slate-700 m-5"
      >
        <Link href="/" className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
