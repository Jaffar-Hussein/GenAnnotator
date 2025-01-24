// app/signup/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Github,
  Loader2,
  Mail,
  User,
  Lock,
} from "lucide-react";

const stepVariants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
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

interface FormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirmation: string;
}

interface StepConfig {
  title: string;
  description: string;
  fields: (keyof FormData)[];
  icon: JSX.Element;
  validation: () => string | null;
}

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirmation: "",
  });

  // Updated steps configuration
  const steps: StepConfig[] = [
    {
      title: "Personal Info",
      description: "Start with your name",
      fields: ["first_name", "last_name"],
      icon: <User className="w-5 h-5" />,
      validation: () => {
        if (!formData.first_name) return "First name is required";
        if (!formData.last_name) return "Last name is required";
        return null;
      },
    },
    {
      title: "Account Details",
      description: (
        <div className="space-y-1">
          <p>Choose your username and email</p>
          <p className="text-xs text-muted-foreground">
            Sample usernames: john.doe, j_doe23, johndoe_2024
          </p>
        </div>
      ),
      fields: ["username", "email"],
      icon: <Mail className="w-5 h-5" />,
      validation: () => {
        if (!formData.username) return "Username is required";
        if (!formData.email) return "Email is required";
        if (!formData.email.includes("@")) return "Invalid email format";
        return null;
      },
    },
    {
      title: "Security",
      description: "Create a secure password",
      fields: ["password", "password_confirmation"],
      icon: <Lock className="w-5 h-5" />,
      validation: () => {
        if (!formData.password) return "Password is required";
        if (formData.password.length < 8)
          return "Password must be at least 8 characters";
        if (formData.password !== formData.password_confirmation)
          return "Passwords do not match";
        return null;
      },
    },
  ];

  const passwordConditions = [
    {
      id: 'length',
      label: 'At least 8 characters',
      validator: (password: string) => password.length >= 8
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      validator: (password: string) => /[a-z]/.test(password)
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      validator: (password: string) => /[A-Z]/.test(password)
    },
    {
      id: 'number',
      label: 'One number',
      validator: (password: string) => /\d/.test(password)
    }
  ];

  function generateUsernameSuggestions(
    firstName: string,
    lastName: string
  ): string[] {
    const suggestions = [];
    const sanitizedFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const sanitizedLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const currentYear = new Date().getFullYear().toString().slice(-2);

    suggestions.push(
      `${sanitizedFirst}${sanitizedLast}`,
      `${sanitizedFirst}.${sanitizedLast}`,
      `${sanitizedFirst}_${sanitizedLast}`,
      `${sanitizedFirst}${currentYear}`,
      `${sanitizedFirst}${sanitizedLast}${currentYear}`,
      `${sanitizedFirst[0]}${sanitizedLast}`,
      `${sanitizedLast}${sanitizedFirst}`,
      `${sanitizedFirst}${sanitizedLast}_${currentYear}`
    );

    return [...new Set(suggestions)];
  }
  useEffect(() => {
    if (currentStep === 1 && formData.first_name && formData.last_name) {
      const suggestions = generateUsernameSuggestions(
        formData.first_name,
        formData.last_name
      );
      setUsernameSuggestions(suggestions);
    }
  }, [currentStep, formData.first_name, formData.last_name]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleNext = () => {
    const validationError = steps[currentStep].validation();
    if (validationError) {
      setError(validationError);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    setError(null);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = steps[currentStep].validation();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/"
          className="absolute top-4 right-4 md:top-8 md:right-8 z-40 inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homepage
        </Link>

        {/* Left side - Background image and quote */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
              backgroundPosition: "center 40%",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-900/30 dark:from-gray-900/80 dark:to-gray-900/40" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <span className="text-3xl font-semibold tracking-tight text-white drop-shadow-md">
              Genome Annotator
            </span>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg text-white drop-shadow-md">
                &ldquo;The future of genomics lies in collaborative
                annotation.&rdquo;
              </p>
              <footer className="text-sm text-gray-100 drop-shadow-md">
                Join our community of annotators
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Right side - Sign up form */}
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
            <Card
              className="border-0 shadow-lg dark:shadow-2xl dark:shadow-indigo-500/10 dark:bg-gray-900/90 
 dark:backdrop-blur-sm dark:ring-1 dark:ring-inset dark:ring-white/10"
            >
              <CardHeader>
                {/* Progress steps */}
                <div className="flex items-center justify-between mb-6">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.title}>
                      <div
                        className={`flex flex-col items-center ${
                          currentStep === index
                            ? "text-indigo-600 dark:text-indigo-400"
                            : index < currentStep
                            ? "text-indigo-400 dark:text-indigo-300"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-colors ${
                            index === currentStep
                              ? "border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500 text-white"
                              : index < currentStep
                              ? "border-indigo-400 bg-indigo-50 dark:border-indigo-400/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                              : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {index < currentStep ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        <span className="text-xs font-medium">
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-20 h-[2px] mt-5 transition-colors ${
                            index < currentStep
                              ? "bg-indigo-400 dark:bg-indigo-500"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <CardTitle className="text-2xl font-bold tracking-tight text-foreground dark:text-gray-100">
                  {steps[currentStep].title}
                </CardTitle>

                <CardDescription className="text-muted-foreground dark:text-gray-400">
                  {steps[currentStep].description}
                  {currentStep === 1 && (
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      Examples: john.doe, j_doe23, johndoe_2024
                    </p>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-4"
                    >
                      {steps[currentStep].fields.map((field) => (
                        <div key={field} className="space-y-2">
                          <Label
                            htmlFor={field}
                            className="capitalize text-foreground dark:text-gray-200"
                          >
                            {field.replace("_", " ")}
                          </Label>

                          {field === "username" ? (
                            <div className="space-y-2">
                              <Input
                                id={field}
                                name={field}
                                type="text"
                                placeholder="Choose a username"
                                value={formData[field]}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full bg-background dark:bg-gray-900 dark:border-gray-700 
                  dark:text-gray-100 dark:placeholder:text-gray-400
                  focus:ring-indigo-500 dark:focus:ring-indigo-400
                  disabled:bg-gray-100 dark:disabled:bg-gray-800"
                              />
                              {usernameSuggestions.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
                                    Suggested usernames:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {usernameSuggestions.map((suggestion) => (
                                      <Button
                                        key={suggestion}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs border-gray-200 dark:border-gray-700 
                          hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                          dark:text-gray-300 dark:hover:text-indigo-300
                          transition-colors"
                                        onClick={() => {
                                          setFormData((prev) => ({
                                            ...prev,
                                            username: suggestion,
                                          }));
                                        }}
                                      >
                                        {suggestion}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : field.includes("password") ? (
                            <div className="space-y-2">
                              <div className="relative">
                                <Input
                                  id={field}
                                  name={field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder={
                                    field === "password"
                                      ? "Create password"
                                      : "Confirm password"
                                  }
                                  value={formData[field]}
                                  onChange={handleChange}
                                  className="pr-10 bg-background dark:bg-gray-900 dark:border-gray-700 
                                    dark:text-gray-100 dark:placeholder:text-gray-400
                                    focus:ring-indigo-500 dark:focus:ring-indigo-400
                                    disabled:bg-gray-100 dark:disabled:bg-gray-800"
                                  disabled={loading}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 
                                    hover:bg-transparent dark:text-gray-400 
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
                              
                              {field === "password" && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {passwordConditions.map((condition) => {
                                    const isMet = condition.validator(formData.password);
                                    return (
                                      <div
                                        key={condition.id}
                                        className="flex items-center space-x-2"
                                      >
                                        <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 
                                          transition-colors duration-200 flex items-center justify-center
                                          ${isMet 
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                                            : 'border-gray-300 dark:border-gray-600'
                                          }`}
                                        >
                                          {isMet && (
                                            <Check className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                                          )}
                                        </div>
                                        <span className={`text-xs ${
                                          isMet 
                                            ? 'text-indigo-600 dark:text-indigo-400' 
                                            : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                          {condition.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              
                              {field === "password_confirmation" && formData.password && formData.password_confirmation && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 
                                    transition-colors duration-200 flex items-center justify-center
                                    ${formData.password === formData.password_confirmation
                                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                      : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                  >
                                    {formData.password === formData.password_confirmation && (
                                      <Check className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                                    )}
                                  </div>
                                  <span className={`text-xs ${
                                    formData.password === formData.password_confirmation
                                      ? 'text-indigo-600 dark:text-indigo-400'
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    Passwords match
                                  </span>
                                </div>
                              )}
                            </div>
                          ): (
                            <Input
                              id={field}
                              name={field}
                              type={field === "email" ? "email" : "text"}
                              placeholder={`Enter your ${field.replace(
                                "_",
                                " "
                              )}`}
                              value={formData[field]}
                              onChange={handleChange}
                              disabled={loading}
                              className="w-full bg-background dark:bg-gray-900 dark:border-gray-700 
                dark:text-gray-100 dark:placeholder:text-gray-400
                focus:ring-indigo-500 dark:focus:ring-indigo-400
                disabled:bg-gray-100 dark:disabled:bg-gray-800"
                            />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>

                  {error && (
                    <Alert
                      className="border border-red-200 dark:border-red-900/50 
      bg-red-50/50 dark:bg-red-900/20 
      text-red-800 dark:text-red-200"
                    >
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="font-medium">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                 
                </form>
              </CardContent>

              <CardFooter className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0 || loading}
                  className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800
     text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
     transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep === steps.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 
       dark:hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed
       transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 
       dark:hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed
       transition-colors"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardFooter>

              <div className="px-6 pb-6 pt-2">
                {/* Divider with text */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social login buttons */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 dark:border-gray-700 hover:bg-gray-100 
       dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300
       transition-colors"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-gray-200 dark:border-gray-700 hover:bg-gray-100 
       dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300
       transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4.084 3.5C3.486 3.5 3 4.007 3 4.63v14.74c0 .622.486 1.13 1.084 1.13h15.832c.598 0 1.084-.508 1.084-1.13V4.63c0-.623-.486-1.13-1.084-1.13H4.084zM12 17.5c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z" />
                    </svg>
                    ORCID
                  </Button>
                </div>

                {/* Sign in link */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500 
       dark:text-indigo-400 dark:hover:text-indigo-300
       transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
