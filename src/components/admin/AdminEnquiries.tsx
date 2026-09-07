import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Building2,
  Home,
  MapPin,
  User,
  CalendarDays,
  Hammer,
} from "lucide-react";
import { apiRequest } from "../../api/api";
import { DashboardLayout } from '../layout/DashboardLayout';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { Search, UserPlus, ArrowRight } from 'lucide-react';
import { apiFetch } from "../../services/api";
import { success, error } from "../../utils/toast";
import { EnquiryStatus } from '@/types';


interface InfoItemProps {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string;
}

export const AdminEnquiries: React.FC = () => {
  type Enquiry = {
    enquiry_id: string;
    propertyAddress: string;
    created_by_name: string;
    created_by_role:string;
    updated_by_name?: string;
    updated_by_role?: string;
    status: EnquiryStatus;
    propertyType?: string;
    city?: string;
    assignedAgent?: string;
    assignedEngineer?: string;
    created_at?: string;
  };

  const { updateEnquiryStatus, navigate } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAssignAgent, setShowAssignAgent] = useState(false);
  const [showAssignEngineer, setShowAssignEngineer] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const formatStatus = (status?: string | null) => {
    if (!status) return "Created";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  const fetchEnquiries = async () => {
    try {
      const res = await apiFetch(
        "/enquiries/all_enquiries/",
        {},
        navigate
      );

      // const data = await res.json();

      setEnquiries(res);
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to load enquiries");
    }
  };

  const openEnquiry = async (enquiryId: string) => {
    try {
      setLoading(true);

      const res = await apiFetch(
        `/enquiries/${enquiryId}/`,
        {},
        navigate
      );

      // const data = await res.json();

      setSelected(res);
    } catch (err: any) {
      console.error(err);
      error("Failed to load enquiry");
    } finally {
      setLoading(false);
    }
  }; 

  const fetchTemplates = async (propertyType: string) => {
    try {
      const res = await apiRequest(
        `/masters/templates/?property_type=${propertyType}&published=true`
      );

      setTemplates(res);
    } catch (err: any) {
      console.error(err);
      error("Failed to load templates");
    }
  };
  
  const confirmEnquiry = async (enquiryId: string) => {
    try {
      const res = await apiFetch(
        `/enquiries/${enquiryId}/change-status/`,
        {
          method: "POST",
          body: JSON.stringify({
            status: "confirmed",
            remarks: "Confirmed by admin",
          }),
        },
        navigate
      );

      success("Enquiry confirmed successfully");

      await fetchEnquiries();
      await openEnquiry(enquiryId);
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to confirm enquiry");
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await apiFetch(
        "/enquiries/assignable-users/?role=field_engineer",
        {},
        navigate
      );

      // const data = await res.json();

      setAgents(res);
    } catch (err: any) {
      console.error(err);
      error("Failed to load field engineer");
    }
  };

  const fetchEngineers = async () => {
    try {
      const res = await apiFetch(
        "/enquiries/assignable-users/?role=technical_auditor",
        {},
        navigate
      );

      // const data = await res.json();

      setEngineers(res);
    } catch (err: any) {
      console.error(err);
      error("Failed to load technical auditors");
    }
  };

  const assignAgent = async (
    enquiryId: string,
    agentId: string,
    templateId: number
  ) => {
    try {
      await apiFetch(
        `/enquiries/${enquiryId}/assign/`,
        {
          method: "POST",
          body: JSON.stringify({
            role: "field_engineer",
            assigned_to: agentId,
            template_id: templateId,
          }),
        },
        navigate
      );

      success("Field Engineer assigned successfully");

      await openEnquiry(enquiryId);

      setShowAssignAgent(false);

      fetchEnquiries();
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to assign field engineer");
    }
  };

  const assignEngineer = async (
    enquiryId: string,
    engineerId: string,
    templateId: number
  ) => {
    try {
      await apiFetch(
        `/enquiries/${enquiryId}/assign/`,
        {
          method: "POST",
          body: JSON.stringify({
            role: "technical_auditor",
            assigned_to: engineerId,
            template_id: templateId,
          }),
        },
        navigate
      );

      success("Technical Auditor assigned successfully");

      await openEnquiry(enquiryId);

      setShowAssignEngineer(false);

      fetchEnquiries();
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to assign technical auditor");
    }
  };

  
  const filtered = enquiries
    .filter(e => filter === 'all' || e.status === filter)
    .filter(
      e =>
        search === '' ||
        e.propertyAddress?.toLowerCase()?.includes(search.toLowerCase()) ||
        e.created_by_name?.toLowerCase()?.includes(search.toLowerCase())
    );

  const closeModal = () => {
    setSelectedId(null);
    setSelected(null);

    setShowAssignAgent(false);
    setShowAssignEngineer(false);

    setAgents([]);
    setEngineers([]);
  };
  

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by address or client name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="field_engineer_assigned">Field Engineer Assigned</option>
          <option value="inspection_completed">Inspection Completed</option>
          <option value="under_review">Under Review</option>
          <option value="certificate_issued">Certified</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto new ">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="text-left p-4 font-semibold text-gray-600">ID</th>
                <th className="text-left p-4 font-semibold text-gray-600">Property</th>
                <th className="text-left p-4 font-semibold text-gray-600">Client</th>
                <th className="text-left p-4 font-semibold text-gray-600">Field Engineer/ Technical Auditor</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {filtered.map(enq => (
                <tr key={enq.enquiry_id} className="hover:bg-gray-50 border  transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-400">#{enq.enquiry_id.slice(-4).toUpperCase()}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900 truncate max-w-48">{enq.propertyAddress}</div>
                    <div className="text-xs text-gray-500">{enq.city}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-900">{enq.created_by_name}</div>
                    <div className="text-xs text-gray-400">{enq.created_by_role ? enq.created_by_role.replace(/_/g, " ").replace(/\b\w/g, (c: any) => c.toUpperCase()) : "-"}</div>
                  </td>
                  <td className="p-4 text-gray-600"><div className="text-gray-900">{enq.updated_by_name}</div>
                    <div className="text-xs text-gray-400">{enq.updated_by_role ? enq.updated_by_role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "-"}</div>
                  </td>
                  <td className="p-4"><StatusBadge status={enq.status} /></td>
                  <td className="p-4 text-gray-500 text-xs"> {enq.created_at
                          ? new Date(enq.created_at).toLocaleString("en-GB")
                          : "-"}</td>
                  <td className="p-4">
                    <button
                      onClick={() => openEnquiry(enq.enquiry_id)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                    >
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-400">No enquiries found.</div>
        )}
      </div>

      {/* Manage Enquiry Modal */}
      <Modal isOpen={!!selected} onClose={closeModal} title="Manage Enquiry" size="lg">
        {selected && (
          <div className="space-y-5 ">
            
            <div className="flex items-center gap-2 mb-5">
              <span className="text-sm font-mono text-gray-400">#{selected.enquiry_id.slice(-4).toUpperCase()}</span>
              <StatusBadge status={selected.status} />
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200  transition-shadow">
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoItem icon={Home} label="Property" value={selected.propertyAddress} />
              <InfoItem icon={Building2} label="Type" value={selected.propertyType} />
              <InfoItem icon={MapPin} label="City / Pincode" value={`${selected.city} - ${selected.pincode}`} />
              <InfoItem icon={Hammer} label="Stage" value={selected.constructionStage} />
              <InfoItem icon={User} label="Client" value={selected.created_by ? `${selected.created_by.name} (${formatStatus(selected.created_by.role)})` : "-" } />
              <InfoItem icon={CalendarDays} label="Date" value={new Date(selected.created_at).toLocaleString("en-GB")} />
              {selected.agentName && <InfoItem icon={User} label="Field Engineer" value={selected.agentName} /> || selected.username && <InfoItem icon={User} label="Field Engineer" value={selected.username} />}
              {selected.engineerName && <InfoItem icon={User} label="Technical Auditor" value={selected.engineerName} />}
            </div>
          </div>
            {selected.description && (
              <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-lg transition-shadow">
                <div className="text-xs text-gray-500 mb-0.5">Description</div>
                <div className="text-sm text-gray-700">{selected.description}</div>
              </div>
            )}
            <div className=" pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                 Status History
              </h4>

              <div className="space-y-3 pl-8 Status-process">
                {selected.status_history?.map((item: any, index: any) => (
                  <div
                    key={index}
                    className="bg-white Status-process-dot rounded-2xl p-3 flex items-center gap-2 border border-gray-100 shadow-sm transition-shadow"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-0">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {formatStatus(item.from_status) || "Created"} → {formatStatus(item.to_status)}
                          
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {item.changed_by_name}
                        </div>

                      <div className="text-xs text-gray-400">
                        {new Date(item.changed_at).toLocaleString('en-GB')}
                      </div>
                      </div>
                    </div>
                    {item.remarks && (
                      <div className="text-sm mt-2">
                        {item.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Actions */}
            { ["pending", "confirmed", "inspection_completed"].includes(selected.status) && (

            
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h4 className="font-semibold text-gray-900">Actions</h4>
              <div className="flex gap-2">
              {/* Confirm Enquiry */}
              {selected.status === 'pending' && (
                
                  <button
                    onClick={() => { updateEnquiryStatus(selected.id, 'confirmed'); confirmEnquiry(selected.enquiry_id); setSelectedId(null); }}
                    className="px-4 py-2 bg-green-100 text-green-600 text-sm font-semibold rounded-md hover:bg-green-200"
                  >
                    ✓ Confirm Enquiry
                  </button>
                
              )}

              {/* Assign Field Engineer */}
              {["pending", "confirmed"].includes(selected.status) && (
                <div>
                  <button
                    onClick={async () => {
                      await fetchAgents();
                      await fetchTemplates(
                        selected.propertyType.toLowerCase().replace(/\s+/g, "_")                        
                      );

                      setSelectedAgent("");
                      setSelectedTemplate(null);

                      setShowAssignAgent(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 text-sm font-semibold rounded-md hover:bg-blue-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign Field Engineer
                  </button>

                  {showAssignAgent && (
                    <div className="mt-3 space-y-2 bg-gray-50 rounded-xl p-3">

                      {agents.length === 0 ? (
                        <div className="text-sm text-gray-500">
                          No field engineer found
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Field Engineer *
                            </label>

                            <select
                              value={selectedAgent}
                              onChange={(e) =>
                                setSelectedAgent(e.target.value)
                              }
                              className="w-full border rounded-lg px-3 py-2"
                            >
                              <option value="">
                                Select Field Engineer
                              </option>

                              {agents.map((agent) => (
                                <option
                                  key={agent.user_id}
                                  value={agent.user_id}
                                >
                                  {agent.name || agent.username}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Template *
                            </label>

                            <select
                              value={selectedTemplate ?? ""}
                               onChange={(e) =>
                                  setSelectedTemplate(Number(e.target.value))
                              }
                              className="w-full border rounded-lg px-3 py-2"
                            >
                              <option value="">
                                Select Template
                              </option>

                              {templates.map((template) => (
                                <option
                                  key={template.id}
                                  value={template.id}
                              >
                                  {template.name}
                              </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={async () => {

                              if (!selectedAgent) {
                                error(
                                  "Please select an field engineer"
                                );
                                return;
                              }

                              if (!selectedTemplate) {
                                error(
                                  "Please select a template"
                                );
                                return;
                              }

                              await assignAgent(
                                selected.enquiry_id,
                                selectedAgent,
                                selectedTemplate
                              );
                            }}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg"
                          >
                            Assign Field Engineer
                          </button>

                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}
                </div>
              {/* Assign Technical Auditor */}
              {selected.status === 'inspection_completed' && (
                <div>
                  <button
                    onClick={async () => {  await fetchEngineers(); setShowAssignEngineer(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 text-sm font-semibold rounded-md hover:bg-purple-200"
                  >
                    <UserPlus className="w-4 h-4" /> Assign Technical Auditor for Review
                  </button>
                  {showAssignEngineer && (
                    <div className="mt-3 space-y-2 bg-gray-50 rounded-xl p-3">
                      {engineers.map(eng => (
                        <button
                          key={eng.user_id}
                          onClick={() => { assignEngineer(selected.enquiry_id, eng.user_id, selected.template); setSelectedId(null); setShowAssignEngineer(false); }}
                          className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-purple-50 border border-gray-100 transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {eng.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{eng.name}</div>
                            <div className="text-xs text-gray-500">{eng.email}</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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


