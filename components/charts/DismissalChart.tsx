
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DismissalChartProps {
    dismissalTypes: { [key: string]: number };
}

const COLORS = ['#d93025', '#1e8e3e', '#ff9800', '#1a73e8', '#5f6368', '#f1f3f4', '#202124'];

export const DismissalChart: React.FC<DismissalChartProps> = ({ dismissalTypes }) => {
    const data = Object.entries(dismissalTypes).map(([name, value]) => ({ name, value }));
    
    if(data.length === 0) {
        return <div className="flex items-center justify-center h-full"><p>No dismissal data available.</p></div>
    }

    return (
        <div className="w-full h-full">
            <h3 className="text-lg font-semibold mb-2">Dismissal Analysis</h3>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
