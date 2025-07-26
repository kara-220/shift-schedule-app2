"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Download } from "lucide-react"
import { DataManager } from "@/components/data-manager"

const SHIFT_LABELS = {
  unavailable: { label: "出れない", color: "destructive" },
  morning: { label: "早番", color: "default" },
  afternoon: { label: "中番", color: "secondary" },
  evening: { label: "遅番", color: "outline" },
  no_preference: { label: "特に希望なし", color: "secondary" },
  time_request: { label: "時間希望あり", color: "default" },
} as const

// サンプルデータ
const sampleShiftData = [
  {
    id: 1,
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
  },
  {
    id: 2,
    name: "佐藤花子",
    email: "sato@example.com",
    submittedAt: "2024-01-15T11:15:00",
    shifts: {
      "1": "afternoon",
      "2": "evening",
      "3": "morning",
      "4": "unavailable",
      "5": "time_request",
    },
    timeRequests: {
      "5": "午前中のみ対応可能",
    },
  },
]

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [shiftData, setShiftData] = useState([])

  useEffect(() => {
    const loadShiftData = () => {
      try {
        const savedData = JSON.parse(localStorage.getItem("shiftRequests") || "[]")
        setShiftData(savedData)
      } catch (error) {
        console.error("データの読み込みに失敗しました:", error)
        setShiftData([])
      }
    }

    if (isAuthenticated) {
      loadShiftData()

      // 定期的にデータを更新（新しい送信があった場合に反映）
      const interval = setInterval(loadShiftData, 5000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // 簡単なパスワード認証（実際の運用では適切な認証を実装）
    if (password === "admin123") {
      setIsAuthenticated(true)
    } else {
      alert("パスワードが間違っています")
    }
  }

  const exportToCSV = () => {
    // CSV形式でエクスポート
    const headers = ["名前", "メールアドレス", "送信日時", "1日", "2日", "3日", "4日", "5日", "時間希望"]
    const rows = shiftData.map((person) => [
      person.name,
      person.email,
      new Date(person.submittedAt).toLocaleString("ja-JP"),
      ...Array.from({ length: 5 }, (_, i) => {
        const day = (i + 1).toString()
        const shift = person.shifts[day]
        return shift ? SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]?.label || shift : ""
      }),
      Object.values(person.timeRequests).join("; "),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `shift_requests_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>管理者ログイン</CardTitle>
            <CardDescription>シフト希望表を確認するにはパスワードを入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                ログイン
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  シフト希望表管理
                </CardTitle>
                <CardDescription>提出されたシフト希望を確認・管理できます</CardDescription>
              </div>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV出力
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">一覧表示</TabsTrigger>
                <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {shiftData.map((person) => (
                  <Card key={person.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{person.name}</CardTitle>
                          <CardDescription>{person.email}</CardDescription>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(person.submittedAt).toLocaleString("ja-JP")}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        {Array.from({ length: 5 }, (_, i) => {
                          const day = (i + 1).toString()
                          const shift = person.shifts[day]
                          const timeRequest = person.timeRequests[day]

                          return (
                            <div key={day} className="space-y-2">
                              <div className="text-sm font-medium">{day}日</div>
                              {shift && (
                                <Badge variant={SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]?.color || "default"}>
                                  {SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]?.label || shift}
                                </Badge>
                              )}
                              {timeRequest && (
                                <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">{timeRequest}</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">名前</th>
                        {Array.from({ length: 5 }, (_, i) => (
                          <th key={i} className="border border-gray-300 p-2 text-center">
                            {i + 1}日
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shiftData.map((person) => (
                        <tr key={person.id}>
                          <td className="border border-gray-300 p-2 font-medium">{person.name}</td>
                          {Array.from({ length: 5 }, (_, i) => {
                            const day = (i + 1).toString()
                            const shift = person.shifts[day]
                            const timeRequest = person.timeRequests[day]

                            return (
                              <td key={day} className="border border-gray-300 p-2 text-center">
                                {shift && (
                                  <div className="space-y-1">
                                    <Badge
                                      variant={SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]?.color || "default"}
                                      className="text-xs"
                                    >
                                      {SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]?.label || shift}
                                    </Badge>
                                    {timeRequest && <div className="text-xs text-gray-600">{timeRequest}</div>}
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
            <DataManager />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
