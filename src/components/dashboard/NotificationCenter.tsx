import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface Notification {
  id: string
  type: 'alert' | 'update' | 'reminder'
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    href: string
  }
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Missed Check-in',
    message: 'Sarah Wilson has missed their weekly check-in',
    timestamp: new Date().toISOString(),
    read: false,
    action: {
      label: 'Review',
      href: '/coach/check-ins/missed'
    }
  },
  {
    id: '2',
    type: 'update',
    title: 'New Progress Photos',
    message: 'James Thompson has uploaded new progress photos',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    action: {
      label: 'View',
      href: '/coach/clients/progress'
    }
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Weekly Review Due',
    message: '5 client check-ins are pending review',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    action: {
      label: 'Review All',
      href: '/coach/check-ins/pending'
    }
  }
]

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll">
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="p-4 sm:px-6">
                          <div className="flex items-start justify-between">
                            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                              Notifications
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                onClick={onClose}
                              >
                                <span className="sr-only">Close panel</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        {/* Notifications list */}
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {mockNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 sm:px-6 ${
                                notification.read
                                  ? 'bg-white dark:bg-gray-800'
                                  : 'bg-blue-50 dark:bg-blue-900/20'
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${
                                      notification.read
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-blue-900 dark:text-blue-100'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <div className="ml-4 flex-shrink-0">
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {format(new Date(notification.timestamp), 'h:mm a')}
                                      </p>
                                    </div>
                                  </div>
                                  <p className={`mt-1 text-sm ${
                                    notification.read
                                      ? 'text-gray-600 dark:text-gray-300'
                                      : 'text-blue-800 dark:text-blue-200'
                                  }`}>
                                    {notification.message}
                                  </p>
                                  {notification.action && (
                                    <div className="mt-4">
                                      <a
                                        href={notification.action.href}
                                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                                      >
                                        {notification.action.label} →
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="button"
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 