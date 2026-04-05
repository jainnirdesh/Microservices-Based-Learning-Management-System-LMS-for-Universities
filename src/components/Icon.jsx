import React from 'react';

const paths = {
  Grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  Share2: 'M18 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM6 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-1.5-3.5-9-5m9 5-9 5',
  ClipboardList: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4',
  Bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9m-4.27 13a2 2 0 0 1-3.46 0',
  Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  BarChart2: 'M18 20V10M12 20V4M6 20v-6',
  Users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 8v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75',
  BookOpen: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  Settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8.94-4a9 9 0 0 0-.46-1.47l2.11-1.63-2-3.46-2.49 1a8.9 8.9 0 0 0-1.27-.74L16.5 2h-4l-.33 2.2a8.9 8.9 0 0 0-1.27.73l-2.49-1-2 3.46L8.52 9A9 9 0 0 0 8.06 10.5L6 11.5v3l2.06 1a9 9 0 0 0 .46 1.47l-2.11 1.63 2 3.46 2.49-1c.4.27.82.5 1.27.74L12.5 24h4l.33-2.2c.45-.23.88-.46 1.27-.73l2.49 1 2-3.46-2.11-1.63A9 9 0 0 0 20.94 15.5L23 14.5v-3z',
  LogOut: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  TrendingUp: 'M23 6l-9.5 9.5-5-5L1 18',
  ChevronRight: 'M9 18l6-6-6-6',
  ChevronDown: 'M6 9l6 6 6-6',
  Menu: 'M3 12h18M3 6h18M3 18h18',
  X: 'M18 6L6 18M6 6l12 12',
  Check: 'M20 6L9 17l-5-5',
  AlertCircle: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01',
  PlusCircle: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v8M8 12h8',
  Activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  FileText: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  Award: 'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0 0v6M8.21 13.89L7 23l5-3 5 3-1.21-9.12',
  Layers: 'M12 2L2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  Database: 'M12 2c-5.33 0-8 1.79-8 4v12c0 2.21 2.67 4 8 4s8-1.79 8-4V6c0-2.21-2.67-4-8-4zM4 12c0 2.21 2.67 4 8 4s8-1.79 8-4M4 6c0 2.21 2.67 4 8 4s8-1.79 8-4',
  Zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
};

export function Icon({ name, size = 16, className = '', strokeWidth = 1.8 }) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
