import { getDashboardStats } from "@/lib/actions"
import { MetricCard } from "@/components/dashboard/MetricCard"

export const dynamic = 'force-dynamic'
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts"
import { BookOpen, GraduationCap, Library, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const {
    universityCount,
    textCount,
    authorCount,
    latestUniversities,
    topTexts,
    topAuthors
  } = await getDashboardStats()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* Add datepicker or download button if needed */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Universities"
          value={universityCount}
          icon={GraduationCap}
          description="Institutions tracked"
        />
        <MetricCard
          title="Total Texts"
          value={textCount}
          icon={BookOpen}
          description="Unique texts in database"
        />
        <MetricCard
          title="Total Authors"
          value={authorCount}
          icon={Users}
          description="Writers represented"
        />
        <MetricCard
          title="Analytics"
          value="Reports"
          icon={TrendingUp}
          description="View detailed analysis"
        />
      </div>

      <AnalyticsCharts topTexts={topTexts} topAuthors={topAuthors} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Universities</CardTitle>
            <CardDescription>
              Newest institutions added to the syllabus database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestUniversities.map((uni) => (
                <div key={uni.id} className="flex items-center">
                  <Library className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="ml-2 space-y-1">
                    <p className="text-sm font-medium leading-none">{uni.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {uni.id}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <Badge variant="outline">New</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
