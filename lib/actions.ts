"use server"

import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function getDashboardStats() {
    const [universityCount, textCount, authorCount, latestUniversities] = await Promise.all([
        prisma.university.count(),
        prisma.text.count(),
        prisma.author.count(),
        prisma.university.findMany({
            take: 5,
            orderBy: { id: "desc" },
        }),
    ])

    // Chart 1: Top 10 Prescribed Texts
    // We need to count syllabusEntries per text.
    // Prisma groupBy is good for simple aggregations.
    const topTextsRaw = await prisma.syllabusEntry.groupBy({
        by: ['textId'],
        _count: {
            universityId: true,
        },
        orderBy: {
            _count: {
                universityId: 'desc',
            }
        },
        take: 10,
    })

    // Start fetching text details for the chart
    // Start fetching text details for the chart
    const topTexts = await Promise.all(topTextsRaw.map(async (item: { textId: any; _count: { universityId: any } }) => {
        const text = await prisma.text.findUnique({
            where: { id: item.textId },
            select: { title: true }
        })
        return {
            id: item.textId,
            name: text?.title || `Text ${item.textId}`,
            count: item._count.universityId
        }
    }))

    // Chart 2: Top 10 Prescribed Authors
    // This is slightly harder with direct groupBy on syllabusEntry.
    // We can group by text first, then aggregate by author?
    // Or: fetch all texts with their syllabus counts, then aggregate in JS? 
    // Efficient query: Group SyllabusEntry by textId count?
    // A raw query might be better for "Author with most syllabus entries".
    // SELECT Author.name, COUNT(SyllabusEntry.universityId) as count 
    // FROM Author 
    // JOIN Text ON Text.authorId = Author.id 
    // JOIN SyllabusEntry ON SyllabusEntry.textId = Text.id 
    // GROUP BY Author.id 
    // ORDER BY count DESC LIMIT 10

    const topAuthorsRaw = await prisma.$queryRaw<{ id: number, name: string, count: bigint }[]>`
    SELECT a.id, a.name, COUNT(sm.university_id) as count
    FROM authors a
    JOIN texts t ON t.author_id = a.id
    JOIN syllabus_map sm ON sm.text_id = t.id
    GROUP BY a.id
    ORDER BY count DESC
    LIMIT 10
  `

    const topAuthors = topAuthorsRaw.map((row: any) => ({
        id: row.id,
        name: row.name,
        count: Number(row.count)
    }))

    return {
        universityCount,
        textCount,
        authorCount,
        latestUniversities,
        topTexts,
        topAuthors,
    }
}

export type BrowseParams = {
    page?: number
    pageSize?: number
    search?: string
    universities?: string[]
    semesters?: number[]
    sort?: string // "title", "author", "credits"
}

export async function getBrowseData(params: BrowseParams) {
    const { page = 1, pageSize = 20, search, universities, semesters, sort } = params
    const skip = (page - 1) * pageSize

    // Construct filter for Texts based on related SyllabusEntries
    const where: Prisma.TextWhereInput = {
        AND: [
            search ? {
                OR: [
                    { title: { contains: search } },
                    { author: { name: { contains: search } } }
                ]
            } : {},
            // Use 'some' to filter texts that have at least one matching syllabus entry
            (universities && universities.length > 0) || (semesters && semesters.length > 0) ? {
                syllabusEntries: {
                    some: {
                        AND: [
                            universities && universities.length > 0 ? {
                                university: { name: { in: universities } }
                            } : {},
                            semesters && semesters.length > 0 ? {
                                semester: { in: semesters }
                            } : {}
                        ]
                    }
                }
            } : {}
        ]
    }

    // Sorting
    let orderBy: Prisma.TextOrderByWithRelationInput = {}
    if (sort === "Author") {
        orderBy = { author: { name: "asc" } }
    } else if (sort === "Credits") {
        // Sorting by credits is tricky here because credits belong to the syllabus entry, valid for specific university.
        // Texts don't have credits directly. 
        // We can either remove this sort option or sort by max/avg credits (hard with Prisma).
        // Let's fallback to Title sort for now or remove the option in frontend.
        orderBy = { title: "asc" }
    } else {
        // Default Title
        orderBy = { title: "asc" }
    }

    const [data, total] = await Promise.all([
        prisma.text.findMany({
            where,
            include: {
                author: true,
                _count: {
                    select: { syllabusEntries: true }
                }
            },
            skip,
            take: pageSize,
            orderBy,
        }),
        prisma.text.count({ where })
    ])

    return { data, total, page, pageSize }
}

export async function getAllUniversities() {
    return prisma.university.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function getAllAuthors() {
    return prisma.author.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function getTextDetails(id: number) {
    const text = await prisma.text.findUnique({
        where: { id },
        include: {
            author: true,
            syllabusEntries: {
                include: { university: true },
                orderBy: { university: { name: 'asc' } }
            }
        }
    })

    return text
}

export async function getAuthorDetails(id: number) {
    const author = await prisma.author.findUnique({
        where: { id },
        include: {
            texts: {
                include: {
                    _count: {
                        select: { syllabusEntries: true }
                    }
                }
            }
        }
    })

    if (!author) return null

    // Get all syllabus entries for all texts by this author to find universities
    const textIds = author.texts.map((t: { id: number }) => t.id)
    const syllabusEntries = await prisma.syllabusEntry.findMany({
        where: {
            textId: { in: textIds }
        },
        include: {
            university: true,
            text: true
        }
    })

    // Aggregate universities (unique)
    const distinctUniversities = Array.from(
        new Map(syllabusEntries.map((e: { universityId: any; university: any }) => [e.universityId, e.university])).values()
    )

    // Calculate total universities count (unique universities across all texts)
    const totalUniversities = distinctUniversities.length

    return {
        ...author,
        texts: author.texts.map((t: any) => ({
            ...t,
            universityCount: t._count.syllabusEntries
        })),
        universities: distinctUniversities,
        totalUniversities,
        // Optional: grouped usage data if needed
        usage: syllabusEntries
    }
}
