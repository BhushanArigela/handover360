import React from 'react';
import { useApp } from '../context/AppContext';
import { ClipboardCheck, Users, Award, ArrowRight, CheckCircle, Building2, Eye, FileCheck } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-26">
          <div className="flex items-center gap-2">
           {/* <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Certify<span className="text-blue-600">Build</span></span>*/}
           <img src="public/images/logo.png" width="200"    alt="Logo"  />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('login')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('register')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                Trusted by 500+ Builders & Buyers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">
                Construction
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Quality </span>
                Certification
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
                Get your construction quality certified by expert technical auditors. Whether you're a builder showcasing quality or a buyer verifying standards — we've got you covered.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('register')}
                  className="group px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                >
                  Book Inspection
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('login')}
                  className="px-7 py-3.5 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  Sign In
                </button>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Free Registration</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Expert Technical Auditors</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Certified Reports</div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20">
                <img src="/images/hero-bg.jpg" alt="Construction Quality Inspection" className="w-full h-80 lg:h-[28rem] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">Quality Certified — Grade A</div>
                        <div className="text-xs text-gray-500">Lake View Towers, Bangalore</div>
                      </div>
                      <div className="ml-auto">
                        <div className="text-2xl font-black text-green-600">4.2</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Simple 4-step process to get your construction quality certified</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Building2, title: 'Book Inspection', desc: 'Register and submit your property details for quality inspection.', step: '01', color: 'from-blue-500 to-blue-600' },
              { icon: Eye, title: 'Site Visit', desc: 'Our certified field engineer visits your site and conducts thorough inspection.', step: '02', color: 'from-indigo-500 to-indigo-600' },
              { icon: ClipboardCheck, title: 'Expert Review', desc: 'Specialist Technical Auditor review the inspection data and findings.', step: '03', color: 'from-purple-500 to-purple-600' },
              { icon: FileCheck, title: 'Get Certificate', desc: 'Receive your official quality certification with detailed report.', step: '04', color: 'from-green-500 to-green-600' },
            ].map((item, i) => (
              <div key={i} className="group relative bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-4 right-4 text-5xl font-black text-gray-50 group-hover:text-blue-50 transition-colors">{item.step}</div>
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-5 shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '2,500+', label: 'Properties Certified' },
              { value: '150+', label: 'Expert Technical Auditor' },
              { value: '98%', label: 'Client Satisfaction' },
              { value: '25+', label: 'Cities Covered' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl font-black text-white">{stat.value}</div>
                <div className="mt-1 text-blue-200 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Who */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Who Is It For?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Buyers</h3>
              <p className="text-gray-600 leading-relaxed mb-4">Verify construction quality before investing. Make informed decisions with expert assessment and detailed reports.</p>
              <ul className="space-y-2">
                {['Independent quality check', 'Detailed inspection report', 'Peace of mind guarantee'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-5">
                <Building2 className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Builders</h3>
              <p className="text-gray-600 leading-relaxed mb-4">Showcase your construction quality with third-party certification. Build trust with buyers and stand out from competition.</p>
              <ul className="space-y-2">
                {['Third-party quality validation', 'Marketing advantage', 'Transparent reporting'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Logins */}
      {/* <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">🔐 Demo Access</h3>
          <p className="text-gray-500 text-sm mb-6">Use these credentials to explore each role (any password works)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { role: 'Admin', email: 'admin@Handover360.com', color: 'bg-red-50 text-red-700 border-red-200' },
              { role: 'Builder', email: 'rajesh@builder.com', color: 'bg-orange-50 text-orange-700 border-orange-200' },
              { role: 'Agent', email: 'amit@agent.com', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { role: 'Engineer', email: 'meera@engineer.com', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            ].map((d) => (
              <button
                key={d.role}
                onClick={() => navigate('login')}
                className={`p-3 rounded-xl border text-left hover:shadow-md transition-all ${d.color}`}
              >
                <div className="text-xs font-bold">{d.role}</div>
                <div className="text-xs mt-1 opacity-75 truncate">{d.email}</div>
              </button>
            ))}
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
              {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Handover360</span> */}
              <img src="https://havensurecivtech.com/Havensure/images/42.png" width="150"    alt="Logo" className="h-12 w-auto brightness-0 invert"  />
              </div>
            </div>
            <p className="text-sm">© 2026 Handover360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
