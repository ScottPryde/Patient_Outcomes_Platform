import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Clock, Award, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CuriosityTracker } from '../components/curiosity/CuriosityTracker';
import { apiRequest } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  tags: string[];
  nextModules?: string[];
}

interface ModuleCompletion {
  id: string;
  moduleId: string;
  score: number;
  completedAt: string;
}

export function EducationHub() {
  const { user } = useAuth();
  const [modules, setModules] = useState<EducationModule[]>([]);
  const [completions, setCompletions] = useState<ModuleCompletion[]>([]);
  const [gamification, setGamification] = useState({
    points: 0,
    level: 1,
    badges: [],
    curiosityScore: 0,
    completedEducation: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(null);

  useEffect(() => {
    loadEducationData();
  }, []);

  const loadEducationData = async () => {
    try {
      const [modulesData, progressData] = await Promise.all([
        apiRequest('/education'),
        apiRequest('/user/progress'),
      ]);

      setModules(modulesData);
      setCompletions(progressData.completions || []);
      setGamification(progressData.gamification || {
        points: 0,
        level: 1,
        badges: [],
        curiosityScore: 0,
        completedEducation: [],
      });
    } catch (error) {
      console.error('Error loading education data:', error);
      toast.error('Failed to load education modules');
    } finally {
      setIsLoading(false);
    }
  };

  const isModuleCompleted = (moduleId: string) => {
    return completions.some(c => c.moduleId === moduleId);
  };

  const isModuleLocked = (module: EducationModule) => {
    // Check if prerequisites are met
    // For now, all modules are unlocked
    return false;
  };

  const handleStartModule = (module: EducationModule) => {
    setSelectedModule(module);
  };

  const handleCompleteModule = async (score: number) => {
    if (!selectedModule) return;

    try {
      const response = await apiRequest(`/education/${selectedModule.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          score,
          timeSpent: selectedModule.estimatedTime * 60,
        }),
      });

      toast.success(
        <div className="space-y-1">
          <div className="font-semibold">Module Completed! 🎉</div>
          <div className="text-sm">+{response.pointsEarned} points earned</div>
          {response.newBadges.length > 0 && (
            <div className="text-sm">🏆 New badge unlocked!</div>
          )}
        </div>
      );

      await loadEducationData();
      setSelectedModule(null);
    } catch (error) {
      console.error('Error completing module:', error);
      toast.error('Failed to save progress');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading education modules...</p>
        </div>
      </div>
    );
  }

  if (selectedModule) {
    return (
      <ModuleViewer
        module={selectedModule}
        onComplete={handleCompleteModule}
        onBack={() => setSelectedModule(null)}
      />
    );
  }

  const categorizedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, EducationModule[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Information Hub</h1>
        <p className="text-muted-foreground">
          Learn about patient-reported outcomes, clinical trials, and healthcare research
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Modules</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {Object.entries(categorizedModules).map(([category, categoryModules]) => (
                <div key={category} className="space-y-4">
                  <h3 className="capitalize">{category.replace('-', ' ')}</h3>
                  <div className="grid gap-4">
                    {categoryModules.map((module, index) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        isCompleted={isModuleCompleted(module.id)}
                        isLocked={isModuleLocked(module)}
                        onStart={() => handleStartModule(module)}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="in-progress">
              <div className="text-center py-12 text-muted-foreground">
                No modules in progress
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No completed modules yet
                </div>
              ) : (
                completions.map((completion) => {
                  const module = modules.find(m => m.id === completion.moduleId);
                  if (!module) return null;
                  return (
                    <ModuleCard
                      key={completion.id}
                      module={module}
                      isCompleted={true}
                      isLocked={false}
                      onStart={() => handleStartModule(module)}
                      completion={completion}
                      index={0}
                    />
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <CuriosityTracker
            curiosityScore={gamification.curiosityScore}
            level={gamification.level}
            points={gamification.points}
            badges={gamification.badges}
          />
        </div>
      </div>
    </div>
  );
}

interface ModuleCardProps {
  module: EducationModule;
  isCompleted: boolean;
  isLocked: boolean;
  onStart: () => void;
  completion?: ModuleCompletion;
  index: number;
}

function ModuleCard({ module, isCompleted, isLocked, onStart, completion, index }: ModuleCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-700 dark:text-green-400',
    intermediate: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    advanced: 'bg-red-500/10 text-red-700 dark:text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={isCompleted ? 'border-primary/50 bg-primary/5' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
                {isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                {module.title}
              </CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <Award className="h-4 w-4" />
              <span className="text-sm">{module.points} pts</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={difficultyColors[module.difficulty]} variant="secondary">
              {module.difficulty}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {module.estimatedTime} min
            </Badge>
            {module.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {completion && (
            <div className="space-y-1 rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span>Score: {completion.score}%</span>
                <span className="text-muted-foreground">
                  {new Date(completion.completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={onStart}
            disabled={isLocked}
            className="w-full"
            variant={isCompleted ? 'outline' : 'default'}
          >
            {isLocked ? (
              'Locked'
            ) : isCompleted ? (
              'Review'
            ) : (
              <>
                Start Module <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ModuleViewerProps {
  module: EducationModule;
  onComplete: (score: number) => void;
  onBack: () => void;
}

function ModuleViewer({ module, onComplete, onBack }: ModuleViewerProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const sections = module.content?.sections || [];
  const totalSections = sections.length;

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handleFinish = () => {
    // Calculate score from quiz answers
    const quizSections = sections.filter(s => s.type === 'quiz');
    let correct = 0;
    let total = 0;

    quizSections.forEach((section, idx) => {
      section.questions?.forEach((q, qIdx) => {
        total++;
        const answerKey = idx * 100 + qIdx;
        if (answers[answerKey] === q.correctAnswer) {
          correct++;
        }
      });
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 100;
    onComplete(score);
  };

  const currentSectionData = sections[currentSection];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back to Modules
        </Button>
        <div className="text-sm text-muted-foreground">
          Section {currentSection + 1} of {totalSections}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{module.title}</CardTitle>
          <Progress value={((currentSection + 1) / totalSections) * 100} />
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="mb-4">{currentSectionData?.title}</h3>
            
            {currentSectionData?.type === 'text' && (
              <div className="prose dark:prose-invert max-w-none">
                <p>{currentSectionData.content}</p>
              </div>
            )}

            {currentSectionData?.type === 'quiz' && (
              <div className="space-y-4">
                {currentSectionData.questions?.map((question, qIdx) => (
                  <div key={qIdx} className="space-y-2">
                    <p>{question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option, optIdx) => (
                        <Button
                          key={optIdx}
                          variant={
                            answers[currentSection * 100 + qIdx] === optIdx
                              ? 'default'
                              : 'outline'
                          }
                          className="w-full justify-start"
                          onClick={() =>
                            setAnswers({
                              ...answers,
                              [currentSection * 100 + qIdx]: optIdx,
                            })
                          }
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentSectionData?.type === 'interactive' && (
              <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">{currentSectionData.content}</p>
              </div>
            )}
          </motion.div>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            {currentSection < totalSections - 1 ? (
              <Button onClick={handleNext}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish}>
                Complete Module
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
