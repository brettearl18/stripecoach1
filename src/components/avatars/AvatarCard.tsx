import { BusinessAvatar } from '@/lib/types/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AvatarCardProps {
  avatar: BusinessAvatar;
  onManage?: (id: string) => void;
}

export function AvatarCard({ avatar, onManage }: AvatarCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {avatar.name}
          {avatar.branding?.colors?.primary && (
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: avatar.branding.colors.primary }}
            />
          )}
        </CardTitle>
        <CardDescription>
          {avatar.niches.join(' • ')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Target Audience</h4>
            <div className="flex flex-wrap gap-2">
              {avatar.clientTypes.map((type) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Coaching Style</h4>
            <div className="flex flex-wrap gap-2">
              {avatar.approachTypes.map((approach) => (
                <Badge key={approach} variant="outline">
                  {approach}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Personality</h4>
            <div className="flex flex-wrap gap-2">
              {avatar.personalityTraits.map((trait) => (
                <Badge key={trait} variant="default">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      {onManage && avatar.id && (
        <CardFooter>
          <Button
            onClick={() => onManage(avatar.id!)}
            variant="outline"
            className="w-full"
          >
            Manage Avatar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 