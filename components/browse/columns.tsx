"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import Link from "next/link"

// Define the type of data we are displaying
// Define the type of data we are displaying
export type TextBrowseData = {
    id: number
    title: string
    author: {
        id: number
        name: string
    }
    _count: {
        syllabusEntries: number
    }
}

export const columns: ColumnDef<TextBrowseData>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return <Link href={`/text/${row.original.id}`} className="font-medium hover:underline">{row.original.title}</Link>
        }
    },
    {
        accessorKey: "author.name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Author
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return (
                <Link href={`/author/${row.original.author.id}`} className="hover:underline">
                    {row.original.author.name}
                </Link>
            )
        }
    },
    {
        id: "universityCount",
        header: "Prescribed By",
        cell: ({ row }) => {
            const count = row.original._count.syllabusEntries
            return (
                <Badge variant="secondary">
                    {count} {count === 1 ? "University" : "Universities"}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            return (
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/text/${row.original.id}`}>View Details</Link>
                </Button>
            )
        },
    }
]
