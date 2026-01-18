"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    SortingState,
    PaginationState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getBrowseData } from "@/lib/actions"
import { TextBrowseData } from "./columns"
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DataTableProps {
    columns: ColumnDef<TextBrowseData>[]
    universities: { id: number; name: string }[]
}

export function DataTable({
    columns,
    universities,
}: DataTableProps) {
    // Server-side State
    const [data, setData] = React.useState<TextBrowseData[]>([])
    const [total, setTotal] = React.useState(0)
    const [loading, setLoading] = React.useState(true)

    // Table State
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    })

    // Filter State
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [selectedUniversities, setSelectedUniversities] = React.useState<string[]>([])
    const [selectedSemesters, setSelectedSemesters] = React.useState<number[]>([])
    const [isUniFilterOpen, setIsUniFilterOpen] = React.useState(false)

    // Debounced Search
    const [debouncedSearch, setDebouncedSearch] = React.useState("")
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(globalFilter)
            setPagination((prev) => ({ ...prev, pageIndex: 0 })) // Reset page on search
        }, 500)
        return () => clearTimeout(handler)
    }, [globalFilter])

    // Reset page when filters change
    React.useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, [selectedUniversities, selectedSemesters, debouncedSearch]) // Added debouncedSearch logic above but explicit check good

    // Fetch Data
    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Map sorting state to API param
                let sortParam = undefined
                if (sorting.length > 0) {
                    const id = sorting[0].id
                    if (id === "title") sortParam = "Title"
                    else if (id === "author.name") sortParam = "Author"
                    else if (id === "credits") sortParam = "Credits"
                    else sortParam = "Title"
                }

                const result = await getBrowseData({
                    page: pagination.pageIndex + 1,
                    pageSize: pagination.pageSize,
                    search: debouncedSearch,
                    universities: selectedUniversities,
                    semesters: selectedSemesters,
                    sort: sortParam
                })
                setData(result.data as any)
                setTotal(result.total)
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [pagination.pageIndex, pagination.pageSize, sorting, debouncedSearch, selectedUniversities, selectedSemesters])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount: Math.ceil(total / pagination.pageSize),
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
    })

    // Toggle University Selection
    const toggleUniversity = (name: string) => {
        setSelectedUniversities(prev =>
            prev.includes(name) ? prev.filter(u => u !== name) : [...prev, name]
        )
    }

    // Toggle Semester Selection
    const toggleSemester = (sem: number) => {
        setSelectedSemesters(prev =>
            prev.includes(sem) ? prev.filter(s => s !== sem) : [...prev, sem]
        )
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Input
                    placeholder="Search by Title or Author..."
                    value={globalFilter}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />

                {/* University Filter UI */}
                <div className="relative">
                    <Button
                        variant="outline"
                        onClick={() => setIsUniFilterOpen(!isUniFilterOpen)}
                        className="w-[200px] justify-between"
                    >
                        {selectedUniversities.length > 0
                            ? `${selectedUniversities.length} Selected`
                            : "Select Universities"}
                    </Button>
                    {isUniFilterOpen && (
                        <div className="absolute top-10 left-0 z-50 w-[300px] rounded-md border bg-popover text-popover-foreground shadow-md p-2 max-h-[300px] overflow-y-auto">
                            <div className="space-y-1">
                                {universities.map(uni => (
                                    <div key={uni.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`uni-${uni.id}`}
                                            checked={selectedUniversities.includes(uni.name)}
                                            onChange={() => toggleUniversity(uni.name)}
                                            className="h-4 w-4 rounded border-primary"
                                        />
                                        <label htmlFor={`uni-${uni.id}`} className="text-sm cursor-pointer select-none line-clamp-1" title={uni.name}>
                                            {uni.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Click outside closer would be nice but skipping for simplicity */}
                    {isUniFilterOpen && (
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsUniFilterOpen(false)} />
                    )}
                </div>

                {/* Semester Filter */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Semesters:</span>
                    {[1, 2, 3, 4, 5, 6].map(sem => (
                        <div key={sem} className="flex items-center space-x-1">
                            <input
                                type="checkbox"
                                id={`sem-${sem}`}
                                checked={selectedSemesters.includes(sem)}
                                onChange={() => toggleSemester(sem)}
                                className="h-4 w-4 rounded border-primary"
                            />
                            <label htmlFor={`sem-${sem}`} className="text-sm cursor-pointer select-none">{sem}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Filters Display */}
            {(selectedUniversities.length > 0 || selectedSemesters.length > 0) && (
                <div className="flex flex-wrap gap-2">
                    {selectedUniversities.map(u => (
                        <Badge key={u} variant="secondary" className="cursor-pointer" onClick={() => toggleUniversity(u)}>
                            {u} <X className="ml-1 h-3 w-3" />
                        </Badge>
                    ))}
                    {selectedSemesters.map(s => (
                        <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => toggleSemester(s)}>
                            Sem {s} <X className="ml-1 h-3 w-3" />
                        </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedUniversities([]); setSelectedSemesters([]); }}>
                        Clear All
                    </Button>
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Loading data...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Page {pagination.pageIndex + 1} of {table.getPageCount()} (Total {total} items)
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
