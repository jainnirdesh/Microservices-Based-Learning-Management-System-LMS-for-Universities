import React from 'react';

export function Table({ columns, rows, renderRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col}
                className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider first:pl-0"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row, i) => renderRow(row, i))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Active: 'bg-green-50 text-green-700',
    Inactive: 'bg-gray-100 text-gray-500',
    Pending: 'bg-amber-50 text-amber-700',
    Graded: 'bg-blue-50 text-blue-700',
    Closed: 'bg-gray-100 text-gray-500',
    High: 'bg-red-50 text-red-600',
    Medium: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`tag ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
  );
}
