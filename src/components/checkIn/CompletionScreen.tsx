import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface CompletionScreenProps {
  formTitle: string;
}

export function CompletionScreen({ formTitle }: CompletionScreenProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect after 3 seconds
    const timeout = setTimeout(() => {
      router.push('/client/dashboard');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[400px] flex flex-col items-center justify-center text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 mb-6 rounded-full bg-green-500 flex items-center justify-center"
      >
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-white mb-4"
      >
        Check-in Complete!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-gray-400 mb-8"
      >
        Thank you for completing {formTitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-gray-500"
      >
        Redirecting to dashboard...
      </motion.div>

      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.7, duration: 2.3 }}
        className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-full"
      />
    </motion.div>
  );
} 