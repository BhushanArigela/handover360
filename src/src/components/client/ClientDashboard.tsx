import React from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { ClipboardList, CheckCircle, Clock, PlusCircle, MapPin, ArrowRight, Shield } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { API_URL } from '../../config/env';

interface Enquiry {
  enquiry_id: string;
  propertyType: string;
  propertyAddress: string;
  city: string;
  status:
    | "pending"
    | "field_engineer_assigned"
    | "inspection_completed"
    | "under_review"
    | "certificate_issued";
  created_at: string;
}

export const ClientDashboard: React.FC = () => {
  const { currentUser, navigate } = useApp();

  const [enquiries, setEnquiries] = React.useState<Enquiry[]>([]);
  const [loading, setLoading] = React.useState(true);

  if (!currentUser) return null;

  React.useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/enquiries/my-enquiries/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setEnquiries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pending = enquiries.filter(
    (e) => e.status !== "certificate_issued"
  );

  const completed = enquiries.filter(
    (e) => e.status === "certificate_issued"
  );

  const stats = [
    {
      label: "Total Enquiries",
      value: enquiries.length,
      icon: ClipboardList,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "In Progress",
      value: pending.length,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Completed",
      value: completed.length,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bg: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Certificates",
      value: completed.length,
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8 bg-blue-100 rounded-2xl border border-gray-100 overflow-hidden welcome-banner">
        <div className="welcome-content">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {(currentUser?.name?.trim() ? currentUser.name.split(" ")[0] : currentUser?.username) || "User"}! <span className="wave">👋</span></h2>
          <p className="text-gray-900 mt-3">Manage your inspection assignments and  submit reports with ease.</p>
        </div>
         <div className="welcome-image">
            <img src="images/check-list.png" alt="check-list"/>
        </div>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl flex gap-4 items-center p-5 border border-gray-100"
          >
            <div
              className={`w-16 h-16 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
            </div>

            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className={`text-sm text-gray-500 ${stat.textColor}`}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action */}
      <div className="mb-8">
        <button
          onClick={() =>
            navigate("client-new-enquiry")
          }
          className="flex items-center gap-3 px-6 py-4 bg-orange-500 hover:bg-orange-600 cursor-pointer text-white rounded-2xl"
        >
          <PlusCircle className="w-5 h-5" />
          Book New Inspection
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            Recent Enquiries
          </h3>

          <button
            onClick={() =>
              navigate("client-enquiries")
            }
            className="text-sm text-orange-600"
          >
            View All →
          </button>
        </div>

        {enquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No enquiries yet
          </div>
        ) : (
          <div className="divide-y">
            {enquiries.slice(0, 5).map((enq) => (
              <div
                key={enq.enquiry_id}
                onClick={() =>
                  navigate("client-enquiries")
                }
                className="p-4 flex items-center gap-4 hover:bg-gray-50 border-gray-100 cursor-pointer"
              >
                <div className="w-18 h-18 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                  <MapPin className="w-10 h-10" /> 
                </div>

                <div className="flex-1">
                  <div className="text-md font-semibold">
                    {enq.propertyAddress}
                  </div>
                  <div className="text-sm text-gray-500">
                    {enq.propertyType} • {enq.city}
                  </div>
                </div>

                <StatusBadge
                  status={enq.status}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};