import React, { useState, useEffect } from 'react';
import { CalendarDays, School, Plus, ChevronRight, CalendarCheck, Users, MapPin } from 'lucide-react';
import axios from 'axios';

const ClassroomTab = () => {
  // --- STATE ---
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  
  // Dropdown Data
  const [grades, setGrades] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // NEW: State to hold all the created classes
  const [classes, setClasses] = useState([]); 

  // Form States
  const [newYear, setNewYear] = useState({ name: "", startdate: "", enddate: "" });
  const [newClass, setNewClass] = useState({ name: "", maxStudentCount: 30, location: "", gradeId: "", employeeId: "", note: "" });

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    fetchYears();
    fetchDropdownData();
    fetchClasses(); // Fetch the classes when the page loads!
  }, []);

  const fetchYears = async () => {
    try {
      const response = await axios.get("http://localhost:8080/academic/year/all");
      setYears(response.data);
    } catch (error) { console.error("Failed to fetch years:", error); }
  };

  const fetchDropdownData = async () => {
    try {
        const [gradeRes, empRes] = await Promise.all([
            axios.get("http://localhost:8080/api/grades"),
            axios.get("http://localhost:8080/employee/all") 
        ]);
        setGrades(gradeRes.data);
        setEmployees(empRes.data);
    } catch (error) { console.error("Failed to fetch dropdowns:", error); }
  };

  // NEW: Function to get the classrooms
  const fetchClasses = async () => {
      try {
          const response = await axios.get("http://localhost:8080/academic/class/all");
          setClasses(response.data);
      } catch (error) { console.error("Failed to fetch classes:", error); }
  };

  // --- SUBMIT HANDLERS ---
  const handleAddYear = async (e) => {
    e.preventDefault();
    if (!newYear.name || !newYear.startdate || !newYear.enddate) return;

    try {
      await axios.post("http://localhost:8080/academic/year/add", newYear);
      setNewYear({ name: "", startdate: "", enddate: "" }); 
      fetchYears(); 
    } catch (error) { console.error("Failed to add year:", error); }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.name || !newClass.gradeId || !newClass.employeeId) return;

    try {
        const payload = {
            name: newClass.name,
            maxStudentCount: newClass.maxStudentCount,
            location: newClass.location,
            note: newClass.note,
            academicYear: { id: selectedYear.id }, 
            grade: { id: parseInt(newClass.gradeId) },
            teacher: { id: parseInt(newClass.employeeId) },
            classDetailsStatus: { id: 1 } 
        };

        await axios.post("http://localhost:8080/academic/class/add", payload);
        
        setNewClass({ name: "", maxStudentCount: 30, location: "", gradeId: "", employeeId: "", note: "" });
        
        // NEW: Refresh the list from the database immediately so the new class appears!
        fetchClasses(); 
        
    } catch (error) {
        console.error("Failed to create class:", error);
        alert("Failed to save class.");
    }
  };

  // NEW: Filter the master list of classes so we ONLY show the ones for the clicked year
  const classesForSelectedYear = selectedYear 
    ? classes.filter(c => c.academicYear?.id === selectedYear.id) 
    : [];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
      
      {/* ========================================= */}
      {/* LEFT COLUMN: ACADEMIC YEARS               */}
      {/* ========================================= */}
      <div className="bg-white/40 border border-white/50 shadow-sm rounded-2xl p-5 flex flex-col h-full min-h-0">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200/50 pb-3 shrink-0">
          <CalendarDays className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Academic Years</h3>
        </div>
        
        <form onSubmit={handleAddYear} className="flex flex-col gap-3 mb-5 shrink-0 bg-white/50 p-4 rounded-xl border border-gray-100">
          <input type="text" placeholder="Year (e.g. 2026)" maxLength="4" value={newYear.name} onChange={(e) => setNewYear({...newYear, name: e.target.value})} className="w-full p-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm" />
          <div className="flex gap-2">
            <div className="flex-1 text-xs text-gray-500 font-medium">Start Date<input type="date" value={newYear.startdate} onChange={(e) => setNewYear({...newYear, startdate: e.target.value})} className="w-full p-2 mt-1 bg-white/80 border border-gray-200 rounded-lg outline-none" /></div>
            <div className="flex-1 text-xs text-gray-500 font-medium">End Date<input type="date" value={newYear.enddate} onChange={(e) => setNewYear({...newYear, enddate: e.target.value})} className="w-full p-2 mt-1 bg-white/80 border border-gray-200 rounded-lg outline-none" /></div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-sm transition-colors font-medium text-sm mt-1">Open New Academic Year</button>
        </form>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          {years.map((year) => (
            <div key={year.id} onClick={() => setSelectedYear(year)} className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer shadow-sm group border ${selectedYear?.id === year.id ? 'bg-blue-50 border-blue-300' : 'bg-white/60 border-gray-100 hover:bg-blue-50/30'}`}>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg">{year.name}</span>
                <span className="text-xs text-gray-500 font-medium">{year.startdate} to {year.enddate}</span>
              </div>
              <ChevronRight size={20} className={`${selectedYear?.id === year.id ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-400'} transition-colors`} />
            </div>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* RIGHT COLUMN: CLASSROOM BUILDER           */}
      {/* ========================================= */}
      <div className="bg-white/40 border border-white/50 shadow-sm rounded-2xl p-5 flex flex-col h-full min-h-0 relative">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200/50 pb-3 shrink-0">
          <School className="text-indigo-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Classrooms</h3>
        </div>
        
        {!selectedYear ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200/60 rounded-xl min-h-0 p-6 text-center">
             <CalendarCheck size={40} className="mb-3 text-gray-300" />
             <p>Select an Academic Year from the left to start building classrooms.</p>
           </div>
        ) : (
           <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300 min-h-0">
             
             <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-3 rounded-lg mb-4 text-sm font-semibold flex justify-between items-center shrink-0">
                <span>Managing Classrooms for: <strong>{selectedYear.name}</strong></span>
                <span className="bg-white px-2 py-1 rounded text-xs font-bold text-indigo-500 shadow-sm">{selectedYear.startdate} to {selectedYear.enddate}</span>
             </div>
             
             {/* THE FORM */}
             <form onSubmit={handleCreateClass} className="flex flex-col gap-3 bg-white/60 border border-gray-200 p-4 rounded-xl shadow-sm shrink-0 mb-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1">Class Name <span className="text-red-500">*</span></label>
                        <input type="text" required placeholder="e.g. Mulika 1 - A" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} className="p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1">Grade <span className="text-red-500">*</span></label>
                        <select required value={newClass.gradeId} onChange={e => setNewClass({...newClass, gradeId: e.target.value})} className="p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm">
                            <option value="">-- Select --</option>
                            {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1">Teacher <span className="text-red-500">*</span></label>
                        <select required value={newClass.employeeId} onChange={e => setNewClass({...newClass, employeeId: e.target.value})} className="p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm">
                            <option value="">-- Select --</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.title?.name} {emp.fullName}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1">Max Capacity / Location</label>
                        <div className="flex gap-2">
                           <input type="number" value={newClass.maxStudentCount} onChange={e => setNewClass({...newClass, maxStudentCount: e.target.value})} className="w-16 p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm text-center" />
                           <input type="text" placeholder="Location..." value={newClass.location} onChange={e => setNewClass({...newClass, location: e.target.value})} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm" />
                        </div>
                    </div>
                </div>

                <button type="submit" className="mt-1 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg shadow-sm transition-colors font-bold text-sm">Create Classroom</button>
             </form>

             {/* THE CLASS LIST UI */}
             <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {classesForSelectedYear.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm mt-6 italic">No classrooms built for this year yet.</p>
                ) : (
                    classesForSelectedYear.map(cls => (
                        <div key={cls.id} className="bg-white border border-indigo-100 p-4 rounded-xl shadow-sm flex flex-col gap-2 hover:border-indigo-300 transition-colors group">
                            
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-extrabold text-gray-800 text-lg leading-none">{cls.name}</h4>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                        {cls.grade?.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                                    <Users size={12} /> Max: {cls.maxStudentCount}
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1 mt-1 border-t border-gray-100 pt-2">
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">T</span>
                                    {cls.teacher?.title?.name} {cls.teacher?.fullName}
                                </p>
                                {cls.location && (
                                    <p className="text-xs text-gray-400 flex items-center gap-2 ml-0.5">
                                        <MapPin size={12} /> {cls.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
             </div>

           </div>
        )}
      </div>

    </div>
  );
};

export default ClassroomTab;