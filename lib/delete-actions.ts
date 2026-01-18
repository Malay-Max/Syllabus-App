"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Bulk delete texts and their associated syllabus entries.
 */
export async function deleteTexts(ids: number[]) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Delete associated syllabus entries first (foreign key constraint)
            await tx.syllabusEntry.deleteMany({
                where: {
                    textId: { in: ids }
                }
            })

            // 2. Delete the texts
            await tx.text.deleteMany({
                where: {
                    id: { in: ids }
                }
            })
        })
        revalidatePath("/")
        revalidatePath("/browse")
        revalidatePath("/manage")
        return { success: true, message: `Deleted ${ids.length} texts successfully.` }
    } catch (error: any) {
        console.error("Failed to delete texts:", error)
        return { success: false, message: `Failed to delete texts: ${error.message}` }
    }
}

/**
 * Delete an author and all their texts and syllabus entries.
 */
export async function deleteAuthor(id: number) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Find all texts by this author to clean up their syllabus entries
            const texts = await tx.text.findMany({
                where: { authorId: id },
                select: { id: true }
            })
            const textIds = texts.map(t => t.id)

            // 2. Delete syllabus entries for these texts
            if (textIds.length > 0) {
                await tx.syllabusEntry.deleteMany({
                    where: {
                        textId: { in: textIds }
                    }
                })
            }

            // 3. Delete texts
            await tx.text.deleteMany({
                where: { authorId: id }
            })

            // 4. Delete author
            await tx.author.delete({
                where: { id }
            })
        })
        revalidatePath("/")
        revalidatePath("/browse")
        revalidatePath("/manage")
        return { success: true, message: "Author and associated data deleted successfully." }
    } catch (error: any) {
        console.error("Failed to delete author:", error)
        return { success: false, message: `Failed to delete author: ${error.message}` }
    }
}

/**
 * Delete a university and all associated syllabus entries.
 */
export async function deleteUniversity(id: number) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Delete all syllabus entries for this university
            await tx.syllabusEntry.deleteMany({
                where: { universityId: id }
            })

            // 2. Delete university
            await tx.university.delete({
                where: { id }
            })
        })
        revalidatePath("/")
        revalidatePath("/browse")
        revalidatePath("/manage")
        return { success: true, message: "University and associated records deleted successfully." }
    } catch (error: any) {
        console.error("Failed to delete university:", error)
        return { success: false, message: `Failed to delete university: ${error.message}` }
    }
}

/**
 * Delete all syllabus entries for a specific semester of a university.
 */
export async function deleteSemesterData(universityId: number, semester: number) {
    try {
        const result = await prisma.syllabusEntry.deleteMany({
            where: {
                universityId,
                semester
            }
        })
        revalidatePath("/")
        revalidatePath("/browse")
        revalidatePath("/manage")
        return { success: true, message: `Deleted ${result.count} records for Semester ${semester}.` }
    } catch (error: any) {
        console.error("Failed to delete semester data:", error)
        return { success: false, message: `Failed to delete data: ${error.message}` }
    }
}
