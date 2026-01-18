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
import { deleteAuthor } from "@/lib/delete-actions"
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
import { Loader2, Trash2 } from "lucide-react"

interface Author {
    id: number
    name: string
}

interface ManageAuthorsTabProps {
    authors: Author[]
}

export function ManageAuthorsTab({ authors }: ManageAuthorsTabProps) {
    const [selectedAuthorId, setSelectedAuthorId] = React.useState<string>("")
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        if (!selectedAuthorId) return

        setIsDeleting(true)
        try {
            const res = await deleteAuthor(parseInt(selectedAuthorId))
            if (res.success) {
                // Success message or toast could go here
                setSelectedAuthorId("")
            } else {
                alert(res.message)
            }
        } catch (e) {
            console.error(e)
            alert("Failed to delete author")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-xl border p-6 rounded-md">
            <div>
                <h3 className="text-lg font-medium">Delete Author</h3>
                <p className="text-sm text-muted-foreground">
                    Deleting an author will remove the author record, all their texts, and all associated syllabus entries.
                </p>
            </div>

            <div className="flex flex-col space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Select Author</label>
                    <Select onValueChange={setSelectedAuthorId} value={selectedAuthorId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an author to delete..." />
                        </SelectTrigger>
                        <SelectContent>
                            {authors.map((author) => (
                                <SelectItem key={author.id} value={author.id.toString()}>
                                    {author.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="pt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={!selectedAuthorId || isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Author
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete
                                    <span className="font-bold text-foreground mx-1">
                                        {authors.find(a => a.id.toString() === selectedAuthorId)?.name}
                                    </span>
                                    and ALL associated texts and syllabus data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {isDeleting ? "Deleting..." : "Delete Author"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    )
}
