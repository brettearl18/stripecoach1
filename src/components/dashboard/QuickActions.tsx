import {
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserPlusIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Link from 'next/link'

interface QuickActionsProps {
  onSearchOpen: () => void
  onNotificationsOpen: () => void
}

export function QuickActions({ onSearchOpen, onNotificationsOpen }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Search Trigger */}
      <button
        onClick={onSearchOpen}
        className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      >
        <span className="sr-only">Search</span>
        <MagnifyingGlassIcon className="h-6 w-6" />
      </button>

      {/* Notifications */}
      <button
        onClick={onNotificationsOpen}
        className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      >
        <span className="sr-only">View notifications</span>
        <div className="relative">
          <BellIcon className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
            3
          </span>
        </div>
      </button>

      {/* Quick Add Menu */}
      <Menu as="div" className="relative">
        <Menu.Button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
          <span className="sr-only">Add new</span>
          <PlusIcon className="h-6 w-6" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/coach/clients/new"
                  className={`${
                    active ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                  } group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                >
                  <UserPlusIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  New Client
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/coach/check-ins/new"
                  className={`${
                    active ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                  } group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                >
                  <ClipboardDocumentCheckIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  New Check-in
                </Link>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Keyboard Shortcuts Help */}
      <div className="hidden sm:flex items-center border-l border-gray-200 dark:border-gray-700 ml-4 pl-4">
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-600 dark:text-gray-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </div>
  )
} 