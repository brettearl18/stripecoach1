"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WeeklyPlanningPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/coach/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Weekly Planning</h1>
      </div>

      <div className="grid gap-6">
        {/* Focus Areas */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Focus Areas</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Nutrition Adherence</h3>
              <p className="text-sm text-muted-foreground mt-1">
                5 clients struggling with meal planning
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">• Sarah Smith - Needs meal alternatives</span>
                  <Button size="sm" variant="outline">Schedule Call</Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">• John Doe - Tracking inconsistently</span>
                  <Button size="sm" variant="outline">Send Reminder</Button>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Workout Consistency</h3>
              <p className="text-sm text-muted-foreground mt-1">
                3 clients need workout adjustments
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">• Mike Johnson - Time management issues</span>
                  <Button size="sm" variant="outline">Modify Plan</Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">• Emily Brown - Equipment limitations</span>
                  <Button size="sm" variant="outline">Adjust Workouts</Button>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Progress Reviews</h3>
              <p className="text-sm text-muted-foreground mt-1">
                4 clients due for monthly review
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">• David Wilson - Monthly check-in due</span>
                  <Button size="sm" variant="outline">Schedule Review</Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">• Lisa Chen - Progress photos needed</span>
                  <Button size="sm" variant="outline">Send Request</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">This Week's Action Items</h2>
            <Button>Add Action Item</Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <span>Review and update meal plans for 3 clients</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <span>Schedule progress review calls with 2 clients</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <span>Create alternative workout plans for home training</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <span>Follow up with clients who missed check-ins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 