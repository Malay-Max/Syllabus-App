import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

// Prevent Next.js from caching the response
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replace(/\s+/g, '_');
        const uploadDir = path.join(process.cwd(), 'uploads');

        // Ensure uploads directory exists
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir);
        }

        const filePath = path.join(uploadDir, `${Date.now()}_${filename}`);
        await fs.writeFile(filePath, buffer);

        const scriptPath = path.join(process.cwd(), 'syllabus-scrapper.py');
        const dbPath = path.join(process.cwd(), 'prisma', 'syllabus_master.db');

        // Use python3 on Linux/Docker, specific path on Windows
        const pythonPath = process.platform === 'win32'
            ? "c:\\Users\\malay\\AppData\\Local\\Programs\\Python\\Python310\\python.exe"
            : "python3";

        // Create a streaming response
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            start(controller) {
                // Spawn python process with -u for unbuffered output
                const pythonProcess = spawn(pythonPath, ['-u', scriptPath, filePath, '--db', dbPath]);

                pythonProcess.stdout.on('data', (data) => {
                    controller.enqueue(encoder.encode(data.toString()));
                });

                pythonProcess.stderr.on('data', (data) => {
                    const text = data.toString();
                    // Filter out the specific known warnings to keep UI clean, or showing them is fine too.
                    // For now, let's just stream them as Logs.
                    controller.enqueue(encoder.encode(`[Log]: ${text}`));
                });

                pythonProcess.on('close', async (code) => {
                    // Cleanup
                    try {
                        await fs.unlink(filePath);
                    } catch (e) {
                        console.error("Failed to delete temp file", e);
                    }

                    if (code === 0) {
                        controller.enqueue(encoder.encode('\n✅ Process completed successfully!'));

                        // Force Prisma to disconnect and clear its cache
                        // This is necessary because Python wrote directly to the DB
                        const { prisma } = await import('@/lib/db');
                        await prisma.$disconnect();

                        // Wait a moment then revalidate paths
                        await new Promise(resolve => setTimeout(resolve, 100));
                        revalidatePath('/');
                        revalidatePath('/browse');
                    } else {
                        controller.enqueue(encoder.encode(`\n❌ Process failed with code ${code}`));
                    }
                    controller.close();
                });

                pythonProcess.on('error', (err) => {
                    controller.enqueue(encoder.encode(`\n❌ Failed to start process: ${err.message}`));
                    controller.close();
                });
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
