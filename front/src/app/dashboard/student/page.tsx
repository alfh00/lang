"use client"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { userApi } from "@/lib/userClient"
import { use } from "react"

export default function StudentDashboardPage() {
  const upcomingBookings = [
    {
      id: "1",
      start_time: new Date(Date.now() + 3600000).toISOString(),
      end_time: new Date(Date.now() + 7200000).toISOString(),
      teacher: {
        full_name: "Marie Dupont",
        profile_image: "/placeholder.svg",
      },
    },
    {
      id: "2",
      start_time: new Date(Date.now() + 86400000).toISOString(),
      end_time: new Date(Date.now() + 93600000).toISOString(),
      teacher: {
        full_name: "Pierre Martin",
        profile_image: "/placeholder.svg",
      },
    },
  ]

  const bookingsNeedingReview = [
    {
      id: "3",
      start_time: new Date(Date.now() - 86400000).toISOString(),
      end_time: new Date(Date.now() - 82800000).toISOString(),
      teacher: {
        full_name: "Sophie Leroy",
        profile_image: "/placeholder.svg",
      },
    },
  ]

  const userProfile = { full_name: "Jean Étudiant", role: "student" }

  const handlerefresh = async () => {
    try {
      const response = await userApi.refresh()
      console.log(response.data)
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={userProfile} />
      <button onClick={handlerefresh}>refresh</button>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile.full_name}!</h1>
          <p className="text-gray-600 mt-2">Continue your French learning journey</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Lessons */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Lessons</CardTitle>
                <CardDescription>Your scheduled French lessons</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBookings && upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => {
                      const canJoin = new Date(booking.start_time).getTime() - Date.now() < 30 * 60 * 1000
                      return (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={booking.teacher.profile_image || "/placeholder.svg"} />
                              <AvatarFallback className="bg-[#4361ee] text-white">
                                {booking.teacher.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">{booking.teacher.full_name}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(booking.start_time).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(booking.start_time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {canJoin ? (
                            <Button asChild className="bg-[#4361ee] hover:bg-[#3651de]">
                              <a href={`/lesson/${booking.id}`}>
                                <Video className="w-4 h-4 mr-2" />
                                Join Lesson
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
                    <Button asChild className="mt-4 bg-[#4361ee] hover:bg-[#3651de]">
                      <a href="/teachers">Book a Lesson</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Lessons to Review */}
            {bookingsNeedingReview.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Leave a Review</CardTitle>
                  <CardDescription>Share your experience with these teachers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookingsNeedingReview.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={booking.teacher.profile_image || "/placeholder.svg"} />
                            <AvatarFallback className="bg-[#4361ee] text-white">
                              {booking.teacher.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">{booking.teacher.full_name}</p>
                            <p className="text-sm text-gray-600">{new Date(booking.end_time).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button asChild variant="outline">
                          <a href={`/review/${booking.id}`}>
                            <Star className="w-4 h-4 mr-2" />
                            Write Review
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Lessons</span>
                  <span className="text-2xl font-bold text-[#4361ee]">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hours Learned</span>
                  <span className="text-2xl font-bold text-[#4361ee]">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Favorite Teachers</span>
                  <span className="text-2xl font-bold text-[#4361ee]">3</span>
                </div>
              </CardContent>
            </Card>
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full bg-[#4361ee] hover:bg-[#3651d4]">
                  <a href="/teachers">Find a Teacher</a>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a href="/student/lessons">View All Lessons</a>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a href="/student/payments">Payment History</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
