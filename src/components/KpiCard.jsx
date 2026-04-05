import React from 'react';
import { Icon } from './Icon';

export function KpiCard({ label, value, change, up, icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Icon name={icon} size={15} className="text-primary-600" />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</span>
        {change && (
          <span className={`text-xs font-medium mb-0.5 ${up ? 'text-green-600' : 'text-red-500'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

export function StatCard({ label, value, desc }) {
  return (
    <div className="card p-6 text-center">
      <div className="text-3xl font-semibold text-gray-900 tracking-tight mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      {desc && <div className="text-xs text-gray-400">{desc}</div>}
    </div>
  );
}
