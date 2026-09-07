import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { StatusBadge } from '../ui/StatusBadge';
import { MapPin, Calendar, CheckCircle } from 'lucide-react';
import { toast } from "react-toastify";

export const AgentCompleted: React.FC = () => {
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetchCompleted();
    }, []);

  const fetchCompleted = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://127.0.0.1:8000/api/enquiries/agent/completed/",
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    const data = await response.json();
    setCompleted(data);
    setLoading(false);
  };

  // if (loading) {
  //   return (
  //     <DashboardLayout>
  //       <div className="p-6">Loading...</div>
  //     </DashboardLayout>
  //   );
  // }
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Completed Inspections
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          History of all your completed inspection reports.
        </p>
      </div>

      {completed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <CheckCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            No completed inspections yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map((enq: any) => (
            <div
              key={enq.enquiry_id}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">
                      #{enq.enquiry_id.slice(-4).toUpperCase()}
                    </span>

                    <StatusBadge status={enq.status} />
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {enq.propertyAddress}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {enq.city}
                    </span>

                    <span>{enq.propertyType}</span>

                    {enq.clientName && (
                      <span>
                        Client: {enq.clientName}
                      </span>
                    )}

                    {enq.completed_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(enq.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
