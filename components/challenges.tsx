"use client"

import { useState, useEffect } from "react"
import { useStore, type Challenge } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trophy, Target, Award, Users, TrendingUp, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

export default function Challenges() {
  const {
    challenges,
    achievements,
    addChallenge,
    updateChallengeProgress,
    checkAchievements,
    getUnlockedAchievements,
    getLeaderboard,
    focusSessions,
    tasks,
    habits,
    goals,
  } = useStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    type: "weekly" as "weekly" | "monthly",
    target: 10,
    metric: "focus_sessions" as "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress",
    reward: "",
  })

  const unlockedAchievements = getUnlockedAchievements()
  const leaderboard = getLeaderboard()
  const activeChallenges = challenges.filter((c) => !c.completed && new Date(c.endDate) >= new Date())
  const completedChallenges = challenges.filter((c) => c.completed)

  useEffect(() => {
    // Update challenge progress and check achievements
    challenges.forEach((challenge) => {
      updateChallengeProgress(challenge.id)
    })
    checkAchievements()
  }, [focusSessions.length, tasks.length, habits.length, goals.length])

  const handleAddChallenge = () => {
    if (newChallenge.title.trim()) {
      const today = new Date()
      const endDate = new Date(today)
      if (newChallenge.type === "weekly") {
        endDate.setDate(today.getDate() + 7)
      } else {
        endDate.setMonth(today.getMonth() + 1)
      }

      addChallenge({
        title: newChallenge.title.trim(),
        description: newChallenge.description.trim() || "",
        type: newChallenge.type,
        startDate: today,
        endDate,
        target: newChallenge.target,
        metric: newChallenge.metric,
        reward: newChallenge.reward.trim() || "",
      })

      setNewChallenge({
        title: "",
        description: "",
        type: "weekly",
        target: 10,
        metric: "focus_sessions",
        reward: "",
      })
      setShowAddForm(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "focus_sessions":
        return "Focus Sessions"
      case "tasks_completed":
        return "Tasks Completed"
      case "habits_streak":
        return "Habit Streak Days"
      case "goals_progress":
        return "Goals Progress %"
      default:
        return metric
    }
  }

  const totalScore = leaderboard.find((l) => l.userId === "you")?.score || 0

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Challenges & Achievements</h1>
            <p className="text-muted-foreground mt-2">Compete, achieve, and level up your productivity</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            New Challenge
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                <p className="text-3xl font-bold text-primary">{totalScore}</p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Achievements</p>
                <p className="text-3xl font-bold text-accent">
                  {unlockedAchievements.length} / {achievements.length}
                </p>
              </div>
              <Award className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Challenges</p>
                <p className="text-3xl font-bold text-foreground">{activeChallenges.length}</p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-foreground">{completedChallenges.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Add Challenge Form */}
        {showAddForm && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Create New Challenge</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Challenge Title</label>
                <Input
                  placeholder="e.g., Complete 20 Focus Sessions This Week"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description (optional)</label>
                <Input
                  placeholder="Describe your challenge"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                  <Select
                    value={newChallenge.type}
                    onValueChange={(value) => setNewChallenge({ ...newChallenge, type: value as "weekly" | "monthly" })}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Metric</label>
                  <Select
                    value={newChallenge.metric}
                    onValueChange={(value) =>
                      setNewChallenge({ ...newChallenge, metric: value as Challenge["metric"] })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="focus_sessions">Focus Sessions</SelectItem>
                      <SelectItem value="tasks_completed">Tasks Completed</SelectItem>
                      <SelectItem value="habits_streak">Habit Streak</SelectItem>
                      <SelectItem value="goals_progress">Goals Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Target</label>
                  <Input
                    type="number"
                    min="1"
                    value={newChallenge.target}
                    onChange={(e) => setNewChallenge({ ...newChallenge, target: Number.parseInt(e.target.value) || 0 })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Reward (optional)</label>
                <Input
                  placeholder="e.g., Treat yourself to coffee, Watch a movie"
                  value={newChallenge.reward}
                  onChange={(e) => setNewChallenge({ ...newChallenge, reward: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddChallenge} className="flex-1 bg-primary hover:bg-primary/90">
                  Create Challenge
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Leaderboard */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
          </div>
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  entry.userId === "you"
                    ? "bg-primary/10 border-primary/50"
                    : "bg-secondary/30 border-border/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === 0
                        ? "bg-yellow-500 text-white"
                        : idx === 1
                          ? "bg-gray-400 text-white"
                          : idx === 2
                            ? "bg-orange-500 text-white"
                            : "bg-secondary text-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground capitalize">{entry.userId === "you" ? "You" : entry.userId}</p>
                    <p className="text-sm text-muted-foreground">Rank #{entry.rank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{entry.score} pts</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Active Challenges</h2>
            {activeChallenges.map((challenge) => {
              const progress = (challenge.current / challenge.target) * 100
              const daysRemaining = getDaysRemaining(challenge.endDate)

              return (
                <Card key={challenge.id} className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold text-foreground">{challenge.title}</h3>
                        <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded capitalize">
                          {challenge.type}
                        </span>
                      </div>
                      {challenge.description && <p className="text-muted-foreground mb-2">{challenge.description}</p>}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Ends: {formatDate(challenge.endDate)}</span>
                        <span className={daysRemaining < 3 ? "text-orange-500" : ""}>
                          {daysRemaining} days left
                        </span>
                        {challenge.reward && (
                          <span className="text-primary">Reward: {challenge.reward}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {getMetricLabel(challenge.metric)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {challenge.current} / {challenge.target}
                      </span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Completed Challenges</h2>
            {completedChallenges.map((challenge) => (
              <Card key={challenge.id} className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed {formatDate(challenge.endDate)} • {challenge.current} / {challenge.target}{" "}
                      {getMetricLabel(challenge.metric)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Achievements */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = achievement.unlockedAt !== undefined
              return (
                <Card
                  key={achievement.id}
                  className={`p-6 border-2 ${
                    isUnlocked
                      ? "bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/50"
                      : "bg-card border-border opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{isUnlocked ? achievement.icon : "🔒"}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      {isUnlocked && achievement.unlockedAt && (
                        <p className="text-xs text-muted-foreground">
                          Unlocked {formatDate(achievement.unlockedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Empty States */}
        {challenges.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No challenges yet</h3>
            <p className="text-muted-foreground mb-4">Create your first challenge to boost your productivity!</p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Create Your First Challenge
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}

