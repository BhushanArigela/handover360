import React from 'react';
import { EnquiryStatus } from '../../types';

type StatusStyle = {
  label: string;
  color: string;
  iconBg: string;
  iconColor: string;
};

export const statusConfig: Record<
  EnquiryStatus, StatusStyle> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },

  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },

  field_engineer_assigned: {
    label: 'Field Engineer Assigned',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },

  inspection_scheduled: {
    label: 'Scheduled',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },

  inspection_in_progress: {
    label: 'In Progress',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },

  inspection_completed: {
    label: 'Inspection Done',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },

  under_review: {
    label: 'Under Review',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },

  review_completed: {
    label: 'Review Done',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },

  certificate_issued: {
    label: 'Certified ✓',
    color: 'bg-green-100 text-green-800 border-green-200',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
};

export const StatusBadge: React.FC<{ status: EnquiryStatus }> = ({ status }) => {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};


