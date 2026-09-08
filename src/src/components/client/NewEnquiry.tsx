import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { CheckCircle } from 'lucide-react';
import { toast } from "react-toastify";
import { API_URL } from '../../config/env';

export const NewEnquiry: React.FC = () => {
  const { currentUser, createEnquiry, navigate } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    propertyType: '',
    propertyAddress: '',
    city: '',
    pincode: '',
    constructionStage: '',
    description: '',
  });

  if (!currentUser) return null;

  const validateForm = () => {
    const errors: any = {};

    // Pincode validation (India: 6 digits, not starting with 0)
    const pinRegex = /^[1-9][0-9]{5}$/;

    if (!form.pincode || !pinRegex.test(form.pincode)) {
      errors.pincode = "Invalid PIN code. Must be 6 digits.";
    }

    if (!form.propertyType) {
      errors.propertyType = "Property type is required";
    }

    if (!form.city) {
      errors.city = "City is required";
    }

    if (!form.propertyAddress) {
      errors.propertyAddress = "Address is required";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();

    
    if (Object.keys(errors).length > 0) {
      
      if (errors.pincode) {
        toast.error(errors.pincode);
      }

      if (errors.city) {
        toast.error(errors.city);
      }

      if (errors.propertyType) {
        toast.error(errors.propertyType);
      }

      if (errors.propertyAddress) {
        toast.error(errors.propertyAddress);
      }

      return; 
    }

    const token = localStorage.getItem("token");
    try {
    const response = await fetch(
      `${API_URL}/enquiries/create/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        },
        body: JSON.stringify({
          propertyType: form.propertyType,
          propertyAddress: form.propertyAddress,
          city: form.city,
          pincode: form.pincode,
          constructionStage: form.constructionStage,
          description: form.description,
        }),
      }
    );

    const data = await response.json();
    
    if (response.ok) {
      setSubmitted(true);
      toast.success("Enquiry created successfully!");
      console.log("Enquiry created:", data);
    } else {
      toast.error("Failed to create enquiry.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Server error occurred.");
  }
    // createEnquiry({
    //   ...form,
    //   clientId: currentUser.id,
    //   clientName: currentUser.name,
    //   clientRole: currentUser.role as 'builder' | 'buyer',
    // });
    // setSubmitted(true);
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Submitted!</h2>
          <p className="text-gray-500 mb-8">
            Your inspection request has been submitted successfully. Our team will review and assign a field engineer shortly.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('client-enquiries')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25"
            >
              View My Enquiries
            </button>
            <button
              onClick={() => { setSubmitted(false); setForm({ propertyType: '', propertyAddress: '', city: '', pincode: '', constructionStage: '', description: '' }); }}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-blue-300"
            >
              Book Another
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Book New Inspection</h2>
          <p className="text-gray-500 mt-1">Fill in the property details to request a quality inspection.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Property Type *</label>
            <select
              value={form.propertyType}
              onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="">Select property type</option>
              <option>Residential Apartment</option>
              <option>Independent Villa</option>
              <option>Independent House</option>
              <option>Row House</option>
              <option>Commercial Building</option>
              <option>Industrial Structure</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Property Address *</label>
            <input
              type="text"
              value={form.propertyAddress}
              onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })}
              placeholder="Full address of the property"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
              <input
                type="number"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                placeholder="Pincode"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Construction Stage *</label>
            <select
              value={form.constructionStage}
              onChange={(e) => setForm({ ...form, constructionStage: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="">Select construction stage</option>
              {/* <option>Foundation Stage</option>
              <option>Structural Stage</option>
              <option>Brick/Block Work Stage</option>
              <option>Plumbing & Electrical Stage</option>
              <option>Finishing Stage</option> */}
              <option>Handover</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide additional details about your inspection request..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-8 py-3 bg-orange-500 cursor-pointer text-white font-semibold rounded-xl hover:from-blue-700 hover:bg-orange-600 transition-all shadow-lg shadow-blue-500/25"
            >
              Submit Enquiry
            </button>
            <button
              type="button"
              onClick={() => navigate('client-dashboard')}
              className="px-6 py-3 bg-white text-gray-700 cursor-pointer font-semibold rounded-xl border border-gray-200 hover:border-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
