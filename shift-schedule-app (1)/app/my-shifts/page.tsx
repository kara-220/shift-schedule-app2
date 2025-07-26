"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Eye, Mail } from "lucide-react"

const SHIFT_LABELS = {
  unavailable: { label: "出れない", color: "destructive" },
  morning: { label: "早番", color: "default" },
  afternoon: { label: "中番", color: "secondary" },
  evening: { label: "遅番", color: "outline" },
  no_preference: { label: "特に希望なし", color: "secondary" },
  time_request: { label: "時間希望あり", color: "default" },
} as const

// サンプルデータ（実際はメールアドレスで検索）
const sampleUserData = {
  name: "山田太郎",
  email: "yamada@example.com",
  submittedAt: "2024-01-15T10:30:00",
  shifts: {
    "1": "morning",
    "2": "afternoon",
    "3": "unavailable",
    "4": "time_request",
    "5": "no_preference",
  },
  timeRequests: {
    "4": "14:00-20:00で希望します",
  },
}

export default function MyShiftsPage() {
  const [email, setEmail] = useState("")
  const [userData, setUserData] = useState<typeof sampleUserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 模擬的な遅延

      // LocalStorageから該当するデータを検索
      const savedData = JSON.parse(localStorage.getItem("shiftRequests") || "[]")
      const foundUser = savedData.find((user: any) => user.email === email)

      if (foundUser) {
        setUserData(foundUser)
      } else {
        setUserData(null)
        alert("該当するシフト希望が見つかりませんでした")
      }
    } catch (error) {
      console.error("検索エラー:", error)
      alert("検索に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Eye className="h-5 w-5" />
              シフト希望確認
            </CardTitle>
            <CardDescription>提出したシフト希望を確認できます</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="登録したメールアドレスを入力"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "検索中..." : "シフト希望を確認"}
              </Button>
            </form>

            {userData && (
              <div className="mt-6 space-y-4">
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-3">提出済みシフト希望</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">名前:</span>
                      <span className="font-medium">{userData.name}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">提出日時:</span>
                      <span>{new Date(userData.submittedAt).toLocaleString("ja-JP")}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium">シフト希望詳細</h4>

                    {Array.from({ length: 5 }, (_, i) => {
                      const day = (i + 1).toString()
                      const shift = userData.shifts[day]
                      const timeRequest = userData.timeRequests[day]

                      return (
                        <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{day}日</span>
                          <div className="text-right space-y-1">
                            {shift && (
                              <Badge variant={SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]?.color || "default"}>
                                {SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]?.label || shift}
                              </Badge>
                            )}
                            {timeRequest && <div className="text-xs text-gray-600">{timeRequest}</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
