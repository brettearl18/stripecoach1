'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from './button'
import Image from 'next/image'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      // TODO: Implement actual file upload to storage
      // For now, we'll use a fake delay and URL
      await new Promise(resolve => setTimeout(resolve, 1000))
      const fakeUrl = URL.createObjectURL(file)
      onChange(fakeUrl)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover rounded-lg"
            />
            <button
              onClick={onRemove}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
            <Upload className="w-6 h-6 text-gray-400" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      {!value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-2"
          disabled={isUploading}
          onClick={() => document.querySelector('input[type="file"]')?.click()}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      )}
    </div>
  )
} 