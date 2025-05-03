import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Workouts', value: 85 },
  { name: 'Nutrition', value: 72 },
  { name: 'Mindset', value: 68 },
  { name: 'Sleep', value: 65 },
  { name: 'Recovery', value: 58 },
];

const CategoryComparisonChart = () => {
  return (
    <div className="w-full bg-[#1A1A1A] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Category Comparison</h3>
      <div className="w-[800px] mx-auto">
        <ResponsiveContainer width="100%" height={100}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fill: '#fff' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#2A2A2A',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
              }}
            />
            <Bar
              dataKey="value"
              fill="#4CAF50"
              barSize={15}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryComparisonChart; 