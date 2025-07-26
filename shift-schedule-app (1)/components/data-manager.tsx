"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, RefreshCw } from "lucide-react"

export function DataManager() {
  const clearAllData = () => {
    if (confirm("すべてのシフト希望データを削除しますか？この操作は取り消せません。")) {
      localStorage.removeItem("shiftRequests")
      alert("すべてのデータを削除しました")
      window.location.reload()
    }
  }

  const refreshData = () => {
    window.location.reload()
  }

  const exportData = () => {
    try {
      const data = localStorage.getItem("shiftRequests")
      if (data) {
        const blob = new Blob([data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `shift-data-${new Date().toISOString().split("T")[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        alert("エクスポートするデータがありません")
      }
    } catch (error) {
      console.error("エクスポートエラー:", error)
      alert("エクスポートに失敗しました")
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>データ管理</CardTitle>
        <CardDescription>シフト希望データの管理機能</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2 flex-wrap">
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          データ更新
        </Button>
        <Button onClick={exportData} variant="outline" size="sm">
          JSONエクスポート
        </Button>
        <Button onClick={clearAllData} variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          全データ削除
        </Button>
      </CardContent>
    </Card>
  )
}
