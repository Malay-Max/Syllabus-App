"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, FileText } from "lucide-react"

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null)

    const [logs, setLogs] = useState<string[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setStatus(null)
            setLogs([])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setLoading(true)
        setStatus(null)
        setLogs(["Starting upload..."])

        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.body) {
                throw new Error("No response body")
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let done = false

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value, { stream: !done })
                if (chunkValue) {
                    setLogs(prev => [...prev, chunkValue])
                }
            }

            setStatus({ success: true, message: "Process finished." })

        } catch (error: any) {
            console.error(error)
            setStatus({ success: false, message: error.message || "An unexpected error occurred." })
            setLogs(prev => [...prev, `\nError: ${error.message}`])
        } finally {
            setLoading(false)
            if (status?.success) setFile(null)
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Upload className="w-6 h-6" />
                        Upload Syllabus PDF
                    </CardTitle>
                    <CardDescription>
                        Upload a syllabus PDF. The system will process it and show progress below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Input
                                id="syllabus-file"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </div>

                        {file && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md">
                                <FileText className="w-4 h-4" />
                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={!file || loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Upload & Process"
                            )}
                        </Button>
                    </form>

                    {(logs.length > 0 || status) && (
                        <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-md h-64 overflow-y-auto whitespace-pre-wrap border border-green-900 shadow-inner">
                            {logs.join("")}
                            {loading && <span className="animate-pulse">_</span>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
