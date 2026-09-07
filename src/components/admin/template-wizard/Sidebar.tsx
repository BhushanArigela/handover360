import React from 'react'
import {
  LayoutGrid, FileText, PlusSquare, BookOpen, BarChart3, Users, Settings, Boxes,
} from 'lucide-react'

interface SidebarProps {
  view: string;
  setView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView }) => {
  return (
    <div className="sidebar">
      

      

      {/* <div
        className={`sidebar-link ${view === 'agent-view' ? 'active' : ''}`}
        onClick={() => setView('agent-view')}
      >
        <Boxes size={16} /> Agent Mobile View
      </div> */}
    </div>
  )
}
export default Sidebar;