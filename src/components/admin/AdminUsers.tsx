import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Modal } from "../ui/Modal";
import { Search, UserPlus, ToggleLeft, ToggleRight, Pencil } from "lucide-react";
import { UserRole } from "../../types";
import { useApp } from "../../context/AppContext";
import { apiFetch } from "../../services/api";
import { success, error } from "../../utils/toast";
import { formatDate } from "../../utils/date";
type AgentDocument = {
  id?: number;
  document_name: string;
  file: File | string | null;
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
  created_at?: string;
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  builder: "bg-orange-100 text-orange-700",
  buyer: "bg-blue-100 text-blue-700",
  field_engineer: "bg-emerald-100 text-emerald-700",
  technical_auditor: "bg-purple-100 text-purple-700",
};

export const AdminUsers: React.FC = () => {
  const { navigate } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const emptyUser = {
    name: "",
    email: "",
    phone: "",
    role: "" as UserRole | "",
    preferred_location: "",
    documents: [
        {
            document_name: "",
            file: null,
        },
    ],
  };

  
  const addDocument=()=>{
    setNewUser(prev=>({
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
      setNewUser(prev=>({
          ...prev,
          documents: (prev.documents ?? []).filter((_, i) => i !== index)
      }))
  }
  const [newUser, setNewUser] = useState(emptyUser);
  const [loading, setLoading] = useState(true);
  const closeModal = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setNewUser(emptyUser);
  };
  // const showDocuments = newUser.role === "field_engineer" && Array.isArray(newUser.documents);
  // FETCH USERS FROM DJANGO
  const fetchUsers = async () => {
    try {
      const res = await apiFetch(
        "/users/all_users/",
        {},
        navigate
      );

      // const data = await res.json();
      setUsers(res);
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to load users");
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);

      try {
        await fetchUsers();
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // ✅ FILTER
  const filtered = users
    .filter((u) => roleFilter === "all" || u.role === roleFilter)
    .filter(
      (u) =>
        search === "" ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

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

      success("User status updated");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to update status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const url = isEditMode
      ? `/users/${editingUserId}/`
      : "/users/create/";

    const formData = new FormData();
    const method = isEditMode ? "PATCH" : "POST";
    formData.append("_method", isEditMode ? "PATCH" : "POST");
    formData.append("name", newUser.name);
    formData.append("email", newUser.email);
    formData.append("phone", newUser.phone);
    formData.append("role", newUser.role);

    if (newUser.preferred_location) {
      formData.append("preferred_location", newUser.preferred_location);
    }

    newUser.documents.forEach((doc) => {
      console.log("New user documents:", newUser.documents);
      const hasName = doc.document_name?.trim();
      const hasFile = doc.file;

      if (!hasName && !hasFile) return;

      // EXISTING DOC (UPDATE)
      if (doc.id) {
        formData.append("document_ids", String(doc.id));
        formData.append("document_names", doc.document_name);
      }

      // NEW DOC (CREATE)
      if (doc.file instanceof File) {
        formData.append("new_document_names", doc.document_name);
        formData.append("new_documents", doc.file);
      }
    });
      console.log("USER DOCS RAW:", formData.getAll("documents[0][document_name]"), formData.getAll("documents[0][file]"));
    const res = await apiFetch(
      url,
      {
        method,
        body: formData, // 🔥 NO JSON
      },
      navigate
    );

    // await res.json();

    success(isEditMode ? "User updated successfully" : "User created successfully");

    await fetchUsers();

    setShowAddModal(false);
    setEditingUserId(null);
    setIsEditMode(false);
    setNewUser(emptyUser);
  } catch (err: any) {
    console.error(err);
    error(err.message || "Failed to save user");
  }
};

  const handleEdit = (user: User) => {
    console.log("Documents from backend:", user.documents);
    setIsEditMode(true);
    setEditingUserId(user.user_id);

    let docs = [];

    if (user.role === "field_engineer") {
      if (Array.isArray(user.documents)) {
        docs = user.documents;
      } else if (typeof user.documents === "string") {
        try {
          docs = JSON.parse(user.documents);
        } catch {
          docs = [];
        }
      }
    }

    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole | "",
      preferred_location: user.preferred_location || "",
      documents: docs.length ? docs : [{ id: undefined,document_name: "", file: null }],
    });

    setShowAddModal(true);
};

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          Loading users...
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      {/* SEARCH + FILTER */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-xl"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl"
          >
            <option value="all">All</option>
            <option value="builder">Builder</option>
            <option value="buyer">Buyer</option>
            <option value="field_engineer">Field Engineer</option>
            <option value="technical_auditor">Technical Auditor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          onClick={() => {
            setIsEditMode(false);
            setEditingUserId(null);
            setNewUser(emptyUser);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl"
        >
          <UserPlus className="w-4 h-4" />
          {isEditMode ? "Edit" : "Add"} User
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="hover:bg-gray-50">
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Joined</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filtered.map((user) => (
                
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        roleColors[user.role] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    {user.name}
                  </td>

                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phone}</td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        roleColors[user.role] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                     {user.role
  .replace(/_/g, " ")
  .replace(/\b\w/g, (c) => c.toUpperCase())} 
                    </span>
                  </td>

                  <td className="p-4 text-xs text-gray-500">
                    {user.created_at ? formatDate(user.created_at) : "-"}
                  </td>

                  <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex items-center gap-1 text-xs text-emerald-600"
                    >
                      <Pencil className="w-4 h-4" />
                      
                    </button>
                    <button
                      onClick={() => toggleUserActive(user.user_id)}
                      className={`flex items-center gap-1 text-xs font-medium ${
                        user.is_active ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {user.is_active ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                     
                      {user.is_active ? "Active" : "Inactive"}
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={showAddModal}
         onClose={closeModal}
        title={isEditMode ? "Edit User" : "Add New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={newUser.role}
            onChange={(e) => {
              const role = e.target.value as UserRole;

              setNewUser({
                ...newUser,
                role,
                preferred_location: role === "field_engineer" ? newUser.preferred_location : "",
                documents:
                  role === "field_engineer"
                    ? (newUser.documents?.length ? newUser.documents : [{ document_name: "", file: null }])
                    : [],
              });
            }}
            className="w-full border border-gray-300 p-3 rounded-xl"
            required
          >
            <option value="">Select Role</option>
            <option value="field_engineer">Field Engineer</option>
            <option value="technical_auditor">Technical Auditor</option>
            <option value="builder">Builder</option>
            <option value="buyer">Buyer</option>
            <option value="admin">Admin</option>
          </select>

          <input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) =>
              setNewUser({ ...newUser, name: e.target.value })
            }
            className="w-full border border-gray-300 p-3 rounded-xl"
          />

          <input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
            className="w-full border border-gray-300 p-3 rounded-xl"
          />

          <input
            placeholder="Phone"
            value={newUser.phone}
            onChange={(e) =>
              setNewUser({ ...newUser, phone: e.target.value })
            }
            className="w-full border border-gray-300 p-3 rounded-xl"
          />
          {newUser.role === "field_engineer" && (
            <input
              placeholder="Preferred Location"
              value={newUser.preferred_location}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  preferred_location: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-3 rounded-xl"
            />
          )}

          {newUser.role === "field_engineer" && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <h4 className="font-semibold">Documents</h4>

                <button type="button" onClick={addDocument}>
                  + Add
                </button>
              </div>

              {Array.isArray(newUser.documents) &&
                newUser.documents.map((doc, index) => (
                <div key={index} className="border p-3 border-gray-300 rounded-xl space-y-2">
                  <input
                    type="text"
                    placeholder="Document Name"
                    value={doc.document_name}
                    onChange={(e) => {
                      const docs = [...(newUser.documents ?? [])];
                      docs[index].document_name = e.target.value;

                      setNewUser({ ...newUser, documents: docs });
                    }}
                  />

                  <input
                    type="file"
                    onChange={(e) => {
                        const docs = [...(newUser.documents ?? [])]; 
                        docs[index].file = e.target.files?.[0] ?? null;

                        setNewUser({ ...newUser, documents: docs });
                    }}
                  />
                  {typeof doc.file === "string" && (
                    <a
                      href={`${import.meta.env.VITE_URL}${doc.file}`}
                      target="_blank"
                      className="text-blue-600 underline text-xs"
                    >
                      View document
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl">
           {isEditMode ? "Update User" : "Add New User"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};