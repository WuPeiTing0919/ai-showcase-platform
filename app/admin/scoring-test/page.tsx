import { ScoringManagement } from "@/components/admin/scoring-management"

export default function ScoringTestPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">評分管理測試</h1>
        <p className="text-gray-600">測試動態評分項目功能</p>
      </div>
      <ScoringManagement />
    </div>
  )
} 