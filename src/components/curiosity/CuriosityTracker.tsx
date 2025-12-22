import { motion } from 'motion/react';
import { Trophy, Star, TrendingUp, BookOpen, Microscope } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

interface CuriosityTrackerProps {
  curiosityScore: number;
  level: number;
  points: number;
  badges: string[];
}

const badgeIcons: Record<string, { icon: any; label: string; color: string }> = {
  'first-learner': { icon: BookOpen, label: 'First Learner', color: 'text-blue-500' },
  'knowledge-seeker': { icon: Star, label: 'Knowledge Seeker', color: 'text-yellow-500' },
  'trial-explorer': { icon: Microscope, label: 'Trial Explorer', color: 'text-purple-500' },
  'perfectionist': { icon: Trophy, label: 'Perfectionist', color: 'text-green-500' },
  'curious-mind': { icon: TrendingUp, label: 'Curious Mind', color: 'text-indigo-500' },
};

export function CuriosityTracker({ curiosityScore, level, points, badges }: CuriosityTrackerProps) {
  const nextLevelPoints = level * 100;
  const progressPercent = (points % 100);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Curiosity Journey
        </CardTitle>
        <CardDescription>
          Keep exploring to unlock new achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Level {level}</span>
            <span className="text-sm text-muted-foreground">
              {points} / {nextLevelPoints} points
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Curiosity Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-4"
        >
          <Star className="h-6 w-6 text-primary" />
          <div>
            <div className="text-2xl">{curiosityScore}</div>
            <div className="text-xs text-muted-foreground">Curiosity Points</div>
          </div>
        </motion.div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm">Earned Badges</h4>
            <div className="flex flex-wrap gap-2">
              {badges.map((badgeKey, index) => {
                const badge = badgeIcons[badgeKey];
                if (!badge) return null;
                
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={badgeKey}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1, type: 'spring' }}
                  >
                    <Badge variant="secondary" className="gap-1 px-3 py-1">
                      <Icon className={`h-3 w-3 ${badge.color}`} />
                      {badge.label}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2 rounded-lg border bg-card p-3">
          <h4 className="text-sm">Earn More Points:</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Complete questionnaires: +10 points</li>
            <li>• Follow a clinical trial: +3 points</li>
            <li>• Finish education module: up to +100 points</li>
            <li>• Explore research: +5 points</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
