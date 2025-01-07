'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Github, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Signup() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all fields.')
      return
    }

    try {
      console.log('Registering with:', { firstName, lastName, email, password })
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/dashboard')
    } catch (err) {
      setError('Registration failed')
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link 
        href="/" 
        className="absolute top-4 right-4 md:top-8 md:right-8 z-40 inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Homepage
      </Link>

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-cover" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          backgroundPosition: 'center 40%',
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-900/30 dark:from-gray-900/80 dark:to-gray-900/40" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <span className="text-3xl font-semibold tracking-tight text-white drop-shadow-md">Genome Annotator</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-white drop-shadow-md">
              &ldquo;The genome was the first assembly manual for human life. Reading it will give us new power to predict, prevent and treat disease.&rdquo;
            </p>
            <footer className="text-sm text-gray-100 drop-shadow-md">Francis Collins, Nobel Laureate in Medicine</footer>
          </blockquote>
        </div>
      </div>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                <CardDescription>
                  Join our community of researchers and annotators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full">
                    Create account
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" className="w-full">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.084 3.5C3.486 3.5 3 4.007 3 4.63v14.74c0 .622.486 1.13 1.084 1.13h15.832c.598 0 1.084-.508 1.084-1.13V4.63c0-.623-.486-1.13-1.084-1.13H4.084zM12 17.5c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z"/>
                    </svg>
                    ORCID
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground text-center w-full">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

