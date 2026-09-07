import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { StatusBadge } from '../ui/StatusBadge';
import { ClipboardList, CheckCircle, Clock,Calendar, MapPin, ArrowRight } from 'lucide-react';
import { toast } from "react-toastify";

export const AgentDashboard: React.FC = () => {
  const { currentUser, navigate } = useApp();
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (!currentUser) return;
    fetchDashboard();
  }, [currentUser]);

  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/enquiries/agent-dashboard/",
        {
          headers: {
            Authorization: `Token ${token}`,
            },
          }
        );
        if (!response.ok) {
          toast.error("Failed to load.");
          return;
        }
        const data = await response.json();

        if (response.ok) {
          setDashboardData(data);
        }
        else{
          toast.error("Failed to load.");
        }
      } catch (err) {
        toast.error("Failed to load.");
        console.error(err);
      }
  };

  const stats = [
    {
      label: "Total Assigned",
      value: dashboardData?.stats?.total_assigned || 0,
      icon: ClipboardList,
      color: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Pending Visit",
      value: dashboardData?.stats?.pending_inspections || 0,
      icon: Clock,
      color: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Completed",
      value: dashboardData?.stats?.completed_inspections || 0,
      icon: CheckCircle,
      color: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Reports Submitted",
      value: dashboardData?.stats?.reports_submitted || 0,
      icon: ClipboardList,
      color: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];
  // const { currentUser, enquiries, submissions, navigate } = useApp();
  // if (!currentUser) return null;

  return (
    <DashboardLayout>
      <div className="mb-8 bg-blue-100 rounded-2xl border border-gray-100 overflow-hidden welcome-banner">
        <div className="welcome-content">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {(currentUser?.name?.trim() ? currentUser.name.split(" ")[0] : currentUser?.username) || "User"}! <span className="wave">👋</span></h2>
        <p className="text-gray-900 mt-3">Manage your inspection assignments and  submit reports with ease.</p>
        </div>
         <div className="welcome-image">
            <img src="images/check-list.png" alt="check-list"/>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl flex gap-4 items-center p-5 border border-gray-100">
            <div className={`w-16 h-16 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
            </div>
            <div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className={`text-sm text-gray-500 ${stat.textColor}`}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Assignments */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Pending Inspections</h3>
          <button onClick={() => navigate('agent-assignments')} className="text-sm text-blue-600 font-medium hover:text-blue-700">
            View All →
          </button>
        </div>
        {dashboardData?.pending_inspections.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-300" />
            <p>No pending inspections!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {dashboardData?.pending_inspections?.map((enq: any) => (
              <button
                key={enq.enquiry_id}
                onClick={() => { navigate('agent-assignments'); }}
                className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 text-left"
              >
                <div className="w-18 h-18 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                  <MapPin className="w-10 h-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-md font-semibold text-gray-900 truncate">{enq.propertyAddress}</div>
                  <div className="text-sm mb-2 mt-1 text-gray-500">{enq.clientName} • {enq.propertyType} • {enq.city}</div>
                  {/* <div className="text-xs flex items-center gap-2 text-orange-600"><Calendar className="w-4 h-4" />  Due: <b>24 May, 2025</b></div> */}
                </div>
                <StatusBadge status={enq.status} />
                <div className="w-8 h-8 bg-white-100 shadow-lg rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
