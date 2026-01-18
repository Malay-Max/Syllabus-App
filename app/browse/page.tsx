import { DataTable } from "@/components/browse/DataTable"
import { columns } from "@/components/browse/columns"
import { getAllUniversities } from "@/lib/actions"

export const dynamic = 'force-dynamic'

export default async function BrowsePage() {
    const universities = await getAllUniversities()

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Browse Syllabus Master List</h1>
            <DataTable columns={columns} universities={universities} />
        </div>
    )
}
