"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { availabilityApi } from "@/lib/userClient"

const DAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
]

export default function TeacherAvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [blocks, setBlocks] = useState<any[]>([])
  const [dayOfWeek, setDayOfWeek] = useState("0")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("12:00")
  const [slotDuration, setSlotDuration] = useState("30")
  const [saving, setSaving] = useState(false)

  const loadBlocks = async () => {
    try {
      const response = await availabilityApi.list()
      setBlocks(response.data)
    } catch (err: any) {
      setError(err.message || "Failed to load availability")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBlocks()
  }, [])

  const handleAdd = async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await availabilityApi.create({
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        slot_duration: Number(slotDuration),
      })
      setBlocks((prev) => [...prev, response.data])
    } catch (err: any) {
      setError(err.message || "Failed to add block")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      await availabilityApi.remove(id)
      setBlocks((prev) => prev.filter((block) => block.id !== id))
    } catch (err: any) {
      setError(err.message || "Failed to delete block")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={null} />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Availability Blocks</CardTitle>
            <CardDescription>Set weekly recurring blocks. Students can request within these windows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : blocks.length === 0 ? (
              <div className="text-sm text-gray-600">No blocks yet.</div>
            ) : (
              <div className="space-y-3">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">
                        {DAYS.find((day) => day.value === block.day_of_week)?.label || block.day_of_week}
                      </span>{" "}
                      {block.start_time} - {block.end_time} ({block.slot_duration} min)
                    </div>
                    <Button variant="outline" onClick={() => handleDelete(block.id)}>
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {error && <div className="text-sm text-red-600">{error}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add a block</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day</Label>
              <select
                id="dayOfWeek"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
              >
                {DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start time</Label>
              <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End time</Label>
              <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotDuration">Slot duration</Label>
              <select
                id="slotDuration"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={slotDuration}
                onChange={(e) => setSlotDuration(e.target.value)}
              >
                <option value="30">30 min</option>
                <option value="60">60 min</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <Button onClick={handleAdd} disabled={saving}>
                {saving ? "Saving..." : "Add block"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
