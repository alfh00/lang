"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { studentApi } from "@/lib/userClient"

const FOCUS_SKILLS = [
  "spoken",
  "listening",
  "writing",
  "reading",
  "pronunciation",
  "grammar",
  "vocabulary",
]

const LEARNING_STYLES = [
  "structured_exercises",
  "conversation_heavy",
  "homework_heavy",
  "exam_driven",
  "project_based",
]

const CEFR_LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"]
const PREPARING_FOR = ["college_admission", "current_college", "job", "exam", "other"]
const TARGET_FIELDS = ["art", "cooking", "business", "engineering", "general", "other"]
const HOMEWORK_PREFS = ["none", "light", "standard", "intensive"]

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

  const [fullName, setFullName] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [cefrLevel, setCefrLevel] = useState("")
  const [preparingFor, setPreparingFor] = useState("")
  const [targetField, setTargetField] = useState("")
  const [targetFieldOther, setTargetFieldOther] = useState("")
  const [targetStartDate, setTargetStartDate] = useState("")
  const [targetStartDateUnknown, setTargetStartDateUnknown] = useState(false)
  const [focusSkills, setFocusSkills] = useState<string[]>([])
  const [learningStyle, setLearningStyle] = useState<string[]>([])
  const [weeklyTimeBudget, setWeeklyTimeBudget] = useState("")
  const [preferredSessionDuration, setPreferredSessionDuration] = useState("")
  const [booksResourcesText, setBooksResourcesText] = useState("")
  const [homeworkPreference, setHomeworkPreference] = useState("")
  const [availabilityNotes, setAvailabilityNotes] = useState("")
  const [goalsSummary, setGoalsSummary] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await studentApi.me()
        const data = response.data
        setProfile(data)
        setFullName(data.full_name || "")
        setTimezone(data.timezone || "UTC")
        setCefrLevel(data.cefr_level || "")
        setPreparingFor(data.preparing_for || "")
        setTargetField(data.target_field || "")
        setTargetFieldOther(data.target_field_other_text || "")
        setTargetStartDate(data.target_start_date || "")
        setTargetStartDateUnknown(Boolean(data.target_start_date_unknown))
        setFocusSkills(data.focus_skills || [])
        setLearningStyle(data.learning_style || [])
        setWeeklyTimeBudget(data.weekly_time_budget_hours ? String(data.weekly_time_budget_hours) : "")
        setPreferredSessionDuration(data.preferred_session_duration ? String(data.preferred_session_duration) : "")
        setBooksResourcesText(data.books_resources_text || "")
        setHomeworkPreference(data.homework_preference || "")
        setAvailabilityNotes(data.availability_notes || "")
        setGoalsSummary(data.goals_summary || "")
        setTermsAccepted(Boolean(data.terms_accepted_at))
        setPrivacyAccepted(Boolean(data.privacy_accepted_at))
      } catch (err: any) {
        setError(err.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    void loadProfile()
  }, [])

  const toggleValue = (value: string, list: string[], setList: (values: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value))
    } else {
      setList([...list, value])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const payload = {
        full_name: fullName,
        timezone,
        cefr_level: cefrLevel,
        preparing_for: preparingFor,
        target_field: targetField,
        target_field_other_text: targetField === "other" ? targetFieldOther : "",
        target_start_date: targetStartDate || null,
        target_start_date_unknown: targetStartDateUnknown,
        focus_skills: focusSkills,
        learning_style: learningStyle,
        weekly_time_budget_hours: weeklyTimeBudget ? Number(weeklyTimeBudget) : null,
        preferred_session_duration: preferredSessionDuration ? Number(preferredSessionDuration) : null,
        books_resources_text: booksResourcesText,
        homework_preference: homeworkPreference,
        availability_notes: availabilityNotes,
        goals_summary: goalsSummary,
        terms_accepted_at: termsAccepted ? new Date().toISOString() : null,
        privacy_accepted_at: privacyAccepted ? new Date().toISOString() : null,
      }
      const response = await studentApi.update(payload)
      setProfile(response.data)
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={null} />
        <div className="container mx-auto px-4 py-10">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={profile} />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Complete your student profile to submit your application.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion</span>
              <span className="text-sm font-medium">{profile?.completion_percent || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-[#4361ee] h-2 rounded-full"
                style={{ width: `${profile?.completion_percent || 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cefr">Current level</Label>
              <select
                id="cefr"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value)}
              >
                <option value="">Select</option>
                {CEFR_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preparingFor">Preparing for</Label>
              <select
                id="preparingFor"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={preparingFor}
                onChange={(e) => setPreparingFor(e.target.value)}
              >
                <option value="">Select</option>
                {PREPARING_FOR.map((option) => (
                  <option key={option} value={option}>
                    {option.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetField">Target field</Label>
              <select
                id="targetField"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
              >
                <option value="">Select</option>
                {TARGET_FIELDS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {targetField === "other" && (
              <div className="space-y-2">
                <Label htmlFor="targetFieldOther">Target field (other)</Label>
                <Input
                  id="targetFieldOther"
                  value={targetFieldOther}
                  onChange={(e) => setTargetFieldOther(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="targetStartDate">Target start date</Label>
              <Input
                id="targetStartDate"
                type="date"
                value={targetStartDate}
                onChange={(e) => setTargetStartDate(e.target.value)}
                disabled={targetStartDateUnknown}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="startDateUnknown"
                type="checkbox"
                checked={targetStartDateUnknown}
                onChange={(e) => setTargetStartDateUnknown(e.target.checked)}
              />
              <Label htmlFor="startDateUnknown">Start date unknown</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills Focus</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {FOCUS_SKILLS.map((skill) => (
              <label key={skill} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={focusSkills.includes(skill)}
                  onChange={() => toggleValue(skill, focusSkills, setFocusSkills)}
                />
                {skill.replaceAll("_", " ")}
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study Style</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Preferred learning style</Label>
              <div className="grid gap-2">
                {LEARNING_STYLES.map((style) => (
                  <label key={style} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={learningStyle.includes(style)}
                      onChange={() => toggleValue(style, learningStyle, setLearningStyle)}
                    />
                    {style.replaceAll("_", " ")}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyTimeBudget">Weekly time budget (hours)</Label>
              <Input
                id="weeklyTimeBudget"
                type="number"
                min="0"
                value={weeklyTimeBudget}
                onChange={(e) => setWeeklyTimeBudget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDuration">Preferred session duration</Label>
              <select
                id="sessionDuration"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={preferredSessionDuration}
                onChange={(e) => setPreferredSessionDuration(e.target.value)}
              >
                <option value="">Select</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="homeworkPreference">Homework preference</Label>
              <select
                id="homeworkPreference"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={homeworkPreference}
                onChange={(e) => setHomeworkPreference(e.target.value)}
              >
                <option value="">Select</option>
                {HOMEWORK_PREFS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Materials and Constraints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="booksResources">Books or resources</Label>
              <Input
                id="booksResources"
                value={booksResourcesText}
                onChange={(e) => setBooksResourcesText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availabilityNotes">Availability notes</Label>
              <Input
                id="availabilityNotes"
                value={availabilityNotes}
                onChange={(e) => setAvailabilityNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalsSummary">Goals summary</Label>
              <Input id="goalsSummary" value={goalsSummary} onChange={(e) => setGoalsSummary(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              I accept the terms of service
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
              />
              I accept the privacy policy
            </label>
          </CardContent>
        </Card>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
          <Button asChild variant="outline">
            <a href="/student/application">Go to application</a>
          </Button>
        </div>
      </main>
    </div>
  )
}
