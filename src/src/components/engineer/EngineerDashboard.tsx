import React, { useEffect, useState } from "react";
import { useApp } from '../../context/AppContext';
import { DashboardLayout } from "../layout/DashboardLayout";
import { StatusBadge } from "../ui/StatusBadge";
import { ClipboardList, CheckCircle, Clock, Shield, ArrowRight, MapPin} from "lucide-react";
import { toast } from "react-toastify";
import { API_URL } from '../../config/env';


export const EngineerDashboard: React.FC = () => {
  const { currentUser, navigate } = useApp();
  const [dashboard, setDashboard] = useState<any>(null);
  if (!currentUser) return null;

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/enquiries/engineer-dashboard/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!response.ok) {
        toast.error("Failed to load dashboard");
        throw new Error("Failed to load dashboard");
      }

      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      toast.error("Failed to load dashboard"+error);
      console.error(error);
    }
  };

  if (!dashboard) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: "Pending Reviews",
      value: dashboard.stats.pending_reviews,
      icon: Clock,
      color: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Reviews Done",
      value: dashboard.stats.reviews_done,
      icon: CheckCircle,
      color: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Certificates Issued",
      value: dashboard.stats.certificates_issued,
      icon: Shield,
      color: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Total Assigned",
      value: dashboard.stats.total_assigned,
      icon: ClipboardList,
      color: "bg-blue-50",
      textColor: "text-blue-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 bg-blue-100 rounded-2xl border border-gray-100 overflow-hidden welcome-banner">
        <div className="welcome-content">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {(currentUser?.name?.trim() ? currentUser.name.split(" ")[0] : currentUser?.username) || "User"}! <span className="wave">👋</span></h2>
          <p className="text-gray-900 mt-3">Review inspection reports and issue quality certificates.</p>
        </div>
         <div className="welcome-image">
            <img src="images/check-list.png" alt="check-list"/>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl flex gap-4 items-center p-5 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div
              className={`w-16 h-16 ${stat.color} rounded-xl flex items-center justify-center mb-3`}
            >
              <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
            </div>
            <div>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>

            <div className={`text-sm text-gray-500 ${stat.textColor}`}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            Pending Reviews</h3><button onClick={() => navigate('engineer-reviews')} className="text-sm text-blue-600 font-medium hover:text-blue-700">
            View All →
          </button>
        </div>

        {dashboard.pending_reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-300" />
            <p>No pending reviews!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {dashboard.pending_reviews.map((enq: any) => (
              <button
                key={enq.enquiry_id}
                onClick={() => navigate('engineer-reviews')}
                className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 text-left"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {enq.propertyAddress}
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {enq.city} • {enq.propertyType}
                  </div>
                </div>

                <StatusBadge status={enq.status} />

                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};