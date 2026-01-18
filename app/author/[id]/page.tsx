import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getAuthorDetails } from "@/lib/actions"
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

interface AuthorPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function AuthorPage({ params }: AuthorPageProps) {
    const { id } = await params
    const authorId = parseInt(id)

    if (isNaN(authorId)) {
        notFound()
    }

    const author = await getAuthorDetails(authorId)

    if (!author) {
        notFound()
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/browse">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{author.name}</h1>
                    <p className="text-muted-foreground">Author Details</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Texts</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{author.texts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Texts by this author
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prescribed By</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{author.totalUniversities}</div>
                        <p className="text-xs text-muted-foreground">
                            Universities prescribing this author
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Texts List */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Authored Texts ({author.texts.length})</CardTitle>
                        <CardDescription>
                            List of all texts by {author.name} in the database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {author.texts.map((text: any) => (
                                <Link href={`/text/${text.id}`} key={text.id} className="block">
                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                                        <div>
                                            <h3 className="font-medium">{text.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Used by {text.universityCount} university{text.universityCount !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Universities List */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Adopted By ({author.totalUniversities})</CardTitle>
                        <CardDescription>
                            Universities that have prescribed texts by {author.name}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {author.universities.map((uni: any) => (
                                <Badge key={uni.id} variant="secondary" className="px-3 py-1 text-sm">
                                    {uni.name}
                                </Badge>
                            ))}
                            {author.universities.length === 0 && (
                                <span className="text-muted-foreground">No universities yet.</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
