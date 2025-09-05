
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Performance } from '../../types';

interface RunsChartProps {
    performances: Performance[];
}

export const RunsChart: React.FC<RunsChartProps> = ({ performances }) => {
    const data = performances
        .filter(p => !p.dnbBat)
        .map((p, i) => ({
            name: `Inn ${i + 1}`,
            runs: p.runs || 0,
        }));

    return (
        <div className="w-full h-full">
            <h3 className="text-lg font-semibold mb-2">Runs per Innings</h3>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="runs" stroke="#1a73e8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
