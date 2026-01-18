"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsChartsProps {
    topTexts: { id: number; name: string; count: number }[]
    topAuthors: { id: number; name: string; count: number }[]
}

import { useRouter } from "next/navigation"

export function AnalyticsCharts({ topTexts, topAuthors }: AnalyticsChartsProps) {
    const router = useRouter()

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Top Prescribed Texts</CardTitle>
                    <CardDescription>
                        Most frequently included texts across university syllabi.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={topTexts}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="currentColor"
                                radius={[4, 4, 0, 0]}
                                className="fill-primary cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(data: any) => data.id && router.push(`/text/${data.id}`)}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Top Authors</CardTitle>
                    <CardDescription>
                        Authors with the most texts in syllabi.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={topAuthors} layout="vertical" margin={{ left: 40 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="currentColor"
                                radius={[0, 4, 4, 0]}
                                className="fill-primary cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(data: any) => data.id && router.push(`/author/${data.id}`)}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
