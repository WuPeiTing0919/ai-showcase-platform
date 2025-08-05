import { ScoringManagement } from "@/components/admin/scoring-management"

export default function ScoringPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">評分管理</h1>
        <p className="text-gray-600">管理競賽評分，查看已完成和未完成的評分內容</p>
      </div>
      <ScoringManagement />
    </div>
  )
} 