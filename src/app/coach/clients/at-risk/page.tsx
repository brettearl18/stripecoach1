"use client";

import { ArrowLeft, AlertTriangle, Clock, TrendingDown, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AtRiskClientsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/coach/dashboard"
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">At-Risk Clients</h1>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6"
        >
          {/* Missed Check-ins Section */}
          <motion.section variants={item} className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-500">
              <Clock className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Missed Check-ins</h2>
            </div>
            <div className="bg-card hover:bg-accent/5 transition-colors rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Mike Johnson</h3>
                  <p className="text-muted-foreground text-sm">Last check-in: 3 weeks ago</p>
                </div>
                <button className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </motion.section>

          {/* Declining Progress Section */}
          <motion.section variants={item} className="space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <TrendingDown className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Declining Progress</h2>
            </div>
            <div className="bg-card hover:bg-accent/5 transition-colors rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Emily Brown</h3>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Missed workouts: 5 this week</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-3/5 bg-red-500 rounded-full" />
                      </div>
                      <span className="text-sm text-muted-foreground">60% adherence</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors">
                  Review
                </button>
              </div>
            </div>
          </motion.section>

          {/* Reported Issues Section */}
          <motion.section variants={item} className="space-y-4">
            <div className="flex items-center gap-2 text-orange-500">
              <AlertCircle className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Reported Issues</h2>
            </div>
            <div className="bg-card hover:bg-accent/5 transition-colors rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">David Wilson</h3>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Reported: Persistent joint pain</p>
                    <p className="text-sm text-orange-500">Status: Needs program adjustment</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors">
                  Adjust Program
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
} 