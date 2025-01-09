"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Check, RefreshCw, User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Simulated API call for username suggestions
const getUsernameSuggestions = async (
  firstName: string,
  lastName: string
): Promise<string[]> => {
  const first = firstName.trim().toLowerCase();
  const last = lastName.trim().toLowerCase();
  const firstInitial = first[0];
  const lastInitial = last[0];

  const code = Math.floor(Math.random() * 90 + 10);

  const suggestions = new Set([
    `${first}${lastInitial}${code}`,
    `${firstInitial}${last}${code}`,
    `${first}${last}${code}`,
    `${lastInitial}${first}${code}`,
    `${firstInitial}${lastInitial}${code}`,
  ]);

  return Array.from(suggestions);
};

export default function Signup() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateTab = (tab: string) => {
    const newErrors: Record<string, string> = {};

    if (tab === "personal") {
      if (!formData.first_name.trim())
        newErrors.first_name = "First name is required";
      if (!formData.last_name.trim())
        newErrors.last_name = "Last name is required";
    } else if (tab === "account") {
      if (!formData.username.trim())
        newErrors.username = "Username is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email is invalid";
    } else if (tab === "security") {
      if (!formData.password.trim())
        newErrors.password = "Password is required";
      else if (formData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
      if (!formData.confirmPassword.trim())
        newErrors.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTabChange = (tab: string) => {
    if (validateTab(activeTab)) {
      setActiveTab(tab);
      if (tab === "account" && formData.first_name && formData.last_name) {
        handleGetUsernameSuggestions();
      }
    }
  };

  const handleBack = () => {
    const tabs = ["personal", "account", "security"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };
  const { signup } = useAuthStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTab("security")) return;

    setIsLoading(true);
    try {
      // Use the auth store's signup function
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: "+12125552368",
      });
      const username = formData.username;
      const password = formData.password;

      try {
        const response = await fetch(
          "http://localhost:8000/access/api/login/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Invalid credentials");
        }
        console.log(response);
        const authData = await response.json();

        setAuth(authData);
      } catch (err) {
        setErrors({
          submit:
            err instanceof Error
              ? err.message
              : "Failed to login to your new account. Please try again.",
        });
      }
      setSuccessMessage("Account created successfully!");

      // Add a slight delay before redirecting to ensure the success message is seen
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetUsernameSuggestions = async () => {
    if (!formData.first_name || !formData.last_name) return;

    setIsLoadingSuggestions(true);
    try {
      const suggestions = await getUsernameSuggestions(
        formData.first_name,
        formData.last_name
      );
      setUsernameSuggestions(suggestions);
    } catch (error) {
      console.error("Failed to get username suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const getProgress = () => {
    const steps = ["personal", "account", "security"];
    return ((steps.indexOf(activeTab) + 1) / steps.length) * 100;
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className="absolute top-4 right-4 md:top-8 md:right-8  z-40 inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Homepage
      </Link>

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
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
              &ldquo;The genom e was the first assembly manual for human life.
              Reading it will give us new power to predict, prevent and treat
              disease.&rdquo;
            </p>
            <footer className="text-sm text-gray-100 drop-shadow-md">
              Francis Collins, Nobel Laureate in Medicine
            </footer>
          </blockquote>
        </div>
      </div>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-primary/10">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Create an account
                </CardTitle>
                <CardDescription>
                  Join our community of researchers and annotators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-muted-foreground">
                          {Math.round(getProgress())}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgress()}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="personal"
                      disabled={isLoading}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger
                      value="account"
                      disabled={isLoading}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Account
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      disabled={isLoading}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Security
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit} className="mt-4">
                    <TabsContent value="personal" className="space-y-4">
                      <div className="space-y-4">
                        {/* Replaced grid layout with stacked layout */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="first_name">First name</Label>
                            <Input
                              id="first_name"
                              name="first_name"
                              placeholder="Enter your first name"
                              value={formData.first_name}
                              onChange={handleChange}
                              required
                              className={cn(
                                "transition-colors",
                                errors.first_name
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                              )}
                            />
                            {errors.first_name && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.first_name}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last_name">Last name</Label>
                            <Input
                              id="last_name"
                              name="last_name"
                              placeholder="Enter your last name"
                              value={formData.last_name}
                              onChange={handleChange}
                              required
                              className={cn(
                                "transition-colors",
                                errors.last_name
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                              )}
                            />
                            {errors.last_name && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          className="w-full"
                          onClick={() => handleTabChange("account")}
                        >
                          Continue to Account Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="account" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="username"
                              name="username"
                              placeholder="Enter a username"
                              value={formData.username}
                              onChange={handleChange}
                              required
                              className={cn(
                                "transition-colors",
                                errors.username
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                              )}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleGetUsernameSuggestions}
                              disabled={isLoadingSuggestions}
                            >
                              <RefreshCw
                                className={`h-4 w-4 ${
                                  isLoadingSuggestions ? "animate-spin" : ""
                                }`}
                              />
                            </Button>
                          </div>
                          {errors.username && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.username}
                            </p>
                          )}
                          {usernameSuggestions.length > 0 && (
                            <div className="mt-2">
                              <Label>Suggestions:</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {usernameSuggestions.map(
                                  (suggestion, index) => (
                                    <Button
                                      key={index}
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setFormData({
                                          ...formData,
                                          username: suggestion,
                                        })
                                      }
                                    >
                                      {suggestion}
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={cn(
                              "transition-colors",
                              errors.email
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            )}
                          />
                          {errors.email && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={handleBack}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button
                            type="button"
                            className="flex-1"
                            onClick={() => handleTabChange("security")}
                          >
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={handleChange}
                              placeholder="Enter a password"
                              required
                              className={cn(
                                "pr-10 transition-colors",
                                errors.password
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                          {errors.password && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.password}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Must be at least 8 characters long
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              placeholder="Confirm your password"
                              required
                              className={cn(
                                "pr-10 transition-colors",
                                errors.confirmPassword
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                        {errors.submit && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errors.submit}</AlertDescription>
                          </Alert>
                        )}
                        {successMessage && (
                          <Alert
                            variant="default"
                            className="bg-green-50 text-green-800 border-green-300"
                          >
                            <Check className="h-4 w-4" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>
                              {successMessage}
                            </AlertDescription>
                          </Alert>
                        )}
                        <div className="flex justify-between gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={handleBack}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                              </>
                            ) : (
                              "Create account"
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </form>
                </Tabs>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground text-center w-full">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

