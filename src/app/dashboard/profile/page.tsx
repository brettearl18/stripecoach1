'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile, sendEmailVerification } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await updateProfile({ displayName });
      setMessage('Profile updated successfully');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await sendEmailVerification();
      setVerificationEmailSent(true);
      setMessage('Verification email sent. Please check your inbox.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
          
          <div className="mt-4 max-w-xl text-sm text-gray-500">
            <p>Update your account profile information and manage email verification.</p>
          </div>

          {/* Email Verification Status */}
          <div className="mt-4 p-4 rounded-md bg-gray-50">
            <div className="flex">
              <div className="flex-shrink-0">
                {user?.emailVerified ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">
                  Email Status: {user?.emailVerified ? 'Verified' : 'Not Verified'}
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>{user?.email}</p>
                </div>
                {!user?.emailVerified && !verificationEmailSent && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleSendVerificationEmail}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      Send Verification Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className="mt-4 p-4 rounded-md bg-green-50 text-green-700">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 rounded-md bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="mt-6 space-y-6">
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="display-name"
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your display name"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 