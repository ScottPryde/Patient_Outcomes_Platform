import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trophy, 
  BookOpen, 
  FlaskConical, 
  ClipboardList,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useNavigate } from 'react-router-dom';

interface QuickStartGuideProps {
  onClose: () => void;
}

const steps = [
  {
    title: 'Welcome to Care-PRO! 🎉',
    description: 'Your journey to better health outcomes starts here.',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p>Care-PRO is a platform designed to:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Track your symptoms and health outcomes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Discover relevant clinical trials</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Learn about patient-reported outcomes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Earn rewards for your curiosity and engagement</span>
          </li>
        </ul>
      </div>
    ),
    action: 'Next',
    link: null,
  },
  {
    title: 'Complete Questionnaires',
    description: 'Share your health experiences through validated assessments',
    icon: ClipboardList,
    content: (
      <div className="space-y-4">
        <p>Questionnaires help you:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Track symptoms over time</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Monitor treatment effectiveness</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Share meaningful data with your care team</span>
          </li>
        </ul>
        <div className="rounded-lg border bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">Earn 10 points for each completed questionnaire!</span>
          </div>
        </div>
      </div>
    ),
    action: 'View Questionnaires',
    link: '/health/prom-history',
  },
  {
    title: 'Explore Clinical Trials',
    description: 'Discover research opportunities that match your interests',
    icon: FlaskConical,
    content: (
      <div className="space-y-4">
        <p>The Trials Hub helps you:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Find trials recruiting near you</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Follow studies you're interested in</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Stay updated on new research</span>
          </li>
        </ul>
        <div className="rounded-lg border bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">Earn 3 curiosity points when you follow a trial!</span>
          </div>
        </div>
      </div>
    ),
    action: 'Browse Trials',
    link: '/trials',
  },
  {
    title: 'Learn & Earn Rewards',
    description: 'Complete education modules to level up',
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <p>The Education Hub offers:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Interactive learning modules</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Quizzes to test your knowledge</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Badges and achievements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Level progression system</span>
          </li>
        </ul>
        <div className="rounded-lg border bg-gradient-to-r from-primary/10 to-purple-500/10 p-3">
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">Earn up to 100 points per module!</span>
          </div>
        </div>
      </div>
    ),
    action: 'Start Learning',
    link: '/education',
  },
];

export function QuickStartGuide({ onClose }: QuickStartGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleAction();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const step = steps[currentStep];
    if (step.link) {
      navigate(step.link);
      onClose();
    } else {
      handleNext();
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <CardContent className="p-8">
            {/* Progress indicators */}
            <div className="mb-6 flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Icon and Title */}
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-2">{currentStepData.title}</h2>
                    <p className="text-muted-foreground">{currentStepData.description}</p>
                  </div>
                </div>

                {/* Step content */}
                <div className="pl-16">{currentStepData.content}</div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-6">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                      Skip
                    </Button>
                    <Button onClick={handleAction}>
                      {currentStepData.action}
                      {currentStep < steps.length - 1 && (
                        <ChevronRight className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
