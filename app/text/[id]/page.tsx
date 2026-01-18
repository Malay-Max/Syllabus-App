import { getTextDetails } from "@/lib/actions"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, BookOpen, User } from "lucide-react"

interface TextDetailPageProps {
    params: {
        id: string
    }
}

export default async function TextDetailPage({ params }: TextDetailPageProps) {
    // Await params in Next.js 15
    const { id } = await params
    const textId = parseInt(id)

    if (isNaN(textId)) {
        return notFound()
    }

    const text = await getTextDetails(textId)

    if (!text) {
        return notFound()
    }

    const uniqueUniversities = new Set(text.syllabusEntries.map((e: any) => e.universityId)).size

    return (
        <div className="container mx-auto py-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col space-y-4">
                <h1 className="text-4xl font-bold">{text.title}</h1>
                <div className="flex items-center space-x-4 text-xl text-muted-foreground">
                    <div className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        {text.author.name}
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                        Prescribed by {uniqueUniversities} Universit{uniqueUniversities === 1 ? 'y' : 'ies'}
                    </Badge>
                </div>
            </div>

            {/* Usage Grid */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Syllabus Details</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {text.syllabusEntries.length > 0 ? (
                        text.syllabusEntries.map((entry: any) => (
                            <Card key={`${entry.universityId}-${entry.courseCode}`} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Building2 className="mr-2 h-5 w-5 text-primary" />
                                        {entry.university.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Semester</span>
                                        <Badge variant="outline">{entry.semester || "N/A"}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Course Code</span>
                                        <span className="font-mono text-sm">{entry.courseCode}</span>
                                    </div>
                                    {entry.credits && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Credits</span>
                                            <span>{entry.credits}</span>
                                        </div>
                                    )}
                                    {entry.marks && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Marks</span>
                                            <span>{entry.marks}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No syllabus details found.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
