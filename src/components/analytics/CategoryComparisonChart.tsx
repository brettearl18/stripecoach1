import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '@/lib/services/database';
import { useAuth } from '@/hooks/useAuth';

interface CategoryData {
  name: string;
  value: number;
}

const CategoryComparisonChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        const dateRange = {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          end: new Date()
        };

        const categoryData = await analyticsService.getCategoryComparison(user.uid, dateRange);
        setData(categoryData);
      } catch (error) {
        console.error('Error fetching category comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="w-full bg-[#1A1A1A] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Category Comparison</h3>
        <div className="w-[800px] mx-auto h-[100px] flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

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