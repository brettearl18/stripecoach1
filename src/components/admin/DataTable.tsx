'use client';

import React from 'react';

interface Column {
  header: string;
  key: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: (item: any) => React.ReactNode;
}

export function DataTable({ columns, data, actions }: DataTableProps) {
  return (
    <div className="bg-[#1a1b1e] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left text-sm font-medium text-gray-400 tracking-wider"
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-800/50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap"
                >
                  {column.render
                    ? column.render(item[column.key], item)
                    : item[column.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-right text-sm">
                  {actions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 