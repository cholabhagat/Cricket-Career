
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CareerProgressionChartProps {
    data: { match: number, battingAvg: string | number, bowlingAvg: string | number }[];
}

export const CareerProgressionChart: React.FC<CareerProgressionChartProps> = ({ data }) => {
    
    const formattedData = data.map(d => ({
        ...d,
        battingAvg: d.battingAvg === '∞' ? null : d.battingAvg,
        bowlingAvg: d.bowlingAvg === '–' ? null : d.bowlingAvg,
    }))

    return (
        <div className="w-full h-full">
            <h3 className="text-lg font-semibold mb-2">Career Progression</h3>
            <ResponsiveContainer>
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="match" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="battingAvg" name="Batting Avg" stroke="#4caf50" connectNulls />
                    <Line type="monotone" dataKey="bowlingAvg" name="Bowling Avg" stroke="#f44336" connectNulls />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
