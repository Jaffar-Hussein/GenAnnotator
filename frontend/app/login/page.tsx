"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Github,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
const stepVariants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};
// Rate limiting on the client side
const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 5 * 60 * 1000, // 5 minutes
};

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);

  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState<{
    count: number;
    timestamp: number;
  }>({
    count: 0,
    timestamp: Date.now(),
  });

  // Reset rate limiting after window expires
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - loginAttempts.timestamp >= RATE_LIMIT.windowMs) {
        setLoginAttempts({ count: 0, timestamp: Date.now() });
      }
    }, RATE_LIMIT.windowMs);

    return () => clearTimeout(timer);
  }, [loginAttempts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check rate limiting
    if (loginAttempts.count >= RATE_LIMIT.maxAttempts) {
      const remainingTime = Math.ceil(
        (RATE_LIMIT.windowMs - (Date.now() - loginAttempts.timestamp)) /
          1000 /
          60
      );
      setError(
        `Too many login attempts. Please try again in ${remainingTime} minutes.`
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(formData);

      // Get the redirect path from the URL or default to dashboard
      const from = searchParams.get("from");
      const redirectTo =
        from && !["/login", "/signup", "/"].includes(from)
          ? from
          : "/dashboard";

      router.push(redirectTo);
    } catch (err) {
      setLoginAttempts((prev) => ({
        count: prev.count + 1,
        timestamp: prev.timestamp,
      }));

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen">
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/"
          className="absolute top-4 right-4 md:top-8 md:right-8 z-40 inline-flex items-center 
        justify-center rounded-lg border border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium shadow-sm 
        transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homepage
        </Link>

        {/* Left side - Background and quote */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r dark:border-gray-800">
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
              backgroundPosition: "center 40%",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-900/30 dark:from-gray-900/90 dark:to-gray-900/50" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <span className="text-3xl font-semibold tracking-tight text-white drop-shadow-md">
              Genome Annotator
            </span>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg text-white drop-shadow-md">
                &ldquo;The day when we will be able to receive a full genome
                report as easily as a blood test report will not be far
                away.&rdquo;
              </p>
              <footer className="text-sm text-gray-100 drop-shadow-md">
                Shinya Yamanaka, Nobel Laureate in Physiology or Medicine
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                className="border-0 shadow-lg dark:shadow-2xl dark:shadow-indigo-500/10 
            dark:bg-gray-900/90 dark:backdrop-blur-sm dark:ring-1 dark:ring-inset dark:ring-white/10"
              >
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Welcome back
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="login-form"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="username"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Username
                          </Label>
                          <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full bg-white dark:bg-gray-900 border-gray-200 
              dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400
              focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="password"
                              className="text-gray-700 dark:text-gray-300"
                            >
                              Password
                            </Label>
                            <Link
                              href="/forgot-password"
                              className="text-sm text-indigo-600 hover:text-indigo-500 
                dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                            >
                              Forgot password?
                            </Link>
                          </div>

                          <div className="relative">
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={handleChange}
                              required
                              className="w-full pr-10 bg-white dark:bg-gray-900 border-gray-200 
                dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400
                focus:ring-indigo-500 dark:focus:ring-indigo-400"
                              disabled={loading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent
                text-gray-500 dark:text-gray-400 hover:text-gray-600 
                dark:hover:text-gray-300"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {error && (
                          <Alert
                            className="border border-red-200 dark:border-red-900/50 
            bg-red-50/50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                          >
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertDescription className="font-medium">
                              {error}
                            </AlertDescription>
                          </Alert>
                        )}

                        <Button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 
            dark:hover:bg-indigo-700 text-white"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign in"
                          )}
                        </Button>
                      </motion.div>
                    </AnimatePresence>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="w-full border-gray-200 dark:border-gray-700 
          hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 
          dark:text-gray-300 transition-colors"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-200 dark:border-gray-700 
          hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 
          dark:text-gray-300 transition-colors"
                      >
                        <svg
                          className="mr-2 h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M4.084 3.5C3.486 3.5 3 4.007 3 4.63v14.74c0 .622.486 1.13 1.084 1.13h15.832c.598 0 1.084-.508 1.084-1.13V4.63c0-.623-.486-1.13-1.084-1.13H4.084zM12 17.5c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z" />
                        </svg>
                        ORCID
                      </Button>
                    </div>
                  </form>
                </CardContent>

                <CardFooter>
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center w-full">
                    New to Genome Annotator?{" "}
                    <Link
                      href="/signup"
                      className="font-medium text-indigo-600 hover:text-indigo-500 
                    dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                      Create an account
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
