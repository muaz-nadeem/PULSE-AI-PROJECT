"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Users, Target, Trophy, TrendingUp, Share2, UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function TeamCollaboration() {
  const {
    teamMembers,
    sharedGoals,
    groupChallenges,
    goals,
    addTeamMember,
    shareGoal,
    createGroupChallenge,
    getTeamProductivityInsights,
  } = useStore()

  const [showAddMember, setShowAddMember] = useState(false)
  const [showShareGoal, setShowShareGoal] = useState(false)
  const [showCreateChallenge, setShowCreateChallenge] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "partner" as "partner" | "mentor" | "teammate",
  })
  const [selectedGoal, setSelectedGoal] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    target: 10,
    metric: "focus_sessions" as "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress",
    participants: [] as string[],
  })

  const insights = getTeamProductivityInsights()
  const activeGoals = goals.filter((g) => g.status === "active")

  const handleAddMember = () => {
    if (newMember.name.trim() && newMember.email.trim()) {
      addTeamMember({
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        role: newMember.role,
      })
      setNewMember({ name: "", email: "", role: "partner" })
      setShowAddMember(false)
    }
  }

  const handleShareGoal = () => {
    if (selectedGoal && selectedMembers.length > 0) {
      shareGoal(selectedGoal, selectedMembers)
      setSelectedGoal("")
      setSelectedMembers([])
      setShowShareGoal(false)
    }
  }

  const handleCreateChallenge = () => {
    if (newChallenge.title.trim() && newChallenge.participants.length > 0) {
      createGroupChallenge({
        title: newChallenge.title.trim(),
        description: newChallenge.description.trim() || "",
        createdBy: "you",
        participants: newChallenge.participants,
        startDate: new Date(newChallenge.startDate),
        endDate: new Date(newChallenge.endDate),
        target: newChallenge.target,
        metric: newChallenge.metric,
      })
      setNewChallenge({
        title: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        target: 10,
        metric: "focus_sessions",
        participants: [],
      })
      setShowCreateChallenge(false)
    }
  }

  const toggleMemberSelection = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  const toggleChallengeParticipant = (memberId: string) => {
    if (newChallenge.participants.includes(memberId)) {
      setNewChallenge({
        ...newChallenge,
        participants: newChallenge.participants.filter((id) => id !== memberId),
      })
    } else {
      setNewChallenge({
        ...newChallenge,
        participants: [...newChallenge.participants, memberId],
      })
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Team & Collaboration</h1>
            <p className="text-muted-foreground mt-2">Share goals, compete, and stay accountable together</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddMember(true)} variant="outline" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Member
            </Button>
            <Button onClick={() => setShowCreateChallenge(true)} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              New Challenge
            </Button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Team Members</p>
                <p className="text-3xl font-bold text-primary">{teamMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Shared Goals</p>
                <p className="text-3xl font-bold text-accent">{sharedGoals.length}</p>
              </div>
              <Share2 className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Group Challenges</p>
                <p className="text-3xl font-bold text-foreground">{groupChallenges.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Team Focus Time</p>
                <p className="text-3xl font-bold text-foreground">{Math.round(insights.totalFocusTime / 60)}h</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Add Team Member Form */}
        {showAddMember && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Add Team Member</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                <Input
                  placeholder="Enter member name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Role</label>
                <Select
                  value={newMember.role}
                  onValueChange={(value) => setNewMember({ ...newMember, role: value as any })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Accountability Partner</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="teammate">Teammate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMember} className="flex-1 bg-primary hover:bg-primary/90">
                  Add Member
                </Button>
                <Button onClick={() => setShowAddMember(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Share Goal Form */}
        {showShareGoal && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Share Goal</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Select Goal</label>
                <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Choose a goal to share" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeGoals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Select Members</label>
                <div className="space-y-2 p-4 bg-secondary/30 rounded-lg border border-border/50 max-h-64 overflow-y-auto">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No team members yet. Add members first.</p>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 cursor-pointer"
                        onClick={() => toggleMemberSelection(member.id)}
                      >
                        <Checkbox checked={selectedMembers.includes(member.id)} />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleShareGoal} className="flex-1 bg-primary hover:bg-primary/90" disabled={!selectedGoal || selectedMembers.length === 0}>
                  Share Goal
                </Button>
                <Button onClick={() => setShowShareGoal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Create Group Challenge Form */}
        {showCreateChallenge && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Create Group Challenge</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Challenge Title</label>
                <Input
                  placeholder="e.g., Team Focus Week"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description (optional)</label>
                <Input
                  placeholder="Describe the challenge"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={newChallenge.startDate}
                    onChange={(e) => setNewChallenge({ ...newChallenge, startDate: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={newChallenge.endDate}
                    onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
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
                <label className="text-sm font-medium text-foreground mb-2 block">Metric</label>
                <Select
                  value={newChallenge.metric}
                  onValueChange={(value) => setNewChallenge({ ...newChallenge, metric: value as any })}
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
                <label className="text-sm font-medium text-foreground mb-2 block">Participants</label>
                <div className="space-y-2 p-4 bg-secondary/30 rounded-lg border border-border/50 max-h-64 overflow-y-auto">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No team members yet. Add members first.</p>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 cursor-pointer"
                        onClick={() => toggleChallengeParticipant(member.id)}
                      >
                        <Checkbox checked={newChallenge.participants.includes(member.id)} />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateChallenge} className="flex-1 bg-primary hover:bg-primary/90" disabled={newChallenge.participants.length === 0}>
                  Create Challenge
                </Button>
                <Button onClick={() => setShowCreateChallenge(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <Card key={member.id} className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1">{member.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{member.email}</p>
                      <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded capitalize">
                        {member.role}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Shared Goals */}
        {sharedGoals.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Shared Goals</h2>
            {sharedGoals.map((share) => {
              const goal = goals.find((g) => g.id === share.goalId)
              if (!goal) return null

              return (
                <Card key={share.id} className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold text-foreground">{goal.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Shared with {share.sharedWith.length} member{share.sharedWith.length > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">Shared on {formatDate(share.sharedAt)}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Group Challenges */}
        {groupChallenges.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Group Challenges</h2>
            {groupChallenges.map((challenge) => (
              <Card key={challenge.id} className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold text-foreground">{challenge.title}</h3>
                    </div>
                    {challenge.description && <p className="text-muted-foreground mb-2">{challenge.description}</p>}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
                      <span>{challenge.participants.length} participants</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Leaderboard</h4>
                  <div className="space-y-2">
                    {challenge.leaderboard
                      .sort((a, b) => b.score - a.score)
                      .map((entry, idx) => (
                        <div
                          key={entry.userId}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50"
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
                            <span className="font-medium text-foreground capitalize">{entry.userId}</span>
                          </div>
                          <span className="font-bold text-foreground">{entry.score} pts</span>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Team Productivity Insights */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Team Productivity Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Total Focus Time</p>
              <p className="text-2xl font-bold text-foreground">{Math.round(insights.totalFocusTime / 60)} hours</p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Total Tasks</p>
              <p className="text-2xl font-bold text-foreground">{insights.totalTasks}</p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Average Progress</p>
              <p className="text-2xl font-bold text-foreground">{insights.averageProgress}%</p>
            </div>
          </div>
        </Card>

        {/* Empty States */}
        {teamMembers.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No team members yet</h3>
            <p className="text-muted-foreground mb-4">Add accountability partners, mentors, or teammates to get started!</p>
            <Button onClick={() => setShowAddMember(true)} className="gap-2 bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4" />
              Add Your First Team Member
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}


