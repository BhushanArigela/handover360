import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { StatusBadge, statusConfig } from '../ui/StatusBadge';
import { RecentEnquiry } from "../../types";
import { apiFetch } from "../../services/api";
import { error } from "../../utils/toast";
import { formatDate } from "../../utils/date";

import {
  Users, ClipboardList, Shield, UserCheck, Award, TrendingUp, ArrowRight, AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {  
  const { currentUser, navigate } = useApp();
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([]);
  const [pendingEnquiries, setPendingEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [builders, setBuilders] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  // const [enquiries, setEnquiries] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  // const [certificates, setCertificates] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
  });

  
  const statsCards = [
  {
    label: "Total Users",
    value: users.length,
    sub: `${builders.length} builders, ${buyers.length} buyers`,
    icon: Users,
    bg: "bg-blue-50",
  },
  {
    label: "Total Enquiries",
    value: stats.total,
    sub: `${stats.pending} pending`,
    icon: ClipboardList,
    bg: "bg-orange-50",
  },
  {
    label: "Active Inspections",
    value: stats.active,
    sub: `${submissions.length} reports submitted`,
    icon: TrendingUp,
    bg: "bg-green-50",
  },
  {
    label: "Certificates Issued",
    value: stats.completed,
    sub: `${agents.length} field engineer(s), ${engineers.length} technical auditor(s)`,
    icon: Shield,
    bg: "bg-purple-50",
  },
];

  // if (loading) {
  //   return (
  //     <DashboardLayout>
  //       <div className="p-8 text-center">
  //         Loading...
  //       </div>
  //     </DashboardLayout>
  //   );
  // }
  
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      try {
        await Promise.all([
          fetchDashboard(),
          fetchPendingEnquiries(),
          fetchRecentEnquiries(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);
  
  const fetchDashboard = async () => {
    try {
      const res = await apiFetch(
        "/enquiries/dashboard/",
        {},
        navigate
      );

      // const data = await res.json();

      setUsers(Array(res.users.total).fill({}));
      setBuilders(Array(res.users.builders).fill({}));
      setBuyers(Array(res.users.buyers).fill({}));
      setAgents(Array(res.users.agents).fill({}));
      setEngineers(Array(res.users.engineers).fill({}));
      setStats(res.stats);
      // setEnquiries(data.recent_enquiries);
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to load dashboard");
    }
  };

  const fetchRecentEnquiries = async () => {
    try {
      setLoading(true);

      const res = await apiFetch(
        "/enquiries/all_enquiries/",
        {},
        navigate
      );

      // const data = await res.json();

      setRecentEnquiries(res);
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPendingEnquiries = async () => {
    try {
      const res = await apiFetch(
        "/enquiries/pending_enquiries/",
        {},
        navigate
      );

      // const data = await res.json();

      setPendingEnquiries(res);
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to load pending enquiries");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-lg">
            Loading certificates...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {(currentUser?.name?.trim() ? currentUser.name.split(" ")[0] : currentUser?.username) || "User"} ⚙️</h2>
        <p className="text-gray-500 mt-1">Overview of the Handover360 platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl flex gap-4 items-center p-5 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-6 h-6`} />
            </div>
            <div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
          </div></div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Manage Enquiries', icon: ClipboardList, page: 'admin-enquiries', color: 'gradient-blue hover:bg-blue-700' },
          { label: 'Manage Field Engineer', icon: UserCheck, page: 'admin-agents', color: 'gradient-green hover:bg-emerald-700' },
          { label: 'Manage Technical Auditor', icon: Award, page: 'admin-engineers', color: 'gradient-purple hover:bg-purple-700' },
          { label: 'Certificates', icon: ClipboardList, page: 'admin-certificates', color: 'gradient-orange hover:bg-orange-700' },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.page)}
            className={`${action.color} flex items-center gap-3 bg-gradient-to-r  text-white p-6 rounded-xl text-left transition-colors group`}
          >
            <action.icon className="w-8 h-8 mb-0" />
            <div className="text-sm font-semibold flex items-center gap-1">
              {action.label}
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-3 mb-8">
      {/* Pending Enquiries */}
      
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center gap-2 p-5 border-b border-gray-100">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-gray-900">
              Pending Enquiries ({pendingEnquiries.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            {pendingEnquiries.length === 0 && (
              <div className="p-12 text-center text-gray-400">No pending enquiries found.</div>
            )}
            {pendingEnquiries.length > 0 && pendingEnquiries.map((enq) => (
              <div
                key={enq.enquiry_id || enq.id}
                className="p-4 hover:bg-gray-50 flex items-center gap-4 cursor-pointer"
                onClick={() => navigate("admin-enquiries")}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {enq.propertyAddress}
                  </div>

                  <div className="text-xs text-gray-500">
                    {enq.propertyType} • {enq.city} •{" "}
                    {formatDate(enq.created_at || enq.createdAt)}
                  </div>
                </div>

                <StatusBadge status={enq.status} />
              </div>
            ))}
          </div>
        </div>
     

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Recent Enquiries</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
        {recentEnquiries.length === 0 && (
          <div className="p-12 text-center text-gray-400">No recent enquiries found.</div>
        )}
        {recentEnquiries.slice(0, 8).map((enq) => {

          const cfg = statusConfig[enq.status];

          return (
            <div
              key={enq.enquiry_id}
              className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >

              <div className="flex-1 min-w-0 flex gap-4 items-center">

                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    cfg?.iconBg ?? "bg-gray-100"
                  }`}
                >
                  <Users
                    className={`w-5 h-5 ${
                      cfg?.iconColor ?? "text-gray-600"
                    }`}
                  />
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {enq.propertyAddress || "-"} {enq.city}
                  </div>

                  <div className="text-xs text-gray-500">
                    {enq.created_by_name || "-"} •{" "}
                    {enq.propertyType || "-"} •{" "}
                    {enq.created_at
                      ? new Date(enq.created_at).toLocaleDateString("en-GB")
                      : "-"}
                  </div>
                </div>

              </div>

              <StatusBadge status={enq.status} />

            </div>
          );

        })}
      </div>
      </div>
      </div>
    </DashboardLayout>
  );
};
