"use client";

interface GaugeChartProps {
    value: number;
    maxValue?: number;
    label: string;
}

export function GaugeChart({ value, maxValue = 100, label }: GaugeChartProps) {
    const percentage = Math.min(Math.max(value / maxValue, 0), 1);
    const size = 220;
    const strokeWidth = 14;
    const radius = size / 2 - strokeWidth;
    const circumference = radius * Math.PI; // Semicircle
    const offset = circumference - (percentage * circumference);
    const rotation = percentage * 180 - 180; // for the needle

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
                <svg width={size} height={size / 2 + 30} className="transform rotate-0 overflow-visible">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fee2e2" />
                            <stop offset="50%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#991b1b" />
                        </linearGradient>
                        <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                            <feOffset dx="0" dy="2" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.3" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background track */}
                    <path
                        d={`M 15, ${size / 2} A ${radius},${radius} 0 0,1 ${size - 15},${size / 2}`}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />

                    {/* Progress Path */}
                    <path
                        d={`M 15, ${size / 2} A ${radius},${radius} 0 0,1 ${size - 15},${size / 2}`}
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        filter="url(#gaugeShadow)"
                        className="transition-all duration-1000 ease-out"
                    />

                    {/* Needle Indicator */}
                    <g transform={`translate(${size / 2}, ${size / 2}) rotate(${rotation})`}>
                        <path 
                            d="M -2,0 L 2,0 L 0,-85 Z" 
                            fill="#1e293b" 
                            className="transition-transform duration-1000 ease-out origin-bottom"
                        />
                        <circle cx="0" cy="0" r="4" fill="#0f172a" stroke="white" strokeWidth="2" />
                    </g>
                </svg>

                {/* Internal Text Container */}
                <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
                    <div className="flex items-baseline gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-50">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter transition-all duration-700">
                            {Math.round(value)}
                        </span>
                        <span className="text-xl font-bold text-slate-400 font-sans">%</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">{label}</span>
                </div>
            </div>

            {/* Achievement Badge */}
            <div className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm
                ${value >= 85 ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 
                  value >= 70 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 
                  'bg-gradient-to-r from-slate-400 to-slate-600 text-white'} transition-all duration-700 hover:scale-105 cursor-default`}>
                {value >= 85 ? '🏆 Industry Ready' : value >= 70 ? '🚀 High Potential' : '🔥 Profile Building'}
            </div>
        </div>
    );
}
