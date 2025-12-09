/**
 * Service Layer Types
 * 
 * Defines interfaces for all service operations. These interfaces enable:
 * - Dependency injection for testing
 * - Clear contract for external integrations
 * - Decoupling between store and data layer
 */

import type {
  Task,
  FocusSession,
  Distraction,
  Habit,
  Goal,
  Milestone,
  MoodEntry,
  TimeBlock,
  Challenge,
  Achievement,
  UserSettings,
  BlockingSettings,
  Notification,
  TeamMember,
  SharedGoal,
  GroupChallenge,
  SoundPreset,
  Playlist,
} from "../domain"

// ============================================================================
// Common Types
// ============================================================================

/** Result wrapper for async operations */
export interface ServiceResult<T> {
  data: T | null
  error: string | null
}

/** User context for authenticated operations */
export interface UserContext {
  userId: string
  email?: string
}

// ============================================================================
// Auth Service Types
// ============================================================================

export interface AuthUser {
  id: string
  email: string
  name: string | null
  onboardingCompleted: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<ServiceResult<AuthUser>>
  register(credentials: RegisterCredentials): Promise<ServiceResult<AuthUser>>
  logout(): Promise<ServiceResult<void>>
  getCurrentUser(): Promise<ServiceResult<AuthUser>>
  updateUser(updates: Partial<Pick<AuthUser, "name" | "onboardingCompleted">>): Promise<ServiceResult<AuthUser>>
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void
}

// ============================================================================
// Task Service Types
// ============================================================================

export interface CreateTaskInput {
  title: string
  description?: string
  priority: Task["priority"]
  timeEstimate: number
  category?: string
  dueDate?: string
  focusMode?: boolean
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  priority?: Task["priority"]
  timeEstimate?: number
  category?: string
  dueDate?: string | null
  focusMode?: boolean
  completed?: boolean
}

export interface ITaskService {
  getAll(): Promise<ServiceResult<Task[]>>
  getById(id: string): Promise<ServiceResult<Task>>
  create(input: CreateTaskInput): Promise<ServiceResult<Task>>
  update(id: string, input: UpdateTaskInput): Promise<ServiceResult<Task>>
  delete(id: string): Promise<ServiceResult<void>>
  toggleComplete(id: string): Promise<ServiceResult<Task>>
}

// ============================================================================
// Focus Service Types
// ============================================================================

export interface CreateFocusSessionInput {
  duration: number
  completed: boolean
  taskId?: string
}

export interface CreateDistractionInput {
  type: Distraction["type"]
  source: string
  duration: number
  notes?: string
  focusSessionId?: string
}

export interface IFocusService {
  getAllSessions(): Promise<ServiceResult<FocusSession[]>>
  createSession(input: CreateFocusSessionInput): Promise<ServiceResult<FocusSession>>
  getDistractions(): Promise<ServiceResult<Distraction[]>>
  logDistraction(input: CreateDistractionInput): Promise<ServiceResult<Distraction>>
}

// ============================================================================
// Habit Service Types
// ============================================================================

export interface CreateHabitInput {
  name: string
  description?: string
  frequency: Habit["frequency"]
  color: string
}

export interface UpdateHabitInput {
  name?: string
  description?: string
  frequency?: Habit["frequency"]
  color?: string
  completedDates?: string[]
  currentStreak?: number
  longestStreak?: number
}

export interface IHabitService {
  getAll(): Promise<ServiceResult<Habit[]>>
  getById(id: string): Promise<ServiceResult<Habit>>
  create(input: CreateHabitInput): Promise<ServiceResult<Habit>>
  update(id: string, input: UpdateHabitInput): Promise<ServiceResult<Habit>>
  delete(id: string): Promise<ServiceResult<void>>
  toggleCompletion(id: string, date: string): Promise<ServiceResult<Habit>>
}

// ============================================================================
// Goal Service Types
// ============================================================================

export interface CreateGoalInput {
  title: string
  description?: string
  category: string
  targetDate?: string
  color: string
  milestones?: Omit<Milestone, "id">[]
}

export interface UpdateGoalInput {
  title?: string
  description?: string
  category?: string
  targetDate?: string | null
  color?: string
  progress?: number
  status?: Goal["status"]
}

export interface CreateMilestoneInput {
  title: string
  description?: string
  dueDate?: string
  order: number
}

export interface UpdateMilestoneInput {
  title?: string
  description?: string
  dueDate?: string | null
  completed?: boolean
  completedDate?: string | null
  order?: number
}

export interface IGoalService {
  getAll(): Promise<ServiceResult<Goal[]>>
  getById(id: string): Promise<ServiceResult<Goal>>
  create(input: CreateGoalInput): Promise<ServiceResult<Goal>>
  update(id: string, input: UpdateGoalInput): Promise<ServiceResult<Goal>>
  delete(id: string): Promise<ServiceResult<void>>
  addMilestone(goalId: string, input: CreateMilestoneInput): Promise<ServiceResult<Goal>>
  updateMilestone(goalId: string, milestoneId: string, input: UpdateMilestoneInput): Promise<ServiceResult<Goal>>
  deleteMilestone(goalId: string, milestoneId: string): Promise<ServiceResult<Goal>>
  toggleMilestone(goalId: string, milestoneId: string): Promise<ServiceResult<Goal>>
}

