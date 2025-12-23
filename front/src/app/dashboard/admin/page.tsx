import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={null} />
      <main className="container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Admin tools are not yet configured in the UI.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Use the Django admin or API endpoints to manage applications and matches.
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
