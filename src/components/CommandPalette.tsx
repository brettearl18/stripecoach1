import { Fragment, useState } from 'react'
import { Dialog, Combobox, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

const commands = [
  {
    id: 'new-client',
    name: 'Add New Client',
    shortcut: ['n', 'c'],
    url: '/coach/clients/new'
  },
  {
    id: 'check-ins',
    name: 'View Check-ins',
    shortcut: ['g', 'c'],
    url: '/coach/check-ins'
  },
  {
    id: 'analytics',
    name: 'View Analytics',
    shortcut: ['g', 'a'],
    url: '/coach/analytics'
  },
  {
    id: 'settings',
    name: 'Open Settings',
    shortcut: ['g', 's'],
    url: '/coach/settings'
  }
]

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const filteredCommands = query === ''
    ? commands
    : commands.filter((command) => {
        return command.name.toLowerCase().includes(query.toLowerCase())
      })

  const handleSelect = (command: typeof commands[0]) => {
    router.push(command.url)
    onClose()
  }

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

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox onChange={handleSelect}>
                {({ activeOption }) => (
                  <>
                    <div className="relative">
                      <MagnifyingGlassIcon
                        className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500"
                        aria-hidden="true"
                      />
                      <Combobox.Input
                        className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 sm:text-sm"
                        placeholder="Search commands..."
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </div>

                    {filteredCommands.length > 0 && (
                      <Combobox.Options static className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800 dark:text-gray-200">
                        {filteredCommands.map((command) => (
                          <Combobox.Option
                            key={command.id}
                            value={command}
                            className={({ active }) =>
                              `cursor-default select-none px-4 py-2 ${
                                active ? 'bg-blue-600 text-white' : ''
                              }`
                            }
                          >
                            {({ active }) => (
                              <div className="flex justify-between">
                                <span>{command.name}</span>
                                <span className="ml-4 flex items-center space-x-1">
                                  {command.shortcut.map((key, index) => (
                                    <Fragment key={index}>
                                      <kbd className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                                        active
                                          ? 'bg-blue-500 text-blue-50'
                                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                      }`}>
                                        {key}
                                      </kbd>
                                      {index < command.shortcut.length - 1 && (
                                        <span className={active ? 'text-blue-50' : 'text-gray-500'}>
                                          +
                                        </span>
                                      )}
                                    </Fragment>
                                  ))}
                                </span>
                              </div>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    )}

                    {query !== '' && filteredCommands.length === 0 && (
                      <div className="py-14 px-6 text-center text-sm sm:px-14">
                        <p className="text-gray-900 dark:text-white">
                          No commands found
                        </p>
                      </div>
                    )}
                  </>
                )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 