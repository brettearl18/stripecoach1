"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateFormPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/coach/forms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create New Form</h1>
      </div>

      <div className="grid gap-6">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Form Details</h2>
          <div className="grid gap-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium mb-1">Form Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter form name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Enter form description..."
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <Button>Add Question</Button>
          </div>
          
          <div className="text-center py-8 text-muted-foreground">
            <p>No questions added yet.</p>
            <p className="text-sm">Click "Add Question" to start building your form.</p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Save as Draft</Button>
          <Button>Publish Form</Button>
        </div>
      </div>
    </div>
  );
} 