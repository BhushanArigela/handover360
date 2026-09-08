import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, ArrowLeft, Building2, Users,  Eye, EyeOff } from 'lucide-react';
import { toast } from "react-toastify";
import { API_URL } from '../../config/env';

export const RegisterPage: React.FC = () => {
  const { navigate } = useApp();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: '' as 'builder' | 'buyer' | '',
    password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const validateForm = () => {
    if (!form.role) {
      return "Please select your role";
    }

    if (form.name.trim().length < 3) {
      return "Name must be at least 3 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address";
    }

    const phoneRegex =  /^\d{10}$/;

    if (!phoneRegex.test(form.phone.trim())) {
      return "Please enter a valid 10-digit mobile number";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(form.password)) {
      return "Password must contain uppercase, lowercase, number and special character";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim());
      formData.append("phone", form.phone.trim());
      formData.append("password", form.password);
      formData.append("role", form.role);
      formData.append("password", form.password);

      const response = await fetch(
        `${API_URL}/users/create/`,
        {
          method: "POST",
          body: formData, // ✅ IMPORTANT: NO HEADERS
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created successfully!");

        setForm({
          name: "",
          email: "",
          phone: "",
          role: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          navigate("login");
        }, 1000);
      } else {
        toast.error(data?.message || data?.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      toast.error("Server error occurred");
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Register as a Builder or Buyer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'buyer' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    form.role === 'buyer'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-blue-200'
                  }`}
                  >
                  <Users className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Buyer</div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'builder' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    form.role === 'builder'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-blue-200'
                  }`}
                  >
                  <Building2 className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Builder</div>
                </button>
                
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(''); }}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(''); }}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); setError(''); }}
                placeholder="Enter your phone number"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Create a password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
                
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    setError("");
                  }}
                  placeholder="Confirm your password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )} */}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="text-blue-600 font-semibold hover:text-blue-700">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
