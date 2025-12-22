import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, DollarSign, Users, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function TeacherDashboardPage() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("auth_token")

  if (!authToken) {
    redirect("/auth/signin")
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  try {
    const userResponse = await fetch(`${API_URL}/auth/me/`, {
      headers: { Authorization: `Bearer ${authToken.value}` },
      cache: "no-store",
    })

    if (!userResponse.ok) redirect("/auth/signin")
    const userProfile = await userResponse.json()

    if (userProfile.role !== "teacher") {
      redirect(`/${userProfile.role}/dashboard`)
    }

    const bookingsResponse = await fetch(`${API_URL}/bookings/?role=teacher&status=upcoming`, {
      headers: { Authorization: `Bearer ${authToken.value}` },
      cache: "no-store",
    })

    const upcomingBookings = bookingsResponse.ok ? await bookingsResponse.json() : []

    const paymentsResponse = await fetch(`${API_URL}/payments/?period=today`, {
      headers: { Authorization: `Bearer ${authToken.value}` },
      cache: "no-store",
    })

    const payments = paymentsResponse.ok ? await paymentsResponse.json() : []
    const todayEarnings = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={userProfile} />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile.full_name}!</h1>
            <p className="text-gray-600 mt-2">Manage your teaching schedule and students</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Lessons</p>
                    <p className="text-2xl font-bold text-gray-900">{userProfile.total_lessons || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-[#4361ee]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{userProfile.rating || 0}</p>
                  </div>
                  <Star className="w-8 h-8 text-[#f72585]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{userProfile.total_reviews || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-[#4cc9f0]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">${todayEarnings.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Your lessons for today</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingBookings && upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking: any) => {
                        const canStart = new Date(booking.start_time).getTime() - Date.now() < 30 * 60 * 1000

                        return (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback className="bg-[#4361ee] text-white">
                                  {booking.student.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-gray-900">{booking.student.full_name}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(booking.start_time).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    {booking.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {canStart ? (
                              <Button asChild className="bg-[#4361ee] hover:bg-[#3651de]">
                                <a href={`/lesson/${booking.id}`}>Start Lesson</a>
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
                      <p className="text-gray-600">No lessons scheduled for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Profile Completion</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#4361ee] h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <a href="/teacher/profile">Complete Profile</a>
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full bg-[#4361ee] hover:bg-[#3651d4]">
                    <a href="/teacher/availability">Set Availability</a>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <a href="/teacher/bookings">View All Bookings</a>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <a href="/teacher/earnings">Earnings Report</a>
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

