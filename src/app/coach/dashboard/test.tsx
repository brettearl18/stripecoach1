'use client';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function TestAvatar() {
  return (
    <div className="p-4">
      <Avatar>
        <AvatarImage src="/avatars/sarah.jpg" alt="Sarah W." />
        <AvatarFallback>SW</AvatarFallback>
      </Avatar>
    </div>
  );
} 