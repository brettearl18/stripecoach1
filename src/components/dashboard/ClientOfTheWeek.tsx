import { Star, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ClientOfTheWeekProps {
  client: {
    name: string;
    achievement: string;
    weekNumber: number;
    stats: {
      workouts: { completed: number; total: number; change: number };
      nutrition: { percentage: number; change: number };
      steps: { average: number; change: number };
    };
  };
}

export function ClientOfTheWeek({ client }: ClientOfTheWeekProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-300" />
            <CardTitle>Client of the Week</CardTitle>
          </div>
          <span className="text-sm opacity-80">Week {client.weekNumber}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {client.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{client.name}</h3>
                <p className="text-sm opacity-80">{client.achievement}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <h4 className="text-sm opacity-80">Workouts</h4>
              <div className="text-xl font-semibold">
                {client.stats.workouts.completed}/{client.stats.workouts.total}
              </div>
              <div className="text-sm text-green-300">
                +{client.stats.workouts.change} from last week
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm opacity-80">Nutrition</h4>
              <div className="text-xl font-semibold">
                {client.stats.nutrition.percentage}%
              </div>
              <div className="text-sm text-green-300">
                +{client.stats.nutrition.change}% from last week
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm opacity-80">Steps</h4>
              <div className="text-xl font-semibold">
                {(client.stats.steps.average / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-green-300">
                +{client.stats.steps.change} avg
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 