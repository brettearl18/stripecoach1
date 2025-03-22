import { BusinessAvatar } from '@/lib/types/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AvatarCardProps {
  avatar: BusinessAvatar;
  onManage?: (id: string) => void;
}

export function AvatarCard({ avatar, onManage }: AvatarCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{avatar.name}</CardTitle>
        <CardDescription>
          {avatar.niches.join(' • ')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Target Audience</h4>
            <div className="flex flex-wrap gap-2">
              {avatar.targetAudience.clientTypes.map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-gray-800 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
              {avatar.gender.map((g) => (
                <span
                  key={g}
                  className="px-2 py-1 bg-gray-700 rounded-full text-sm"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Coaching Style</h4>
            <p className="text-gray-400">
              {avatar.coachingStyle.communication} • {avatar.coachingStyle.approach.join(', ')}
            </p>
          </div>
          {onManage && (
            <div className="pt-4">
              <Button
                onClick={() => onManage(avatar.id)}
                variant="outline"
                className="w-full"
              >
                Manage Avatar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 