"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { studentApi } from "@/lib/userClient"

export default function StudentApplicationPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

  const loadProfile = async () => {
    try {
      const response = await studentApi.me()
      setProfile(response.data)
    } catch (err: any) {
      setError(err.message || "Failed to load application")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const response = await studentApi.submitApplication()
      setProfile(response.data)
    } catch (err: any) {
      setError(err.message || "Failed to submit application")
    } finally {
      setSubmitting(false)
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

  const isComplete = profile?.completion_percent === 100
  const canSubmit = isComplete && profile?.application_status === "draft"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={profile} />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Review your application and submit when ready.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <div>Status: {profile?.application_status}</div>
            <div>Completion: {profile?.completion_percent || 0}%</div>
            {profile?.submitted_at && <div>Submitted at: {new Date(profile.submitted_at).toLocaleString()}</div>}
            {profile?.matched_teacher && <div>Matched teacher ID: {profile.matched_teacher}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              You must complete 100% of your profile before submitting your application.
            </p>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
              {submitting ? "Submitting..." : "Submit application"}
            </Button>
            {!isComplete && <p className="text-xs text-gray-500">Complete your profile to enable submission.</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
