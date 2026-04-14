import React, { useState, useEffect } from 'react';
import { CalendarDays, School, Users, UserPlus, CheckCircle2, ChevronRight, UserCheck } from 'lucide-react';
import axios from 'axios';

const EnrollmentTab = () => {
  // --- STATE ---
  // Navigation State
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // Data State
  const [allStudents, setAllStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]); // All student registrations
  
  // Form State
  const [newEnrollment, setNewEnrollment] = useState({
      studentId: "",
      regno: "",
      registerdate: new Date().toISOString().split('T')[0] // Defaults to today
  });

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
        const [yearRes, classRes, studentRes] = await Promise.all([
            axios.get("http://localhost:8080/academic/year/all"),
            axios.get("http://localhost:8080/academic/class/all"),
            axios.get("http://localhost:8080/student/all") // Verify this URL!
        ]);
        setYears(yearRes.data);
        setClasses(classRes.data);
        setAllStudents(studentRes.data);
        
        // We also need to fetch existing enrollments! 
        // We will build this endpoint in Spring Boot next.
        fetchEnrollments();
    } catch (error) { console.error("Failed to fetch data:", error); }
  };

  const fetchEnrollments = async () => {
      try {
          // Assuming we will build this GET endpoint next
          const response = await axios.get("http://localhost:8080/academic/enrollment/all");
          setEnrollments(response.data);
      } catch (error) { console.log("Enrollment endpoint might not exist yet."); }
  };

  // --- HANDLERS ---
  const handleYearClick = (year) => {
      setSelectedYear(year);
      setSelectedClass(null); // Reset class selection when year changes
  };

  const handleEnrollStudent = async (e) => {
      e.preventDefault();
      if (!newEnrollment.studentId || !newEnrollment.regno) return;

      try {
          // Getting the current user ID for security (just like we did for Classrooms)
          const currentUserId = localStorage.getItem("user_id") || "1";

          // Format payload for the studentregistration table
          const payload = {
              regno: parseInt(newEnrollment.regno),
              registerdate: newEnrollment.registerdate,
              classDetails: { id: selectedClass.id },
              student: { id: parseInt(newEnrollment.studentId) },
              studentRegistrationStatus: { id: 1 }, // Assuming 1 is "Active"
              addUser: parseInt(currentUserId)
          };

          // We will build this POST endpoint in Spring Boot next!
          await axios.post("http://localhost:8080/academic/enrollment/add", payload);
          
          alert("Student successfully enrolled in " + selectedClass.name);
          setNewEnrollment({ ...newEnrollment, studentId: "", regno: "" });
          fetchEnrollments(); // Refresh the roster
          
      } catch (error) {
          console.error("Failed to enroll student:", error);
          alert("Failed to enroll student. Check server logs.");
      }
  };

  // --- FILTERING LOGIC ---
  const classesForYear = selectedYear ? classes.filter(c => c.academicYear?.id === selectedYear.id) : [];
  
  // Get enrollments specifically for the clicked classroom
  const currentRoster = selectedClass ? enrollments.filter(e => e.classDetails?.id === selectedClass.id) : [];
  
  // Filter the dropdown so we don't show students who are already in this specific class
  const availableStudents = allStudents.filter(student => 
      !currentRoster.some(enrollment => enrollment.student?.id === student.id)
  );

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
      
      {/* ========================================= */}
      {/* LEFT COLUMN: NAVIGATOR                    */}
      {/* ========================================= */}
      <div className="bg-white/40 border border-white/50 shadow-sm rounded-2xl p-5 flex flex-col h-full min-h-0">
        
        {/* Step 1: Select Year */}
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

        {/* Step 2: Select Class */}
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
                          <p className="text-xs text-gray-500 font-medium">{cls.grade?.name} | Teacher: {cls.teacher?.fullName}</p>
                      </div>
                      <ChevronRight size={18} className={`${selectedClass?.id === cls.id ? 'text-indigo-600' : 'text-gray-300 group-hover:text-indigo-400'}`} />
                  </div>
              ))
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* RIGHT COLUMN: THE ROSTER                  */}
      {/* ========================================= */}
      <div className="bg-white/40 border border-white/50 shadow-sm rounded-2xl p-5 flex flex-col h-full min-h-0 relative">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200/50 pb-3 shrink-0">
          <Users className="text-emerald-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Enrollment Roster</h3>
        </div>

        {!selectedClass ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200/60 rounded-xl min-h-0 p-6 text-center">
             <UserCheck size={40} className="mb-3 text-gray-300" />
             <p>Select a Classroom from the left to manage its students.</p>
           </div>
        ) : (
           <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300 min-h-0">
             
             {/* Class Header Banner */}
             <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg mb-4 flex justify-between items-center shrink-0 shadow-sm">
                <div>
                    <h4 className="text-emerald-800 font-bold leading-tight">{selectedClass.name}</h4>
                    <span className="text-xs text-emerald-600 font-medium">Capacity: {currentRoster.length} / {selectedClass.maxStudentCount}</span>
                </div>
                <div className="bg-white px-3 py-1 rounded text-sm font-bold text-emerald-600 border border-emerald-100">
                    {selectedYear?.name}
                </div>
             </div>

             {/* Add Student Form */}
             <form onSubmit={handleEnrollStudent} className="flex flex-col gap-3 bg-white/70 border border-gray-200 p-4 rounded-xl shadow-sm shrink-0 mb-4">
                <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1">Add Student to Class</label>
                
                <div className="flex gap-2">
                    <select required value={newEnrollment.studentId} onChange={e => setNewEnrollment({...newEnrollment, studentId: e.target.value})} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm">
                        <option value="">-- Select Student --</option>
                        {availableStudents.map(s => <option key={s.id} value={s.id}>{s.fullname} ({s.indexNo})</option>)}
                    </select>
                </div>

                <div className="flex gap-2">
                    <input type="number" required placeholder="Registration No. (e.g. 101)" value={newEnrollment.regno} onChange={e => setNewEnrollment({...newEnrollment, regno: e.target.value})} className="w-1/2 p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm" />
                    <input type="date" required value={newEnrollment.registerdate} onChange={e => setNewEnrollment({...newEnrollment, registerdate: e.target.value})} className="w-1/2 p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm" />
                </div>

                <button type="submit" disabled={currentRoster.length >= selectedClass.maxStudentCount} className="mt-1 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-2 rounded-lg shadow-sm transition-colors font-bold text-sm flex items-center justify-center gap-2">
                    <UserPlus size={16} /> Enroll Student
                </button>
             </form>

             {/* Roster List */}
             <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                {currentRoster.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm mt-4 italic">No students enrolled in this class yet.</p>
                ) : (
                    currentRoster.map(enrollment => (
                        <div key={enrollment.id} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:border-emerald-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                                    {enrollment.student?.fullname?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{enrollment.student?.fullname}</p>
                                    <p className="text-[11px] text-gray-500 font-medium">Reg No: {enrollment.regno} | Index: {enrollment.student?.indexNo}</p>
                                </div>
                            </div>
                            <CheckCircle2 size={18} className="text-emerald-500" />
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

export default EnrollmentTab;