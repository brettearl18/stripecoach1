"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function FormsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forms</h1>
        <Link href="/coach/forms/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Form
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Your Forms</h2>
          <div className="grid gap-4">
            {/* Placeholder for when no forms exist */}
            <div className="text-center py-8 text-muted-foreground">
              <p>No forms created yet.</p>
              <p className="text-sm">Create your first form to get started.</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Templates</h2>
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Initial Assessment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Basic client assessment form with health and fitness goals.
              </p>
              <Button variant="outline" className="mt-4" size="sm">
                Use Template
              </Button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Progress Check-in</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Weekly progress tracking form with measurements and photos.
              </p>
              <Button variant="outline" className="mt-4" size="sm">
                Use Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 