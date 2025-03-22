'use client';

import { useState, useEffect } from 'react';
import { CoachProfile } from '@/types/coach';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon, CalendarIcon, ChatBubbleLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function CoachProfilePage() {
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoachProfile();
  }, []);

  const fetchCoachProfile = async () => {
    try {
      const response = await fetch('/api/coach/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch coach profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No profile found</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8">
              <div className="relative h-32 w-32 rounded-full overflow-hidden">
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <p className="mt-1 text-xl text-gray-500">{profile.title}</p>
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">
                      {profile.stats.successRate}% Success Rate
                    </span>
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    <span className="ml-1 text-sm text-gray-600">
                      {profile.stats.totalClients} Clients
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900">About Me</h2>
                <p className="mt-4 text-gray-600">{profile.bio}</p>
              </div>

              {/* Expertise */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900">Expertise</h2>
                <div className="mt-4 space-y-4">
                  {profile.expertise.map((exp, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <h3 className="text-lg font-medium text-gray-900">{exp.category}</h3>
                      <p className="mt-1 text-gray-600">{exp.description}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {exp.yearsOfExperience} years of experience
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900">Client Testimonials</h2>
                <div className="mt-4 space-y-6">
                  {profile.testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-center">
                        {testimonial.clientAvatar && (
                          <div className="relative h-10 w-10 rounded-full overflow-hidden">
                            <Image
                              src={testimonial.clientAvatar}
                              alt={testimonial.clientName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            {testimonial.clientName}
                          </h4>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < testimonial.rating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-gray-600">{testimonial.content}</p>
                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(testimonial.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Packages */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900">Coaching Packages</h2>
                <div className="mt-4 space-y-4">
                  {profile.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`border rounded-lg p-4 ${
                        pkg.isPopular
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <h3 className="text-lg font-medium text-gray-900">{pkg.name}</h3>
                      <p className="mt-1 text-gray-600">{pkg.description}</p>
                      <div className="mt-4">
                        <span className="text-2xl font-bold text-gray-900">
                          ${pkg.price}
                        </span>
                        <span className="text-gray-500">/{pkg.duration}</span>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                        Select Package
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900">Availability</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>Timezone: {profile.availability.timezone}</span>
                  </div>
                  <div className="space-y-2">
                    {profile.availability.workingHours.map((hours, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {hours.day}: {hours.start} - {hours.end}
                      </div>
                    ))}
                  </div>
                  {profile.availability.bookingLink && (
                    <Link
                      href={profile.availability.bookingLink}
                      className="mt-4 block w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-center hover:bg-indigo-700"
                    >
                      Book a Session
                    </Link>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center text-gray-600">
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                    <a href={`mailto:${profile.contactInfo.email}`} className="hover:text-indigo-600">
                      {profile.contactInfo.email}
                    </a>
                  </div>
                  {profile.contactInfo.website && (
                    <div className="flex items-center text-gray-600">
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      <a
                        href={profile.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-600"
                      >
                        {profile.contactInfo.website}
                      </a>
                    </div>
                  )}
                  {profile.socialLinks && profile.socialLinks.length > 0 && (
                    <div className="flex space-x-4">
                      {profile.socialLinks.map((social, index) => (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-indigo-600"
                        >
                          <span className="sr-only">{social.platform}</span>
                          {/* Add social media icons here */}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 