import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function TeacherDashboardPage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  if (!cookieHeader) {
    redirect("/auth/signin")
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  try {
    const userResponse = await fetch(`${origin}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    })

    if (!userResponse.ok) redirect("/auth/signin")
    const userProfile = await userResponse.json()

    if (userProfile.role !== "teacher") {
      redirect(`/dashboard/${userProfile.role}`)
    }

    const lessonsResponse = await fetch(`${origin}/api/bff/lessons/`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    })

    const lessons = lessonsResponse.ok ? await lessonsResponse.json() : []
    const upcomingLessons = lessons.filter(
      (lesson: any) => lesson.status === "confirmed" && new Date(lesson.starts_at_utc).getTime() > Date.now()
    )

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={userProfile} />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile.full_name}!</h1>
            <p className="text-gray-600 mt-2">Manage your teaching schedule and students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Lessons</p>
                    <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-[#4361ee]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming Lessons</p>
                    <p className="text-2xl font-bold text-gray-900">{upcomingLessons.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-[#4cc9f0]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                  <Star className="w-8 h-8 text-[#f72585]" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Lessons</CardTitle>
                  <CardDescription>Your confirmed lessons</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingLessons.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingLessons.map((lesson: any) => {
                        const canStart = new Date(lesson.starts_at_utc).getTime() - Date.now() < 30 * 60 * 1000
                        const studentLabel = `Student #${lesson.student}`

                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback className="bg-[#4361ee] text-white">
                                  {studentLabel.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-gray-900">{studentLabel}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(lesson.starts_at_utc).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    {lesson.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {canStart && lesson.meeting_url ? (
                              <Button asChild className="bg-[#4361ee] hover:bg-[#3651de]">
                                <a href={lesson.meeting_url} target="_blank" rel="noreferrer">
                                  Start Lesson
                                </a>
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-500">Available 30 min before</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No upcoming lessons</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Profile Completion</span>
                      <span className="text-sm font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#4361ee] h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <a href="/teacher/profile">Complete Profile</a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full bg-[#4361ee] hover:bg-[#3651d4]">
                    <a href="/teacher/availability">Set Availability</a>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <a href="/teacher/lessons">View All Lessons</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Failed to load dashboard:", error)
    redirect("/auth/signin")
  }
}
