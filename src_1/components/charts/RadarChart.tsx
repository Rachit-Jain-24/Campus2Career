"use client";

import {
    Radar,
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

interface RadarChartProps {
    data: Array<{ skill: string; value: number }>;
}

export function RadarChart({ data }: RadarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsRadarChart data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="hsl(348 83% 47%)"
                    fill="hsl(348 83% 47%)"
                    fillOpacity={0.6}
                />
            </RechartsRadarChart>
        </ResponsiveContainer>
    );
}
