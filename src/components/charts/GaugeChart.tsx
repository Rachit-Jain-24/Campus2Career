"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeChartProps {
    value: number;
    maxValue?: number;
    label: string;
}

export function GaugeChart({ value, maxValue = 100, label }: GaugeChartProps) {
    const percentage = (value / maxValue) * 100;
    const data = [
        { value: percentage },
        { value: 100 - percentage },
    ];

    const getColor = (val: number) => {
        if (val >= 75) return "#10b981";
        if (val >= 50) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                    >
                        <Cell fill={getColor(percentage)} />
                        <Cell fill="#e5e7eb" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
            </div>
        </div>
    );
}
