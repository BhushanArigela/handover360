import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ClientDashboard } from './components/client/ClientDashboard';
import { NewEnquiry } from './components/client/NewEnquiry';
import { ClientEnquiries } from './components/client/ClientEnquiries';
import { ClientCertificates } from './components/client/ClientCertificates';
import { AgentDashboard } from './components/agent/AgentDashboard';
import { AgentAssignments } from './components/agent/AgentAssignments';
import { InspectionPage }  from './components/agent/InspectionPage.tsx';
import { AgentCompleted } from './components/agent/AgentCompleted';
import { EngineerDashboard } from './components/engineer/EngineerDashboard';
import { EngineerReviews } from './components/engineer/EngineerReviews';
import { EngineerCompleted } from './components/engineer/EngineerCompleted';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminEnquiries } from './components/admin/AdminEnquiries';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminAgents } from './components/admin/AdminAgents';
import { AdminEngineers } from './components/admin/AdminEngineers';
import { ReviewInspectionPage } from "./components/engineer/ReviewInspectionPage";
import { AdminCertificates } from './components/admin/AdminCertificates';
import { ToastContainer } from "react-toastify";
import  AdminTemplates from './components/admin/template-wizard';
// import { AdminCategories } from './components/admin/AdminCategories';
// import { AdminQuestions } from './components/admin/AdminQuestions';
// import TemplateList from "./components/admin/template-wizard/TemplateList";
import TemplateList from "./components/admin/template-wizard/TemplateList";
import InspectionTemplateWizard from "./components/admin/template-wizard/InspectionTemplateWizard";
// import TemplatePreview from "./components/admin/template-wizard/TemplatePreview";
// // import { AdminTemplateBuilder } from './components/admin/AdminTemplateBuilder';
const Router: React.FC = () => {
  const { currentPage, currentUser, } = useApp();
  
  if (!currentUser) {
    switch (currentPage) {
      case "landing":
        return <LandingPage />;

      case "register":
        return <RegisterPage />;

      case "login":
      default:
        return <LoginPage />;
    }
  }
  
  switch (currentPage) {
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginPage />;
    case 'register':
      return <RegisterPage />;

    // Client (Builder/Buyer)
    case 'client-dashboard':
      return <ClientDashboard />;
    case 'client-new-enquiry':
      return <NewEnquiry />;
    case 'client-enquiries':
      return <ClientEnquiries />;
    case 'client-certificates':
      return <ClientCertificates />;

    // field engineer
    case 'agent-dashboard':
      return <AgentDashboard />;
    case 'agent-assignments':
      return <AgentAssignments />;
    case 'agent-completed':
      return <AgentCompleted />;
    case "agent-inspection":
      return <InspectionPage />;

    // technical auditor
    case 'engineer-dashboard':
      return <EngineerDashboard />;
    case 'engineer-reviews':
      return <EngineerReviews />;
    case "engineer-review-inspection":
      return <ReviewInspectionPage />; 
    case 'engineer-completed':
      return <EngineerCompleted />;

    // Admin
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'admin-enquiries':
      return <AdminEnquiries />;
    case 'admin-users':
      return <AdminUsers />;
    case 'admin-agents':
      return <AdminAgents />;
    case 'admin-engineers':
      return <AdminEngineers />;
    // case 'admin-questionnaire':
    //   return <AdminQuestionnaire />;
    case 'admin-templates':
      return <AdminTemplates />;
    // case 'admin-categories':
    //   return <AdminCategories />;
    // case 'admin-questions':
    //   return <AdminQuestions />;
    case "admin-template-list":
      return <TemplateList />;

    case "admin-template-wizard":
      return <InspectionTemplateWizard />;

    case 'admin-certificates':
      return <AdminCertificates />;

    default:
      return <LandingPage />;
  }
};

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
      <AppProvider>
        <Router />
      </AppProvider>
    </>
  );
}

export default App;
