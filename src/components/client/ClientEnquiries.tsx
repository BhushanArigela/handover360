import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { DashboardLayout } from "../layout/DashboardLayout";
import { StatusBadge } from "../ui/StatusBadge";
import { Modal } from "../ui/Modal";
import { MapPin, Calendar, User,Building2, Search, FileText,Home} from "lucide-react";

interface Enquiry {
  enquiry_id: string;
  propertyType: string;
  propertyAddress: string;
  city: string;
  pincode: string;
  constructionStage: string;
  description?: string;
  status:
    | "pending"
    | "field_engineer_assigned"
    | "inspection_completed"
    | "under_review"
    | "certificate_issued";
  created_at: string;
  updated_at: string;
}

interface InfoItemProps {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string;
}

export const ClientEnquiries: React.FC = () => {
  const { currentUser, submissions, questions } = useApp();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  if (!currentUser) return null;

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchEnquiries();
    }, 500);

    return () => clearTimeout(delay);
  }, [search, filter]);

  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem("token");

      let url =
        "http://127.0.0.1:8000/api/enquiries/my-enquiries/";

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (filter !== "all") {
        params.append("status", filter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setEnquiries(data);
      } else {
        console.error(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selected = enquiries.find(
    (e) => e.enquiry_id === selectedId
  );

  const selectedSubmission = selected
    ? submissions.find(
        (s) => s.enquiryId === selected.enquiry_id
      )
    : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          Loading enquiries...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Enquiries</h2>
        <p className="text-gray-500 text-sm mt-1">Pending Enquiries assignments for site visits.</p>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by address or city..."
            className="w-full pl-10 pr-4 py-2.5 border bg-white border-gray-200 rounded-xl text-sm"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 bg-white rounded-xl"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="field_engineer_assigned">Field Engineer Assigned</option>
          <option value="inspection_completed">
            Inspection Completed
          </option>
          <option value="under_review">
            Under Review
          </option>
          <option value="certificate_issued">
            Certificate Issued
          </option>
        </select>
      </div>

      <div className="space-y-3">
        {enquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">
              No enquiries found.
            </p>
          </div>
        ) : (
          enquiries.map((enq) => (
            <div
              key={enq.enquiry_id}
              onClick={() =>
                setSelectedId(enq.enquiry_id)
              }
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md  transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="w-24 h-24 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                  <MapPin className="w-12 h-12" /> 
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-400">
                      #
                      {enq.enquiry_id
                        .slice(-6)
                        .toUpperCase()}
                    </span>

                    <StatusBadge status={enq.status} />
                  </div>

                  <h3 className="font-semibold text-gray-900">
                    {enq.propertyAddress}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {enq.city}
                    </span>

                    <span>
                      {enq.propertyType}
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(
                        enq.created_at
                      ).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                setSelectedId(enq.enquiry_id)
              }
                  className="cursor-pointer px-4 py-3 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  View Enquiry
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                  <FileText  className="w-5 h-5 " /></span>
                <span>Enquiry Details</span>
              </div>
            }
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-gray-400">
                #
                {selected.enquiry_id
                  .slice(-6)
                  .toUpperCase()}
              </span>

              <StatusBadge status={selected.status} />
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200  transition-shadow">
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoItem
                icon= {Building2}
                label="Property Type"
                value={selected.propertyType}
              />

              <InfoItem
                icon= {Home}
                label="Construction Stage"
                value={selected.constructionStage}
              />

              <InfoItem
                icon= {MapPin}
                label="Address"
                value={selected.propertyAddress}
              />

              <InfoItem
                icon= {User}
                label="City / Pincode"
                value={`${selected.city} - ${selected.pincode}`}
              />

              <InfoItem
                icon= {Calendar}
                label="Created"
                value={new Date(
                  selected.created_at
                ).toLocaleString("en-GB")}
              />
            </div>
          </div>

            {selected.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Description
                </h4>

                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                  {selected.description}
                </p>
              </div>
            )}

            {selectedSubmission && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">
                  Inspection Summary
                </h4>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p>
                    Field Engineer:{" "}
                    {selectedSubmission.agentName}
                  </p>

                  <p>
                    Responses:{" "}
                    {
                      selectedSubmission.responses
                        .length
                    }
                    /{questions.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};


const InfoItem: React.FC<InfoItemProps> = ({
  label,
  icon: Icon,
  value,
}) => (
  <div className="flex items-start gap-3">

    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
      <Icon className="w-5 h-5 text-orange-600" />
    </div>

  <div>
    <div className="text-xs font-medium text-gray-500 mb-1">
      {label}
    </div>

    <div className="text-sm font-medium text-gray-900">
      {value}
    </div>
  </div>
  </div>
);