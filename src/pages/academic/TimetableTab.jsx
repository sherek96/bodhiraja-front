import React, { useState, useEffect } from 'react';
import { CalendarDays, School, BookOpen, ChevronRight, BookDashed, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const TimetableTab = () => {
  // --- STATE ---
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // Data State
  const [employees, setEmployees] = useState([]);
  const [allocations, setAllocations] = useState([]); // Existing teacher allocations
  
  // Form State (Tracks which teacher is selected for which subject)
  // Example: { subjectId_1: employeeId_5, subjectId_2: employeeId_8 }
  const [teacherSelections, setTeacherSelections] = useState({});

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
        const [yearRes, classRes, empRes] = await Promise.all([
            axios.get("http://localhost:8080/academic/year/all"),
            axios.get("http://localhost:8080/academic/class/all"),
            axios.get("http://localhost:8080/employee/all")
        ]);
        setYears(yearRes.data);
        setClasses(classRes.data);
        setEmployees(empRes.data);
        
        fetchAllocations();
    } catch (error) { console.error("Failed to fetch data:", error); }
  };

  const fetchAllocations = async () => {
      try {
          // Using the controller you shared earlier!
          const response = await axios.get("http://localhost:8080/api/allocations");
          setAllocations(response.data);
      } catch (error) { console.log("Failed to fetch allocations", error); }
  };

  // --- HANDLERS ---
  const handleYearClick = (year) => {
      setSelectedYear(year);
      setSelectedClass(null);
  };

  const handleSelectTeacher = (subjectId, employeeId) => {
      setTeacherSelections(prev => ({
          ...prev,
          [subjectId]: employeeId
      }));
  };

  const handleSaveAllocation = async (subjectId) => {
      const employeeId = teacherSelections[subjectId];
      if (!employeeId) return;

      try {
          const payload = {
              classDetails: { id: selectedClass.id },
              subject: { id: parseInt(subjectId) },
              employee: { id: parseInt(employeeId) }
          };

          await axios.post("http://localhost:8080/api/allocations", payload);
          
          alert("Teacher successfully assigned!");
          fetchAllocations(); // Refresh the list so it shows as "Saved!"
          
      } catch (error) {
          console.error("Failed to assign teacher:", error);
          alert("Failed to save allocation.");
      }
  };

  // --- FILTERING LOGIC ---
  const classesForYear = selectedYear ? classes.filter(c => c.academicYear?.id === selectedYear.id) : [];
  
  // Get the specific subjects that this classroom's grade is supposed to learn
  const requiredSubjects = selectedClass?.grade?.subjects || [];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
      
      {/* ========================================= */}
      {/* LEFT COLUMN: NAVIGATOR                    */}
      {/* ========================================= */}
      <div className="bg-white/40 border border-white/50 shadow-sm rounded-2xl p-5 flex flex-col h-full min-h-0">
        
        <div className="flex items-center gap-2 mb-3 border-b border-gray-200/50 pb-2 shrink-0">
          <CalendarDays className="text-blue-600" size={20} />
          <h3 className="text-lg font-bold text-gray-800 tracking-tight">1. Select Year</h3>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto custom-scrollbar pb-2 shrink-0">
            {years.map(year => (
                <button 
                    key={year.id} onClick={() => handleYearClick(year)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap shadow-sm border ${selectedYear?.id === year.id ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50'}`}
                >
                    {year.name}
                </button>
            ))}
        </div>

        <div className="flex items-center gap-2 mb-3 border-b border-gray-200/50 pb-2 shrink-0">
          <School className="text-indigo-600" size={20} />
          <h3 className="text-lg font-bold text-gray-800 tracking-tight">2. Select Classroom</h3>
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          {!selectedYear ? (
              <p className="text-center text-gray-400 text-sm mt-4 italic">Please select an Academic Year first.</p>
          ) : classesForYear.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-4 italic">No classrooms built for {selectedYear.name} yet.</p>
          ) : (
              classesForYear.map(cls => (
                  <div 
                      key={cls.id} onClick={() => setSelectedClass(cls)}
                      className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border shadow-sm group ${selectedClass?.id === cls.id ? 'bg-indigo-50 border-indigo-400' : 'bg-white/80 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
                  >
                      <div>
                          <p className="font-bold text-gray-800">{cls.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{cls.grade?.name}</p>
                      </div>
                      <ChevronRight size={18} className={`${selectedClass?.id === cls.id ? 'text-indigo-600' : 'text-gray-300 group-hover:text-indigo-400'}`} />
                  </div>
              ))
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* RIGHT COLUMN: TIMETABLE BUILDER           */}
      {/* ========================================= */}
      <div className="bg-white/40 border border-white/50 shadow-sm rounded-2xl p-5 flex flex-col h-full min-h-0 relative">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200/50 pb-3 shrink-0">
          <BookOpen className="text-purple-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Subject Allocation</h3>
        </div>

        {!selectedClass ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200/60 rounded-xl min-h-0 p-6 text-center">
             <BookDashed size={40} className="mb-3 text-gray-300" />
             <p>Select a Classroom from the left to assign teachers to subjects.</p>
           </div>
        ) : (
           <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300 min-h-0">
             
             <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg mb-4 flex justify-between items-center shrink-0 shadow-sm">
                <div>
                    <h4 className="text-purple-800 font-bold leading-tight">{selectedClass.name} Timetable</h4>
                    <span className="text-xs text-purple-600 font-medium">Grade: {selectedClass.grade?.name}</span>
                </div>
                <div className="bg-white px-3 py-1 rounded text-sm font-bold text-purple-600 border border-purple-100">
                    {requiredSubjects.length} Subjects Needed
                </div>
             </div>

             <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {requiredSubjects.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm mt-4 italic">No subjects are defined for this Grade yet. Please update the Syllabus in the Curriculum Tab.</p>
                ) : (
                    requiredSubjects.map(subject => {
                        // Check if a teacher is already assigned to this subject for this specific classroom!
                        const existingAllocation = allocations.find(
                            a => a.classDetails?.id === selectedClass.id && a.subject?.id === subject.id
                        );

                        return (
                            <div key={subject.id} className="bg-white/70 border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col gap-2 hover:border-purple-200 transition-colors">
                                <div className="flex justify-between items-center">
                                    <h5 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                        {subject.name}
                                        {existingAllocation && <CheckCircle2 size={16} className="text-green-500" />}
                                    </h5>
                                </div>
                                
                                {existingAllocation ? (
                                    <div className="bg-green-50 border border-green-200 text-green-800 p-2.5 rounded-lg text-sm font-medium flex justify-between items-center">
                                        <span>Teacher: {existingAllocation.employee?.title?.name} {existingAllocation.employee?.fullName}</span>
                                        <span className="text-xs bg-white px-2 py-1 rounded text-green-600 shadow-sm border border-green-100">Assigned</span>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <select 
                                            value={teacherSelections[subject.id] || ""} 
                                            onChange={(e) => handleSelectTeacher(subject.id, e.target.value)}
                                            className="flex-1 p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm"
                                        >
                                            <option value="">-- Assign a Teacher --</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.title?.name} {emp.fullName}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={() => handleSaveAllocation(subject.id)}
                                            disabled={!teacherSelections[subject.id]}
                                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
             </div>

           </div>
        )}
      </div>

    </div>
  );
};

export default TimetableTab;