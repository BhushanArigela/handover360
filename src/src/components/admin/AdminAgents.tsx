import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Modal } from '../ui/Modal';
import { UserPlus, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import { useApp } from "../../context/AppContext";
import { apiFetch } from "../../services/api";
import { success, error } from "../../utils/toast";
import { formatDate } from "../../utils/date";

type AgentStats = {
  total: number;
  completed: number;
  pending: number;
};

type AgentDocument = {
  id?: number;
  document_name: string;
  file: File | string | null;
};

type AgentForm = {
    name: string;
    email: string;
    phone: string;
    preferred_location: string;
    documents: AgentDocument[];
};

type User = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  preferred_location?: string;
  documents?: AgentDocument[];
  role: string;
  is_active: boolean;
  created_at: string;
  stats?: AgentStats;
};



export const AdminAgents: React.FC = () => {
  const { navigate } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const emptyAgent: AgentForm = {
    name: "",
    email: "",
    phone: "",
    preferred_location: "",
    documents: [
        {
            document_name: "",
            file: null,
        },
    ],
  };

  const addDocument=()=>{
    setNewAgent(prev=>({
        ...prev,
        documents:[
            ...prev.documents,
            {
                document_name:"",
                file:null
            }
        ]
    }))
  }

  const removeDocument=(index:number)=>{
      setNewAgent(prev=>({
          ...prev,
          documents:prev.documents.filter((_,i)=>i!==index)
      }))
  }


const [newAgent, setNewAgent] = useState<AgentForm>(emptyAgent);
const [loading, setLoading] = useState(true);
const closeModal = () => {
  setShowAddModal(false);
  setIsEditMode(false);
  setEditingUserId(null);
  setNewAgent(emptyAgent);
};
  // Fetch users (agents only)
  const fetchUsers = async () => {
    try {
      const res = await apiFetch(
        "/users/all_users/?role=field_engineer",
        {},
        navigate
      );

      // const data = await res.json();
      setUsers(res);
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to load agents");
    }
  };
  
  useEffect(() => {
    const loadAgents = async () => {
        setLoading(true);

        try {
          await fetchUsers();
        } finally {
          setLoading(false);
        }
      };

      loadAgents();
    }, []);
  
  const toggleUserActive = async (user_id: string) => {
    try {
      const res = await apiFetch(
        `/users/${user_id}/toggle/`,
        {
          method: "PATCH",
        },
        navigate
      );

      // const data = await res.json();

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user_id
            ? { ...u, is_active: res.is_active }
            : u
        )
      );

      success("Field Engineer status updated");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to update status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //  Validations

    const errors: string[] = [];

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!newAgent.name.trim()) {
      errors.push("Name is required.");
    }

    if (!newAgent.email.trim()) {
      errors.push("Email is required.");
    }

    if (!newAgent.phone.trim()) {
      errors.push("Phone number is required.");
    }

    newAgent.documents.forEach((doc, index) => {
      const hasName = doc.document_name.trim() !== "";
      const hasFile = doc.file instanceof File || typeof doc.file === "string";

      // Completely empty row -> ignore
      if (!hasName && !hasFile) {
        return;
      }

      // Name entered but no file
      if (hasName && !hasFile) {
        errors.push(`Document ${index + 1}: Please upload a file.`);
        return;
      }

      // File uploaded but no name
      if (!hasName && hasFile) {
        errors.push(`Document ${index + 1}: Please enter a document name.`);
        return;
      }

      if (doc.file instanceof File) {
        if (!ALLOWED_TYPES.includes(doc.file.type)) {
          errors.push(
            `Document ${index + 1}: Only PDF, DOC and DOCX files are allowed.`
          );
        }

        if (doc.file.size > MAX_FILE_SIZE) {
          errors.push(
            `Document ${index + 1}: File size cannot exceed 5 MB.`
          );
        }
      }
    });

    if (errors.length > 0) {
      errors.forEach(err => error(err));
      return;
    }
    
    try {
      const formData = new FormData();

      formData.append("name", newAgent.name);
      formData.append("email", newAgent.email);
      formData.append("phone", newAgent.phone);
      formData.append("preferred_location", newAgent.preferred_location);
      formData.append("role", "field_engineer");

      newAgent.documents.forEach(doc => {
        const hasName = doc.document_name.trim() !== "";
        const hasFile = doc.file instanceof File || typeof doc.file === "string";

        if (!hasName && !hasFile) {
          return;
        }

        formData.append("new_document_names", doc.document_name);

        if (doc.file instanceof File) {
          formData.append("new_documents", doc.file);
        }
      });
      const url = isEditMode
        ? `/users/${editingUserId}/`
        : "/users/create/";

      const method = isEditMode ? "PUT" : "POST";

      const res = await apiFetch(
        url,
        {
          method,
          body: formData
        },
        navigate
      );

      // const data = await res.json();

      if (isEditMode) {
        success("Field Engineer updated successfully");
      } else {
        success("Field Engineer created successfully");

        alert(
          `Field Engineer created successfully!

          Username: ${res.data.username}
          Password: ${res.data.password}`
        );
      }

      await fetchUsers();

      setShowAddModal(false);
      setEditingUserId(null);
      setIsEditMode(false);
      setNewAgent(emptyAgent);
      closeModal();

    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to create field engineer.");
    }
  };

  const handleEdit = (agent: User) => {
    setIsEditMode(true);
    setEditingUserId(agent.user_id);

    setNewAgent({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      preferred_location: agent.preferred_location ?? "",
      documents:
        agent.documents && agent.documents.length
          ? agent.documents.map(doc => ({
              id: doc.id,
              document_name: doc.document_name,
              file: doc.file, // string URL from backend
            }))
          : [
              {
                document_name: "",
                file: null,
              },
            ],
    });

    setShowAddModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Field Engineer</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage field inspection field engineer.
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditMode(false);
            setEditingUserId(null);
            setNewAgent(emptyAgent);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700"
        >
          <UserPlus className="w-4 h-4" />
          Add Field Engineer
        </button>
      </div>

      {/* Field Engineer Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(agent => {
          

          return (
            <div
              key={agent.user_id}
              className={`bg-white rounded-2xl border border-gray-100 p-5 ${
                !agent.is_active ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {agent.name?.charAt(0)}
                  </div>

                  <div>
                    <div className="font-semibold text-gray-900">
                      {agent.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {agent.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(agent)}
                  className="text-emerald-600"
                >
                  <Pencil className="w-4 h-4" />
                  
                </button>

                <button
                  onClick={() => toggleUserActive(agent.user_id)}
                  className={
                    agent.is_active ? "text-green-600" : "text-gray-400"
                  }
                >
                  {agent.is_active ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                
                📱 {agent.phone}  • Joined: {formatDate(agent.created_at)} 
              </div>
              
                  <div className="text-xs text-gray-500 mb-3">
                      📍 {agent.preferred_location ? agent.preferred_location : "-"}
                  </div>
              
              {agent.documents && agent.documents.length > 0 && (
                  <div className="mt-3">
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                          Documents
                      </div>

                      <div className="space-y-1">
                          {agent.documents.map((doc) => (
                            <a
                                key={doc.id}
                                href={`${import.meta.env.VITE_URL}${doc.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-blue-600 underline truncate"
                            >
                                {doc.document_name}
                            </a>
                          ))}
                      </div>
                  </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-blue-700">
                    {agent.stats?.total}
                  </div>
                  <div className="text-[10px] text-blue-600">Total</div>
                </div>

                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-green-700">
                    {agent.stats?.completed}
                  </div>
                  <div className="text-[10px] text-green-600">Done</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-orange-700">
                    {agent.stats?.pending}
                  </div>
                  <div className="text-[10px] text-orange-600">Pending</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModal}
        title={isEditMode ? "Edit Field Engineer" : "Add New Field Engineer"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={newAgent.name}
            onChange={(e) =>
              setNewAgent({ ...newAgent, name: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
          />

          <input
            type="email"
            placeholder="Email"
            value={newAgent.email}
            onChange={(e) =>
              setNewAgent({ ...newAgent, email: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
          />

          <input
            type="tel"
            placeholder="Phone"
            value={newAgent.phone}
            onChange={(e) =>
              setNewAgent({ ...newAgent, phone: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
          />

          <input
            type="text"
            placeholder="Preferred Location"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            value={newAgent.preferred_location}
            onChange={(e)=>
                setNewAgent({
                    ...newAgent,
                    preferred_location:e.target.value
                })
            }
          />
          <div className="space-y-3">
            <div className="flex justify-between">

                <h4 className="font-semibold">
                    Documents
                </h4>

                <button
                    type="button"
                    onClick={addDocument}
                    className="text-blue-600"
                >
                    + Add
                </button>

            </div>

            {newAgent.documents.map((doc,index)=>(

                <div
                    key={index}
                    className="border border-gray-300 rounded-xl p-3 space-y-3"
                >

                    <input
                        type="text"
                        placeholder="Document Name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        value={doc.document_name}
                        onChange={(e)=>{

                            const docs=[...newAgent.documents]

                            docs[index].document_name=e.target.value

                            setNewAgent({
                                ...newAgent,
                                documents:docs
                            })

                        }}
                    />

                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e)=>{

                            const docs=[...newAgent.documents]

                            docs[index].file=e.target.files?.[0] ?? null

                            setNewAgent({
                                ...newAgent,
                                documents:docs
                            })

                        }}
                    />
                    {typeof doc.file === "string" && (
                      <a
                          href={`${import.meta.env.VITE_URL}${doc.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 underline"
                      >
                          View uploaded document
                      </a>
                  )}

                    {doc.file && typeof doc.file !== "string" && (
                        <div className="text-sm text-green-600">
                            Selected: {doc.file.name}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={()=>removeDocument(index)}
                        className="text-red-600 text-sm"
                    >
                        Remove
                    </button>

                </div>

            ))}

        </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl"
            >
              {isEditMode ? "Update Field Engineer" : "Add Field Engineer"}
            </button>

            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-3 border border-gray-300 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};