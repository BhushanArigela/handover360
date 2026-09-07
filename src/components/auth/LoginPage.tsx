import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from "react-toastify";


export const LoginPage: React.FC = () => {
  const { navigate, login } = useApp(); 
  const { setAuthUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email.trim()) {
    toast.error("Email is required");
    return;
  }

  if (!password.trim()) {
    toast.error("Password is required");
    return;
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/users/login/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success("Login successful");

      // Store user data
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      localStorage.setItem("user", JSON.stringify(data.user));

      // Store token if your API returns one
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // console.log("Logged in user:", data);

      const roleRoutes: Record<string, string> = {
          admin: "admin-dashboard",
          field_engineer: "agent-dashboard",
          technical_auditor: "engineer-dashboard",
          builder: "client-dashboard",
          buyer: "client-dashboard",
        };

        const page = roleRoutes[data.user.role] || "client-dashboard";

        setAuthUser(data.user, page);

    } else {
      toast.error(
        data?.message ||
        data?.error ||
        "Invalid email or password"
      );
    }
  } catch (error) {
    console.error("Login Error:", error);
    toast.error("Server error occurred");
  }
};

  const quickLogin = (email: string) => {
    setEmail(email);
    login(email, 'demo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('landing')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/10 p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to Handover360</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button onClick={() => navigate('register')} className="text-blue-600 font-semibold hover:text-blue-700">
              Register here
            </button>
          </div>

          {/* Quick Demo Logins */}
          {/* <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '👤 Admin', email: 'admin@havensure.com' },
                { label: '🏗️ Builder', email: 'rajesh@havensure.com' },
                { label: '🏠 Buyer', email: 'priya@havensure.com' },
                { label: '📋 Field Engineer', email: 'amit@havensure.com' },
                { label: '👨‍🔬 Tecnical Auditor', email: 'meera@havensure.com' },
              ].map((d) => (
                <button
                  key={d.email}
                  onClick={() => quickLogin(d.email)}
                  className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors text-left truncate"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};
