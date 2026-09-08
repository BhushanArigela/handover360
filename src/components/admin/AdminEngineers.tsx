import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Modal } from '../ui/Modal';
import { UserPlus, ToggleLeft, ToggleRight, Award, Pencil } from 'lucide-react';
import { useApp } from "../../context/AppContext";
import { apiFetch } from "../../services/api";
import { success, error } from "../../utils/toast";

type EngineerStats = {
  assigned: number;
  certs: number;
  avgRating: number | null;
};

type User = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  stats?: EngineerStats;
};

export const AdminEngineers: React.FC = () => {
  const { navigate } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const emptyEng = {
    name: "",
    email: "",
    phone: "",
  };
  const [newEng, setNewEng] = useState(emptyEng);
  const [loading, setLoading] = useState(true);
  const closeModal = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setNewEng(emptyEng);
  };
  // Fetch users (engineers only)
  const fetchUsers = async () => {
    try {
      const res = await apiFetch(
        "/users/all_users/?role=technical_auditor",
        {},
        navigate
      );

      // const data = await res.json();

      setUsers(res);
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to load technical auditors");
    }
  };

  useEffect(() => {
    const loadEngineers = async () => {
        setLoading(true);

        try {
          await fetchUsers();
        } finally {
          setLoading(false);
        }
      };

      loadEngineers();
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

      success("Technical Auditor status updated");
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

      const method = isEditMode ? "PUT" : "POST";
      const formData = new FormData();

        formData.append("name", newEng.name);
        formData.append("email", newEng.email);
        formData.append("phone", newEng.phone);
        formData.append("role", "technical_auditor");

        const res = await apiFetch(
          url,
          {
            method,
            body: formData,
          },
          navigate
        );
      // const res = await apiFetch(
      //   url,
      //   {
      //     method,
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //      ...newEng,
      //       role: "technical_auditor",
      //     }),
      //   },
      //   navigate
      // );

      // const data = await res.json();
      
      if (isEditMode) {
        success("Technical Auditor updated successfully");
      } else {
        success("Technical Auditor created successfully");

        console.log(
          `Technical Auditor created successfully!

          Username: ${res.data.username}
          Password: ${res.data.password}`
        );
      }

      await fetchUsers();

      setShowAddModal(false);
      setEditingUserId(null);
      setIsEditMode(false);
      setNewEng(emptyEng);

    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to create technical auditor.");
    }
  };

  const handleEdit = (eng: User) => {
    setIsEditMode(true);
    setEditingUserId(eng.user_id);

    setNewEng({
      name: eng.name,
      email: eng.email,
      phone: eng.phone,
    });

    setShowAddModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          Loading Technical Auditors...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Technical Auditors</h2>
          <p className="text-gray-500 text-sm mt-1">Manage review technical auditors and specialists.</p>
        </div>
        <button
           onClick={() => {
            setIsEditMode(false);
            setEditingUserId(null);
            setNewEng(emptyEng);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700"
        >
          <UserPlus className="w-4 h-4" /> Add Technical Auditor
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(eng => {
          
          const joinedDate = eng.created_at
            ? new Date(eng.created_at).toLocaleDateString("en-GB")
            : "N/A";

          return (
            <div key={eng.user_id} className={`bg-white rounded-2xl border border-gray-100 p-5 ${!eng.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {eng.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{eng.name}</div>
                    <div className="text-xs text-gray-500">{eng.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(eng)}
                  className="text-emerald-600"
                >
                  <Pencil className="w-4 h-4" />
                  
                </button>
                <button
                  onClick={() => toggleUserActive(eng.user_id)}
                  className={`${eng.is_active ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {eng.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-3">📱 {eng.phone} • Joined: {joinedDate}</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-purple-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-purple-700">{eng.stats?.assigned}</div>
                  <div className="text-[10px] text-purple-600">Assigned</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <Award className="w-3 h-3 text-amber-600" />
                    <span className="text-lg font-bold text-amber-700">{eng.stats?.certs}</span>
                  </div>
                  <div className="text-[10px] text-amber-600">Certs</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-green-700">{eng.stats?.avgRating ? eng.stats?.avgRating.toFixed(1) : '4.2'}</div>
                  <div className="text-[10px] text-green-600">Avg Rating</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showAddModal}
        onClose={closeModal}
        title={isEditMode ? "Edit Technical Auditor" : "Add New Technical Auditor"}
        size="md"
        >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input type="text" name="name" value={newEng.name} onChange={(e) => setNewEng({ ...newEng, name: e.target.value })} required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input type="email" name="email" value={newEng.email} onChange={(e) => setNewEng({ ...newEng, email: e.target.value })} required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
            <input type="tel" name="phone" value={newEng.phone} onChange={(e) => setNewEng({ ...newEng, phone: e.target.value })} required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 text-sm">{isEditMode ? "Update Technical Auditor" : "Add Technical Auditor"}</button>
            <button type="button" onClick={closeModal} className="px-6 py-3 text-gray-700 font-semibold rounded-xl border border-gray-200 text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
