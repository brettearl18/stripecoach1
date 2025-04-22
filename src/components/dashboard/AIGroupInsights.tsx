import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface AIGroupInsightsProps {
  lastUpdated: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function AIGroupInsights({ lastUpdated, onRefresh, isLoading }: AIGroupInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>AI Group Insights</CardTitle>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Last updated: {format(new Date(lastUpdated), 'dd/MM/yyyy')}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 px-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh insights</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add your AI insights content here */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sample insights - replace with real data */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h3 className="font-medium mb-2">Group Trends</h3>
                <p className="text-sm text-muted-foreground">
                  85% of clients are showing consistent progress in their fitness goals.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <h3 className="font-medium mb-2">Areas for Attention</h3>
                <p className="text-sm text-muted-foreground">
                  Weekend nutrition adherence has dropped by 15% across the group.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h3 className="font-medium mb-2">Recent Achievements</h3>
                <p className="text-sm text-muted-foreground">
                  12 clients hit new personal records in strength training this week.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 