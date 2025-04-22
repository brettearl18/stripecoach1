import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface ProgressPhoto {
  id: string;
  clientId: string;
  clientName: string;
  photoUrl: string;
  date: string;
}

interface RecentProgressPhotosProps {
  photos: ProgressPhoto[];
}

export function RecentProgressPhotos({ photos }: RecentProgressPhotosProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Progress Photos</CardTitle>
          <Button variant="link" asChild>
            <Link href="/coach/progress-photos">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer"
            >
              <Image
                src={photo.photoUrl}
                alt={`Progress photo from ${photo.clientName}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="text-white">
                  <div className="font-medium text-sm">{photo.clientName}</div>
                  <div className="text-xs text-white/80">{photo.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 