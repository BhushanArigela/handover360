import React, { createContext, useEffect, useContext, useState, useCallback } from 'react';
import { User, Enquiry,  InspectionSubmission, Certificate, Notification, EnquiryStatus } from '../types';
import { demoUsers, demoEnquiries, demoSubmissions, demoCertificates } from '../store';
import { API_URL } from '../config/env';

interface AppState {
  currentUser: User | null;
  users: User[];
  enquiries: Enquiry[];
  submissions: InspectionSubmission[];
  certificates: Certificate[];
  notifications: Notification[];
  currentPage: string;
  pageParams: any;
  selectedEnquiryId: string | null;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, phone: string, role: 'builder' | 'buyer', password: string) => boolean;
  setAuthUser: (user: User, page: string) => void;
  logout: () => void;
  navigate: (page: string, params?: any) => void;
  selectEnquiry: (id: string | null) => void;
  createEnquiry: (enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateEnquiryStatus: (id: string, status: EnquiryStatus, updates?: Partial<Enquiry>) => void;
  markAllNotificationsRead: () => Promise<void>;
  submitInspection: (submission: Omit<InspectionSubmission, 'id' | 'submittedAt'>) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  toggleUserActive: (id: string) => void;
  markNotificationRead: (id: string) => void;
  getUnreadCount: () => number;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [currentPage, setCurrentPage] = useState('landing');
  const [pageParams, setPageParams] = useState<any>(null);
  
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);


      // ALWAYS derive dashboard from role
      const rolePageMap: Record<string, string> = {
        admin: "admin-dashboard",
        field_engineer: "agent-dashboard",
        technical_auditor: "engineer-dashboard",
        builder: "client-dashboard",
        buyer: "client-dashboard",
      };

      setCurrentPage(rolePageMap[user.role] || "client-dashboard");
    } else {
      setCurrentPage("login");
    }

    setHydrated(true);
  }, []);

  // const [currentUser, setCurrentUser] = useState<User | null>(null);
  // const [users, setUsers] = useState<User[]>(demoUsers);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(demoEnquiries);
  const [submissions, setSubmissions] = useState<InspectionSubmission[]>(demoSubmissions);
  const [certificates, setCertificates] = useState<Certificate[]>(demoCertificates);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);

  const login = useCallback((email: string, _password: string) => {
    const user = users.find(u => u.email === email && u.isActive);
    if (!user) return false;
    
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
    

    let page = 'client-dashboard';

    switch (user.role) {
      case 'admin': page = 'admin-dashboard'; break;
      case 'field_engineer': page = 'agent-dashboard'; break;
      case 'technical_auditor': page = 'engineer-dashboard'; break;
      case 'builder':
      case 'buyer': page = 'client-dashboard'; break;
    }

    setCurrentPage(page);
    localStorage.setItem("page", page); // ✅ IMPORTANT FIX

    return true;
  }, [users]);

  const setAuthUser = useCallback((user: User, page: string) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("page", page);

    setCurrentUser(user);

    setTimeout(() => {
        setCurrentPage(page);
    }, 0);
  }, []);

  const register = useCallback((name: string, email: string, phone: string, role: 'builder' | 'buyer', _password: string) => {
    if (users.some(u => u.email === email)) return false;
    const newUser: User = {
      username: email.split('@')[0],
      id: `u${Date.now()}`,
      name, email, phone, role,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setCurrentPage('client-dashboard');
    return true;
  }, [users]);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        const response = await fetch(
            `${API_URL}/notifications/`,
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            setNotifications(data);
        }

    } catch (err) {
        console.error(err);
    }

  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        const response = await fetch(
            `${API_URL}/notifications/unread_count/`,
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );
        if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.count);
        }
    } catch (err) {
        console.error(err);
    }
  }, []);
  useEffect(() => {
      if (!currentUser) return;
      fetchNotifications();
      fetchUnreadCount();
      const interval = setInterval(() => {
          fetchNotifications();
          fetchUnreadCount();
      }, 10000); // every 10 seconds

      return () => clearInterval(interval);
  }, [currentUser, fetchNotifications, fetchUnreadCount]);
  
  const getUnreadCount = () => unreadCount;
  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage('landing');
    setSelectedEnquiryId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // navigate("login");
  }, []);
  
  const navigate = useCallback(
    (
        page: string,
        params?: any
    ) => {

        setCurrentPage(page);

        setPageParams(params ?? null);

    },
    []
);
  const selectEnquiry = useCallback((id: string | null) => setSelectedEnquiryId(id), []);

  const addNotification = useCallback((userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setNotifications(prev => [...prev, {
      id: `n${Date.now()}`,
      userId, title, message, type,
      read: false,
      createdAt: new Date().toISOString().split('T')[0],
    }]);
  }, []);

  const createEnquiry = useCallback((enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: `e${Date.now()}`,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    setEnquiries(prev => [...prev, newEnquiry]);
    addNotification(enquiry.clientId, 'Enquiry Submitted', `Your enquiry for ${enquiry.propertyAddress} has been submitted successfully.`, 'success');
  }, [addNotification]);

  const updateEnquiryStatus = useCallback((id: string, status: EnquiryStatus, updates?: Partial<Enquiry>) => {
    setEnquiries(prev => prev.map(e =>
      e.id === id ? { ...e, ...updates, status, updatedAt: new Date().toISOString().split('T')[0] } : e
    ));
  }, []);
  const markAllNotificationsRead = async () => {
    const token = localStorage.getItem("token");
    await fetch(
        `${API_URL}/notifications/mark_all_read/`,
        {
            method: "POST",
            headers: {
                Authorization: `Token ${token}`,
            },
        }
    );

    fetchNotifications();
    fetchUnreadCount();
};

  const submitInspection = useCallback((submission: Omit<InspectionSubmission, 'id' | 'submittedAt'>) => {
    const newSub: InspectionSubmission = {
      ...submission,
      id: `s${Date.now()}`,
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setSubmissions(prev => [...prev, newSub]);
    updateEnquiryStatus(submission.enquiryId, 'inspection_completed');
    addNotification(submission.agentId, 'Inspection Submitted', 'Your inspection report has been submitted successfully.', 'success');
  }, [updateEnquiryStatus, addNotification]);

  const addUser = useCallback((user: Omit<User, 'id' | 'createdAt'>) => {
    setUsers(prev => [...prev, {
      ...user,
      id: `u${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    }]);
  }, []);

  const toggleUserActive = useCallback((id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  }, []);

  const markNotificationRead = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(
        `${API_URL}/notifications/${id}/mark_read/`,
        {
            method: "POST",
            headers: {
                Authorization: `Token ${token}`,
            },
        }
    );

    fetchNotifications();
    fetchUnreadCount();

  };

  if (!hydrated) {
    return null;
  }
  
  return (
    <AppContext.Provider value={{
      currentUser, users, enquiries, submissions, certificates, notifications,
      currentPage, pageParams, selectedEnquiryId,
      login, register, setAuthUser, logout, navigate, selectEnquiry,
      createEnquiry, updateEnquiryStatus, submitInspection, addUser, toggleUserActive,
      markNotificationRead,
        markAllNotificationsRead, getUnreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};
