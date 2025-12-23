"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { authApi } from "@/lib/userClient"

export default function StudentDashboardPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string; role: "student" } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.me()
        setUserProfile(response.data as any)
      } catch {
        router.push("/auth/signin")
      }
    }
    void checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={userProfile} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{userProfile?.full_name ? `, ${userProfile.full_name}` : ""}!
          </h1>
          <p className="text-gray-600 mt-2">Continue your French learning journey</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Lessons</CardTitle>
                <CardDescription>Your scheduled French lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No upcoming lessons</p>
                  <Button asChild className="mt-4 bg-[#4361ee] hover:bg-[#3651de]">
                    <a href="/student/application">Check application status</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a href="/student/profile">Update Profile</a>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a href="/student/application">Application Status</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
