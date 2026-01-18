"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { deleteUniversity, deleteSemesterData } from "@/lib/delete-actions"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2, BookX } from "lucide-react"

interface University {
    id: number
    name: string
}

interface ManageUniversitiesTabProps {
    universities: University[]
}

export function ManageUniversitiesTab({ universities }: ManageUniversitiesTabProps) {
    const [selectedUniId, setSelectedUniId] = React.useState<string>("")
    const [selectedSemester, setSelectedSemester] = React.useState<string>("")

    const [isDeletingUni, setIsDeletingUni] = React.useState(false)
    const [isDeletingSem, setIsDeletingSem] = React.useState(false)

    const handleDeleteUni = async () => {
        if (!selectedUniId) return

        setIsDeletingUni(true)
        try {
            const res = await deleteUniversity(parseInt(selectedUniId))
            if (res.success) {
                setSelectedUniId("")
            } else {
                alert(res.message)
            }
        } catch (e) {
            console.error(e)
            alert("Failed to delete university")
        } finally {
            setIsDeletingUni(false)
        }
    }

    const handleDeleteSemester = async () => {
        if (!selectedUniId || !selectedSemester) return

        setIsDeletingSem(true)
        try {
            const res = await deleteSemesterData(parseInt(selectedUniId), parseInt(selectedSemester))
            if (res.success) {
                // Keep selections, just notify maybe?
                alert(res.message)
            } else {
                alert(res.message)
            }
        } catch (e) {
            console.error(e)
            alert("Failed to delete semester data")
        } finally {
            setIsDeletingSem(false)
        }
    }

    return (
        <div className="space-y-6 max-w-xl border p-6 rounded-md">
            <div>
                <h3 className="text-lg font-medium">Manage Universities</h3>
                <p className="text-sm text-muted-foreground">
                    Delete entire universities or specific semester data.
                </p>
            </div>

            <div className="flex flex-col space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Select University</label>
                    <Select onValueChange={setSelectedUniId} value={selectedUniId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a university..." />
                        </SelectTrigger>
                        <SelectContent>
                            {universities.map((uni) => (
                                <SelectItem key={uni.id} value={uni.id.toString()}>
                                    {uni.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedUniId && (
                    <div className="grid gap-4 pt-4 border-t">
                        {/* Delete Semester Option */}
                        <div className="space-y-3 p-4 bg-secondary/20 rounded-md border">
                            <h4 className="font-semibold flex items-center gap-2">
                                <BookX className="w-4 h-4" /> Delete Semester Data
                            </h4>
                            <div className="flex gap-2">
                                <Select onValueChange={setSelectedSemester} value={selectedSemester}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Semester..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <SelectItem key={n} value={n.toString()}>Semester {n}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="text-destructive hover:bg-destructive/10" disabled={!selectedSemester || isDeletingSem}>
                                            Delete Semester
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Semester Deletion</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will delete all syllabus entries for
                                                <span className="font-bold text-foreground mx-1">Semester {selectedSemester}</span>
                                                of
                                                <span className="font-bold text-foreground mx-1">
                                                    {universities.find(u => u.id.toString() === selectedUniId)?.name}
                                                </span>.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteSemester} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                {isDeletingSem ? "Deleting..." : "Delete Semester Data"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        {/* Delete University Option */}
                        <div className="space-y-3 p-4 bg-destructive/10 rounded-md border border-destructive/20">
                            <h4 className="font-semibold text-destructive flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Danger Zone
                            </h4>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full sm:w-auto" disabled={isDeletingUni}>
                                        Delete Entire University
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete University?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete
                                            <span className="font-bold text-foreground mx-1">
                                                {universities.find(u => u.id.toString() === selectedUniId)?.name}
                                            </span>
                                            and ALL its syllabus mappings.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteUni} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            {isDeletingUni ? "Deleting..." : "Confirm Delete University"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
