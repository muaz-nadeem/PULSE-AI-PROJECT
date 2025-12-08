"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Music, Play, Pause, Volume2, ExternalLink } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function FocusSounds() {
  const { soundPresets, playlists, currentPlaylist, addPlaylist, deletePlaylist, setCurrentPlaylist, addSoundPreset } = useStore()
  const [showAddPlaylist, setShowAddPlaylist] = useState(false)
  const [showAddPreset, setShowAddPreset] = useState(false)
  const [playingSound, setPlayingSound] = useState<string | null>(null)
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    sounds: [] as string[],
  })
  const [newPreset, setNewPreset] = useState({
    name: "",
    type: "custom" as "white_noise" | "ambient" | "nature" | "focus" | "custom",
    url: "",
    icon: "🎵",
  })

  const handleAddPlaylist = () => {
    if (newPlaylist.name.trim() && newPlaylist.sounds.length > 0) {
      addPlaylist({
        name: newPlaylist.name.trim(),
        sounds: newPlaylist.sounds,
      })
      setNewPlaylist({ name: "", sounds: [] })
      setShowAddPlaylist(false)
    }
  }

  const handleAddPreset = () => {
    if (newPreset.name.trim()) {
      addSoundPreset({
        name: newPreset.name.trim(),
        type: newPreset.type,
        url: newPreset.url.trim() || undefined,
        icon: newPreset.icon,
      })
      setNewPreset({ name: "", type: "custom", url: "", icon: "🎵" })
      setShowAddPreset(false)
    }
  }

  const toggleSoundInPlaylist = (soundId: string) => {
    if (newPlaylist.sounds.includes(soundId)) {
      setNewPlaylist({ ...newPlaylist, sounds: newPlaylist.sounds.filter((id) => id !== soundId) })
    } else {
      setNewPlaylist({ ...newPlaylist, sounds: [...newPlaylist.sounds, soundId] })
    }
  }

  const handlePlaySound = (soundId: string) => {
    if (playingSound === soundId) {
      setPlayingSound(null)
    } else {
      setPlayingSound(soundId)
    }
  }

  const ICONS = ["🎵", "🌊", "🌧️", "🌲", "☕", "🔥", "🎹", "🎸", "🎻", "🎤", "🎧", "🎼"]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Focus Sounds</h1>
            <p className="text-muted-foreground mt-2">Enhance your focus sessions with ambient sounds and music</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddPreset(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Sound
            </Button>
            <Button onClick={() => setShowAddPlaylist(true)} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              New Playlist
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sound Presets</p>
                <p className="text-3xl font-bold text-primary">{soundPresets.length}</p>
              </div>
              <Music className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Playlists</p>
                <p className="text-3xl font-bold text-accent">{playlists.length}</p>
              </div>
              <Volume2 className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Playlist</p>
                <p className="text-lg font-bold text-foreground truncate">
                  {currentPlaylist ? playlists.find((p) => p.id === currentPlaylist)?.name || "None" : "None"}
                </p>
              </div>
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Add Sound Preset Form */}
        {showAddPreset && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Add Custom Sound</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Sound Name</label>
                <Input
                  placeholder="e.g., Lofi Hip Hop, Rainforest"
                  value={newPreset.name}
                  onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                  <select
                    value={newPreset.type}
                    onChange={(e) => setNewPreset({ ...newPreset, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground"
                  >
                    <option value="white_noise">White Noise</option>
                    <option value="ambient">Ambient</option>
                    <option value="nature">Nature</option>
                    <option value="focus">Focus</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewPreset({ ...newPreset, icon })}
                        className={`text-2xl p-2 rounded border-2 ${
                          newPreset.icon === icon ? "border-primary" : "border-transparent"
                        } hover:border-primary/50`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  URL (Spotify/YouTube or direct link)
                </label>
                <Input
                  placeholder="https://open.spotify.com/... or https://youtube.com/..."
                  value={newPreset.url}
                  onChange={(e) => setNewPreset({ ...newPreset, url: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste a Spotify or YouTube link, or a direct audio file URL
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddPreset} className="flex-1 bg-primary hover:bg-primary/90">
                  Add Sound
                </Button>
                <Button onClick={() => setShowAddPreset(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Add Playlist Form */}
        {showAddPlaylist && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Create Playlist</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Playlist Name</label>
                <Input
                  placeholder="e.g., Deep Focus, Morning Energy"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Select Sounds</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-4 bg-secondary/30 rounded-lg border border-border/50">
                  {soundPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 cursor-pointer"
                      onClick={() => toggleSoundInPlaylist(preset.id)}
                    >
                      <Checkbox checked={newPlaylist.sounds.includes(preset.id)} />
                      <span className="text-2xl">{preset.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{preset.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{preset.type.replace("_", " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddPlaylist} className="flex-1 bg-primary hover:bg-primary/90">
                  Create Playlist
                </Button>
                <Button onClick={() => setShowAddPlaylist(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Sound Presets */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Sound Presets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {soundPresets.map((preset) => (
              <Card
                key={preset.id}
                className={`p-6 border-2 cursor-pointer transition-all ${
                  playingSound === preset.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handlePlaySound(preset.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{preset.icon}</div>
                  {playingSound === preset.id ? (
                    <Pause className="w-5 h-5 text-primary" />
                  ) : (
                    <Play className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-bold text-foreground mb-1">{preset.name}</h3>
                <p className="text-sm text-muted-foreground capitalize mb-2">{preset.type.replace("_", " ")}</p>
                {preset.url && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ExternalLink className="w-4 h-4" />
                    <span className="truncate">
                      {preset.url.includes("spotify") ? "Spotify" : preset.url.includes("youtube") ? "YouTube" : "External link"}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Playlists */}
        {playlists.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Your Playlists</h2>
            {playlists.map((playlist) => {
              const playlistSounds = soundPresets.filter((s) => playlist.sounds.includes(s.id))
              const isActive = currentPlaylist === playlist.id

              return (
                <Card
                  key={playlist.id}
                  className={`p-6 border-2 ${
                    isActive ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Music className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold text-foreground">{playlist.name}</h3>
                        {isActive && (
                          <span className="px-2 py-1 text-xs font-semibold bg-primary text-white rounded">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{playlistSounds.length} sounds</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPlaylist(isActive ? undefined : playlist.id)}
                        className="gap-2"
                      >
                        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isActive ? "Stop" : "Play"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePlaylist(playlist.id)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {playlistSounds.map((sound) => (
                      <div
                        key={sound.id}
                        className="flex items-center gap-2 px-3 py-1 bg-secondary/30 rounded-full border border-border/50"
                      >
                        <span>{sound.icon}</span>
                        <span className="text-sm text-foreground">{sound.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {playlists.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No playlists yet</h3>
            <p className="text-muted-foreground mb-4">Create a playlist to organize your favorite focus sounds!</p>
            <Button onClick={() => setShowAddPlaylist(true)} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Create Your First Playlist
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}

