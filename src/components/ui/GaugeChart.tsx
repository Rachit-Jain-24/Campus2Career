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
                        outerRadius={85}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={getColor(percentage)} />
                        <Cell fill="#f1f5f9" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="-mt-16 text-center">
                <div className="text-4xl font-black text-slate-900">{value}%</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
}
