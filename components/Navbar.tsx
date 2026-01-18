import Link from "next/link"
import { BookOpenCheck } from "lucide-react"

import { cn } from "@/lib/utils"

export function Navbar({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    return (
        <nav
            className={cn("flex items-center space-x-4 lg:space-x-6 border-b px-6 py-4", className)}
            {...props}
        >
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-4">
                <BookOpenCheck className="h-6 w-6" />
                Syllabus Explorer
            </Link>
            <Link
                href="/"
                className="text-sm font-medium transition-colors hover:text-primary"
            >
                Dashboard
            </Link>
            <Link
                href="/browse"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
                Browse Master List
            </Link>
            <Link
                href="/manage"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
                Manage Data
            </Link>
        </nav>
    )
}
