import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { StarRating } from "../ui/StarRating";
import { Calendar, Shield, Award } from "lucide-react";
import { toast } from "react-toastify";

type Certificate = {
  certificate_id: string;
  propertyAddress: string;
  clientName: string;
  rating: number;
  grade: string;
  issued_at: string;
};

export const EngineerCompleted: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/certificates/completed/",
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to load certificates");
      }

      const data = await res.json();
      setCertificates(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const gradeColors: Record<string, string> = {
    "A+": "text-green-600 bg-green-50",
    "A": "text-green-600 bg-green-50",
    "B+": "text-blue-600 bg-blue-50",
    "B": "text-blue-600 bg-blue-50",
    "C": "text-orange-600 bg-orange-50",
    "D": "text-red-600 bg-red-50",
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Issued Certificates
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          All certificates you've issued.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            No certificates issued yet.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.certificate_id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/25">
                  <Award className="w-6 h-6 text-white" />
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-lg font-black ${
                    gradeColors[cert.grade]
                  }`}
                >
                  {cert.grade}
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
                {cert.propertyAddress}
              </h3>

              <div className="text-xs text-gray-500 mb-1">
                Client: {cert.clientName}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <Calendar className="w-3 h-3" />
                {new Date(cert.issued_at).toLocaleDateString("en-GB")}
              </div>

              <StarRating
                rating={Number(cert.rating)}
                size="sm"
                showValue
              />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};