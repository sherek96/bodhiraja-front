import  { useState } from 'react';
import { BookOpen, School, Users, CalendarDays } from 'lucide-react';
import CurriculumTab from './CurriculumTab';
import ClassroomTab from './ClassroomTab';
import EnrollmentTab from './EnrollmentTab';
import TimetableTab from './TimetableTab';







const AcademicManagement = () => {
  // State to track which tab is currently active
  const [activeTab, setActiveTab] = useState('curriculum');

  // Define the tabs based on your database flow
  const tabs = [
    { id: 'curriculum', label: '1. Curriculum', icon: BookOpen },
    { id: 'classrooms', label: '2. Classrooms', icon: School },
    { id: 'enrollment', label: '3. Enrollment', icon: Users },
    { id: 'timetable', label: '4. Timetable', icon: CalendarDays }
  ];

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-6">
      
      {/* THE TAB MENU (Glassmorphism Style) */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] rounded-2xl p-2 flex justify-between gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-[1.02]' 
                  : 'text-gray-600 hover:bg-blue-50/50 hover:text-blue-700'
              }`}
            >
              <Icon size={18} className={isActive ? "animate-pulse" : ""} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* THE CONTENT AREA */}
      <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] rounded-2xl overflow-hidden">
        {activeTab === 'curriculum' && <CurriculumTab />}
        {activeTab === 'classrooms' && <ClassroomTab />}
        {activeTab === 'enrollment' && <EnrollmentTab />}
        {activeTab === 'timetable' && <TimetableTab />}
      </div>

    </div>
  );
};

export default AcademicManagement;