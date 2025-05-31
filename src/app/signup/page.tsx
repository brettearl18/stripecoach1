"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/firebase-client";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function SignupPage() {
  const router = useRouter();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      setSuccess("Account created! Please check your email to verify your account.");
      setName("");
      setEmail("");
      setPassword("");
      // Optionally, redirect to dashboard or login
      // router.push('/client/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || "Failed to sign up. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {!showEmailForm ? (
          <>
            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center px-4 py-3 mb-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v2.8h5.35c-.23 1.2-1.4 3.5-5.35 3.5-3.22 0-5.85-2.67-5.85-5.9s2.63-5.9 5.85-5.9c1.83 0 3.06.78 3.76 1.44l2.57-2.5C17.09 3.9 14.72 2.7 12 2.7 6.48 2.7 2 7.18 2 12.7s4.48 10 10 10c5.75 0 9.54-4.03 9.54-9.7 0-.65-.07-1.13-.19-1.6z"/></svg>
              Sign up with Google
            </button>
            <p className="text-center text-gray-400">
              or{' '}
              <button
                type="button"
                className="text-indigo-400 hover:text-indigo-300 underline"
                onClick={() => setShowEmailForm(true)}
              >
                sign up with email
              </button>
            </p>
          </>
        ) : (
          <form onSubmit={handleEmailSignup} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
            <p className="text-center text-gray-400">
              or{' '}
              <button
                type="button"
                className="text-indigo-400 hover:text-indigo-300 underline"
                onClick={() => setShowEmailForm(false)}
              >
                sign up with Google
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}