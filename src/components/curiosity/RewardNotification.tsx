import { motion } from 'motion/react';
import { Trophy, Star, Award, X } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface RewardNotificationProps {
  type: 'points' | 'badge' | 'level-up';
  points?: number;
  badge?: string;
  level?: number;
  onClose: () => void;
}

const badgeLabels: Record<string, string> = {
  'first-learner': 'First Learner',
  'knowledge-seeker': 'Knowledge Seeker',
  'trial-explorer': 'Trial Explorer',
  'perfectionist': 'Perfectionist',
  'curious-mind': 'Curious Mind',
};

export function RewardNotification({ type, points, badge, level, onClose }: RewardNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50 w-96"
    >
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {type === 'points' && (
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-3"
                  >
                    <Star className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">+{points} Points Earned!</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep up the great work!
                    </p>
                  </div>
                </div>
              )}

              {type === 'badge' && badge && (
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="rounded-full bg-gradient-to-br from-purple-400 to-pink-500 p-3"
                  >
                    <Award className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">New Badge Unlocked!</h3>
                    <p className="text-sm text-muted-foreground">
                      {badgeLabels[badge] || badge}
                    </p>
                  </div>
                </div>
              )}

              {type === 'level-up' && level && (
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-3"
                  >
                    <Trophy className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">Level Up!</h3>
                    <p className="text-sm text-muted-foreground">
                      You've reached Level {level}
                    </p>
                  </div>
                </div>
              )}

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 5 }}
                className="mt-4 h-1 rounded-full bg-primary"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
