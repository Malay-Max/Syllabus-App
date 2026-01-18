import { ManageTextsTable } from "@/components/manage/ManageTextsTable"
import { ManageAuthorsTab } from "@/components/manage/ManageAuthorsTab"
import { ManageUniversitiesTab } from "@/components/manage/ManageUniversitiesTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllAuthors, getAllUniversities } from "@/lib/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ManagePage() {
    // Fetch data for dropdowns
    const [authors, universities] = await Promise.all([
        getAllAuthors(),
        getAllUniversities()
    ])

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
                <p className="text-muted-foreground">
                    Manage and clean up database records.
                    <span className="text-destructive font-semibold ml-1">Warning: Deletion actions are irreversible.</span>
                </p>
            </div>

            <Tabs defaultValue="texts" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="texts">Texts</TabsTrigger>
                    <TabsTrigger value="authors">Authors</TabsTrigger>
                    <TabsTrigger value="universities">Universities</TabsTrigger>
                </TabsList>

                <TabsContent value="texts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Texts</CardTitle>
                            <CardDescription>
                                Browse and bulk delete texts. Deleting a text will remove it from all syllabi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ManageTextsTable />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="authors">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Authors</CardTitle>
                            <CardDescription>
                                Delete authors and cascadingly remove their works.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ManageAuthorsTab authors={authors} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="universities">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Universities</CardTitle>
                            <CardDescription>
                                Clean up entire university records or specific semesters.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ManageUniversitiesTab universities={universities} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