// ============================================================================
// Mood Service Types
// ============================================================================

export interface CreateMoodEntryInput {
  mood: MoodEntry["mood"]
  notes?: string
}

export interface IMoodService {
  getAll(): Promise<ServiceResult<MoodEntry[]>>
  getRecent(days: number): Promise<ServiceResult<MoodEntry[]>>
  create(input: CreateMoodEntryInput): Promise<ServiceResult<MoodEntry>>
  delete(id: string): Promise<ServiceResult<void>>
}

// ============================================================================
// Time Block Service Types
// ============================================================================

export interface CreateTimeBlockInput {
  title: string
  startTime: string
  endTime: string
  date: string
  taskId?: string
  color: string
  notes?: string
}

export interface UpdateTimeBlockInput {
  title?: string
  startTime?: string
  endTime?: string
  date?: string
  taskId?: string | null
  color?: string
  notes?: string
}

export interface ITimeBlockService {
  getAll(): Promise<ServiceResult<TimeBlock[]>>
  getByDate(date: string): Promise<ServiceResult<TimeBlock[]>>
  create(input: CreateTimeBlockInput): Promise<ServiceResult<TimeBlock>>
  update(id: string, input: UpdateTimeBlockInput): Promise<ServiceResult<TimeBlock>>
  delete(id: string): Promise<ServiceResult<void>>
}

// ============================================================================
// Challenge Service Types
// ============================================================================

export interface CreateChallengeInput {
  title: string
  description: string
  type: Challenge["type"]
  startDate: string
  endDate: string
  target: number
  metric: Challenge["metric"]
  reward: string
}

export interface UpdateChallengeInput {
  current?: number
  completed?: boolean
}

export interface IChallengeService {
  getAll(): Promise<ServiceResult<Challenge[]>>
  getActive(): Promise<ServiceResult<Challenge[]>>
  create(input: CreateChallengeInput): Promise<ServiceResult<Challenge>>
  update(id: string, input: UpdateChallengeInput): Promise<ServiceResult<Challenge>>
  delete(id: string): Promise<ServiceResult<void>>
}

// ============================================================================
// Achievement Service Types
// ============================================================================

export interface IAchievementService {
  getAll(): Promise<ServiceResult<Achievement[]>>
  getUnlocked(): Promise<ServiceResult<Achievement[]>>
  unlock(achievementId: string): Promise<ServiceResult<Achievement>>
}

// ============================================================================
// Settings Service Types
// ============================================================================

export interface ISettingsService {
  getUserSettings(): Promise<ServiceResult<UserSettings>>
  updateUserSettings(settings: Partial<UserSettings>): Promise<ServiceResult<UserSettings>>
  getBlockingSettings(): Promise<ServiceResult<BlockingSettings>>
  updateBlockingSettings(settings: Partial<BlockingSettings>): Promise<ServiceResult<BlockingSettings>>
}

// ============================================================================
// Notification Service Types
// ============================================================================

export interface CreateNotificationInput {
  type: Notification["type"]
  title: string
  message: string
  actionUrl?: string
}

export interface INotificationService {
  getAll(): Promise<ServiceResult<Notification[]>>
  getUnread(): Promise<ServiceResult<Notification[]>>
  create(input: CreateNotificationInput): Promise<ServiceResult<Notification>>
  markAsRead(id: string): Promise<ServiceResult<void>>
  markAllAsRead(): Promise<ServiceResult<void>>
  delete(id: string): Promise<ServiceResult<void>>
}

// ============================================================================
// Team Service Types
// ============================================================================

export interface CreateTeamMemberInput {
  name: string
  email: string
  role: TeamMember["role"]
}

export interface ITeamService {
  getMembers(): Promise<ServiceResult<TeamMember[]>>
  addMember(input: CreateTeamMemberInput): Promise<ServiceResult<TeamMember>>
  removeMember(id: string): Promise<ServiceResult<void>>
  getSharedGoals(): Promise<ServiceResult<SharedGoal[]>>
  shareGoal(goalId: string, memberId: string): Promise<ServiceResult<SharedGoal>>
  getGroupChallenges(): Promise<ServiceResult<GroupChallenge[]>>
}

// ============================================================================
// Audio Service Types
// ============================================================================

export interface IAudioService {
  getSoundPresets(): Promise<ServiceResult<SoundPreset[]>>
  getPlaylists(): Promise<ServiceResult<Playlist[]>>
  createPlaylist(name: string, soundIds: string[]): Promise<ServiceResult<Playlist>>
  deletePlaylist(id: string): Promise<ServiceResult<void>>
}

// ============================================================================
// Combined Services Interface
// ============================================================================

export interface IServices {
  auth: IAuthService
  tasks: ITaskService
  focus: IFocusService
  habits: IHabitService
  goals: IGoalService
  mood: IMoodService
  timeBlocks: ITimeBlockService
  challenges: IChallengeService
  achievements: IAchievementService
  settings: ISettingsService
  notifications: INotificationService
  team: ITeamService
  audio: IAudioService
}

