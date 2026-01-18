"use server"

import { revalidatePath } from "next/cache"
import path from "path"
import fs from "fs/promises"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function uploadSyllabus(formData: FormData) {
    const file = formData.get("file") as File
    if (!file) {
        return { success: false, message: "No file uploaded" }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = file.name.replace(/\s+/g, '_') // Sanitize filename
    const uploadDir = path.join(process.cwd(), "uploads")

    // Ensure uploads directory exists
    try {
        await fs.access(uploadDir)
    } catch {
        await fs.mkdir(uploadDir)
    }

    const filePath = path.join(uploadDir, `${Date.now()}_${filename}`)
    await fs.writeFile(filePath, buffer)

    // Run python script
    // We assume the script is at root
    const scriptPath = path.join(process.cwd(), "syllabus-scrapper.py")
    const dbPath = path.join(process.cwd(), "prisma", "syllabus_master.db")

    // Use absolute path to python executable since it is not in PATH for the node process
    const pythonPath = "c:\\Users\\malay\\AppData\\Local\\Programs\\Python\\Python310\\python.exe"

    try {
        console.log(`Executing: "${pythonPath}" "${scriptPath}" "${filePath}" --db "${dbPath}"`)
        const { stdout, stderr } = await execAsync(`"${pythonPath}" "${scriptPath}" "${filePath}" --db "${dbPath}"`)
        console.log("Python Output:", stdout)
        if (stderr) console.error("Python Error:", stderr)

        // Cleanup file after processing
        await fs.unlink(filePath).catch(e => console.error("Failed to delete temp file:", e))

        revalidatePath("/")
        revalidatePath("/browse")

        return { success: true, message: "Syllabus processed and database updated successfully!" }
    } catch (error: any) {
        console.error("Script execution failed:", error)
        return { success: false, message: `Failed to process syllabus: ${error.message}` }
    }
}
