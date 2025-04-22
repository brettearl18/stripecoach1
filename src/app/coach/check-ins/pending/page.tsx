"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PendingCheckInsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/coach/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Pending Check-ins</h1>
      </div>

      <div className="grid gap-6">
        {/* Client Check-in Cards */}
        <div className="grid gap-4">
          {/* Example Check-in Card */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">John Doe</h3>
                <p className="text-sm text-muted-foreground">Weekly Check-in</p>
                <p className="text-sm mt-2">Submitted: 2 days ago</p>
              </div>
              <Button>Review</Button>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Summary</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Completed all workouts</li>
                <li>• Meeting nutrition goals</li>
                <li>• Reported some knee discomfort</li>
              </ul>
            </div>
          </div>

          {/* Another Example Card */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Sarah Smith</h3>
                <p className="text-sm text-muted-foreground">Monthly Progress Review</p>
                <p className="text-sm mt-2">Submitted: 1 day ago</p>
              </div>
              <Button>Review</Button>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Summary</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• New progress photos added</li>
                <li>• Updated measurements</li>
                <li>• Questions about meal plan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 