"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

interface EnhancedAvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string;
  alt?: string;
  fallback?: string;
  fallbackType?: 'initials' | 'firstInitial';
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'away';
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base"
}

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-500",
  away: "bg-yellow-500"
}

const getInitials = (name: string, type: 'initials' | 'firstInitial' = 'initials') => {
  if (!name) return '';
  if (type === 'firstInitial') return name.charAt(0).toUpperCase();
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  EnhancedAvatarProps
>(({ 
  className, 
  src, 
  alt = '', 
  fallback = '', 
  fallbackType = 'initials',
  size = 'md',
  status,
  ...props 
}, ref) => (
  <div className="relative">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && (
        <AvatarImage
          src={src}
          alt={alt}
          className="object-cover"
        />
      )}
      <AvatarFallback
        className={cn(
          "flex h-full w-full items-center justify-center font-medium",
          !src && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200"
        )}
      >
        {getInitials(fallback, fallbackType)}
      </AvatarFallback>
    </AvatarPrimitive.Root>
    {status && (
      <span 
        className={cn(
          "absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-900",
          statusColors[status]
        )}
      />
    )}
  </div>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback } 