"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, User, Mail } from "lucide-react"

const SHIFT_OPTIONS = [
  { value: "unavailable", label: "出れない", color: "text-red-600" },
  { value: "morning", label: "早番", color: "text-blue-600" },
  { value: "afternoon", label: "中番", color: "text-green-600" },
  { value: "evening", label: "遅番", color: "text-purple-600" },
  { value: "no_preference", label: "特に希望なし", color: "text-gray-600" },
  { value: "time_request", label: "時間希望あり", color: "text-orange-600" },
]

export default function ShiftRequestForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    periodType: "auto" as "auto" | "manual",
    startDate: "",
    endDate: "",
    shifts: {} as Record<string, string>,
    timeRequests: {} as Record<string, string>,
  })

  // 半月分の日付を生成（今月の1-15日または16-末日）
  const generateDates = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const dates = []

    let startDate: number, endDate: number

    if (formData.periodType === "manual" && formData.startDate && formData.endDate) {
      // 手動設定の場合
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push({
          date: d.getDate(),
          dayOfWeek: d.toLocaleDateString("ja-JP", { weekday: "short" }),
          fullDate: `${d.getMonth() + 1}/${d.getDate()}`,
        })
      }
    } else {
      // 自動設定の場合（次の期間を表示）
      const isFirstHalf = today.getDate() <= 15
      // 現在が前半（1-15日）なら後半（16-末日）を表示
      // 現在が後半（16-31日）なら次月の前半（1-15日）を表示
      if (isFirstHalf) {
        // 現在が前半なので、今月の後半を表示
        startDate = 16
        endDate = new Date(year, month + 1, 0).getDate()

        for (let day = startDate; day <= endDate; day++) {
          const date = new Date(year, month, day)
          dates.push({
            date: day,
            dayOfWeek: date.toLocaleDateString("ja-JP", { weekday: "short" }),
            fullDate: `${month + 1}/${day}`,
          })
        }
      } else {
        // 現在が後半なので、来月の前半を表示
        const nextMonth = month + 1
        const nextYear = nextMonth > 11 ? year + 1 : year
        const adjustedMonth = nextMonth > 11 ? 0 : nextMonth

        for (let day = 1; day <= 15; day++) {
          const date = new Date(nextYear, adjustedMonth, day)
          dates.push({
            date: day,
            dayOfWeek: date.toLocaleDateString("ja-JP", { weekday: "short" }),
            fullDate: `${adjustedMonth + 1}/${day}`,
          })
        }
      }
    }

    return dates
  }

  const dates = generateDates()

  const handleShiftChange = (date: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      shifts: { ...prev.shifts, [date]: value },
      // 時間希望あり以外を選択した場合、時間希望をクリア
      timeRequests: value !== "time_request" ? { ...prev.timeRequests, [date]: "" } : prev.timeRequests,
    }))
  }

  const handleTimeRequestChange = (date: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      timeRequests: { ...prev.timeRequests, [date]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.name || !formData.email) {
      alert("名前とメールアドレスを入力してください")
      return
    }

    // 時間希望ありの日で時間が未入力の場合チェック
    const timeRequestDates = Object.entries(formData.shifts)
      .filter(([_, shift]) => shift === "time_request")
      .map(([date, _]) => date)

    const missingTimes = timeRequestDates.filter((date) => !formData.timeRequests[date])
    if (missingTimes.length > 0) {
      alert(`時間希望ありの日（${missingTimes.join(", ")}日）の時間を入力してください`)
      return
    }

    try {
      // LocalStorageに保存（簡易的なデータ保存）
      const existingData = JSON.parse(localStorage.getItem("shiftRequests") || "[]")
      const newRequest = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        submittedAt: new Date().toISOString(),
        shifts: formData.shifts,
        timeRequests: formData.timeRequests,
      }

      existingData.push(newRequest)
      localStorage.setItem("shiftRequests", JSON.stringify(existingData))

      console.log("シフト希望を送信:", newRequest)
      alert("シフト希望を送信しました！")

      // フォームをリセット
      setFormData({
        name: "",
        email: "",
        periodType: "auto",
        startDate: "",
        endDate: "",
        shifts: {},
        timeRequests: {},
      })
    } catch (error) {
      console.error("送信エラー:", error)
      alert("送信に失敗しました。もう一度お試しください。")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Calendar className="h-5 w-5" />
              シフト希望表
            </CardTitle>
            <CardDescription>次の期間のシフト希望を入力してください</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    名前
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="山田太郎"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    メールアドレス
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              {/* 期間設定 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">集計期間</h3>

                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="periodType"
                        value="auto"
                        checked={formData.periodType === "auto"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, periodType: e.target.value as "auto" }))}
                      />
                      <span>自動設定（半月ごと）</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="periodType"
                        value="manual"
                        checked={formData.periodType === "manual"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, periodType: e.target.value as "manual" }))}
                      />
                      <span>手動設定</span>
                    </label>
                  </div>

                  {formData.periodType === "manual" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">開始日</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">終了日</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* シフト希望 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">シフト希望</h3>

                {dates.map(({ date, dayOfWeek, fullDate }) => (
                  <div key={date} className="space-y-3 p-4 border rounded-lg bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {fullDate} ({dayOfWeek})
                      </span>
                    </div>

                    <Select
                      value={formData.shifts[date] || ""}
                      onValueChange={(value) => handleShiftChange(date.toString(), value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="希望を選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className={option.color}>{option.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* 時間希望入力 */}
                    {formData.shifts[date] === "time_request" && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          希望時間
                        </Label>
                        <Textarea
                          value={formData.timeRequests[date] || ""}
                          onChange={(e) => handleTimeRequestChange(date.toString(), e.target.value)}
                          placeholder="例: 10:00-18:00、午前中のみ、など"
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full" size="lg">
                シフト希望を送信
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
