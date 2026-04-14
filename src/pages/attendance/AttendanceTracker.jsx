import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarDays, School, Users, CheckCircle2, XCircle, Save, CheckSquare, Square } from 'lucide-react';

const AttendanceTracker = () => {
  // --- NAVIGATION STATE ---
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // --- ATTENDANCE STATE ---
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]); // Students in the selected class
  
  // A dictionary to track who is present. e.g., { 1: true, 2: false, 3: true }
  const [attendanceMap, setAttendanceMap] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. LOAD INITIAL DROPDOWNS ---
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const [yearRes, classRes] = await Promise.all([
                axios.get("http://localhost:8080/academic/year/all"),
                axios.get("http://localhost:8080/academic/class/all")
            ]);
            setYears(yearRes.data);
            setClasses(classRes.data);
        } catch (error) { console.error("Failed to load initial data:", error); }
    };
    fetchInitialData();
  }, []);

  // --- 2. LOAD STUDENTS WHEN CLASS IS SELECTED ---
  useEffect(() => {
    if (selectedClass) {
        const fetchStudents = async () => {
            try {
                // Using the specific endpoint we just built!
                const res = await axios.get(`http://localhost:8080/attendance/class/${selectedClass.id}/students`);
                const enrollments = res.data;
                setStudents(enrollments);

                // Default everyone to PRESENT (true) to save time!
                const initialMap = {};
                enrollments.forEach(reg => {
                    initialMap[reg.student.id] = true;
                });
                setAttendanceMap(initialMap);

            } catch (error) { console.error("Failed to load students:", error); }
        };
        fetchStudents();
    } else {
        setStudents([]);
        setAttendanceMap({});
    }
  }, [selectedClass]);

  // --- HANDLERS ---
  const handleYearClick = (year) => {
      setSelectedYear(year);
      setSelectedClass(null); // Reset class if year changes
  };

  const toggleAttendance = (studentId) => {
      setAttendanceMap(prev => ({
          ...prev,
          [studentId]: !prev[studentId]
      }));
  };

  const markAll = (status) => {
      const newMap = {};
      students.forEach(reg => newMap[reg.student.id] = status);
      setAttendanceMap(newMap);
  };

  const handleSubmit = async () => {
      if (students.length === 0) return;
      setIsSubmitting(true);

      // 1. Calculate Totals
      const totalCount = students.length;
      const presentCount = Object.values(attendanceMap).filter(status => status === true).length;
      const absenceCount = totalCount - presentCount;

      // 2. Build the DTO Payload perfectly mapped to Java
      const payload = {
          attendance: {
              attendanceDate: attendanceDate,
              totalCount: totalCount,
              presentCount: presentCount,
              absenceCount: absenceCount,
              classDetails: { id: selectedClass.id },
              attendanceStatus: { id: 1 } // Assuming ID 1 is "Conducted/Present" in your status table
          },
          studentList: students.map(reg => ({
              presentOrAbsence: attendanceMap[reg.student.id],
              student: { id: reg.student.id }
          }))
      };

      try {
          await axios.post("http://localhost:8080/attendance/add", payload);
          alert("Attendance successfully recorded!");
          // Reset for the next class
          setSelectedClass(null);
      } catch (error) {
          console.error("Failed to save attendance:", error);
          alert("Failed to save. Please try again.");
      } finally {
          setIsSubmitting(false);
      }
  };

  // --- FILTERING ---
  const classesForYear = selectedYear ? classes.filter(c => c.academicYear?.id === selectedYear.id) : [];

  // --- UI METRICS ---
  const currentPresent = Object.values(attendanceMap).filter(s => s === true).length;
  const currentAbsent = students.length - currentPresent;

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      
      {/* ========================================= */}
      {/* LEFT COLUMN: SELECTION HUB                */}
      {/* ========================================= */}
      <div className="lg:col-span-4 bg-white/40 border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] rounded-2xl p-5 flex flex-col h-full min-h-0">
        
        {/* Step 1: Year */}
        <div className="mb-6 shrink-0">
          <div className="flex items-center gap-2 mb-3 border-b border-gray-200/50 pb-2">
            <CalendarDays className="text-blue-600" size={18} />
            <h3 className="text-sm font-bold text-gray-800 tracking-tight uppercase">1. Select Year</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
              {years.map(year => (
                  <button 
                      key={year.id} onClick={() => handleYearClick(year)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap border ${selectedYear?.id === year.id ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50'}`}
                  >
                      {year.name}
                  </button>
              ))}
          </div>
        </div>

        {/* Step 2: Class */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-2 mb-3 border-b border-gray-200/50 pb-2 shrink-0">
            <School className="text-indigo-600" size={18} />
            <h3 className="text-sm font-bold text-gray-800 tracking-tight uppercase">2. Select Classroom</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            {!selectedYear ? (
                <p className="text-center text-gray-400 text-xs mt-4 italic">Select an Academic Year first.</p>
            ) : classesForYear.length === 0 ? (
                <p className="text-center text-gray-400 text-xs mt-4 italic">No classes found.</p>
            ) : (
                classesForYear.map(cls => (
                    <button 
                        key={cls.id} onClick={() => setSelectedClass(cls)}
                        className={`w-full text-left p-3 rounded-xl transition-all border group ${selectedClass?.id === cls.id ? 'bg-indigo-50 border-indigo-400 shadow-sm' : 'bg-white/80 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
                    >
                        <p className="font-bold text-gray-800">{cls.name}</p>
                        <p className="text-xs text-gray-500 font-medium">Grade: {cls.grade?.name}</p>
                    </button>
                ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* RIGHT COLUMN: THE ROLL CALL               */}
      {/* ========================================= */}
      <div className="lg:col-span-8 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl flex flex-col h-full min-h-0 relative">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-gray-200/50 flex justify-between items-center bg-white/30 shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100/50 text-emerald-600 rounded-lg">
                    <Users size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight">
                        Daily Roll Call
                    </h2>
                    <p className="text-xs font-bold text-gray-500">{selectedClass ? selectedClass.name : "No class selected"}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date:</label>
                <input 
                    type="date" 
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="p-2 bg-white/50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400"
                />
            </div>
        </div>

        {!selectedClass ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm p-6 text-center">
             <CheckSquare size={48} className="mb-4 text-gray-300" />
             <p className="text-lg font-medium text-gray-500">Select a classroom to begin.</p>
           </div>
        ) : students.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm p-6 text-center">
             <p className="text-lg font-medium text-gray-500">No students are enrolled in this class yet.</p>
           </div>
        ) : (
           <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
             
             {/* Stats & Quick Actions Bar */}
             <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center shrink-0">
                 <div className="flex gap-4">
                     <span className="text-sm font-bold text-gray-700">Total: {students.length}</span>
                     <span className="text-sm font-bold text-emerald-600">Present: {currentPresent}</span>
                     <span className="text-sm font-bold text-rose-600">Absent: {currentAbsent}</span>
                 </div>
                 <div className="flex gap-2">
                     <button onClick={() => markAll(true)} className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-md transition-colors">Mark All Present</button>
                     <button onClick={() => markAll(false)} className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-md transition-colors">Mark All Absent</button>
                 </div>
             </div>

             {/* The Student List */}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2">
                 {students.map(reg => {
                     const isPresent = attendanceMap[reg.student.id];
                     return (
                         <div 
                            key={reg.student.id} 
                            onClick={() => toggleAttendance(reg.student.id)}
                            className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${isPresent ? 'bg-emerald-50/30 border-emerald-200 hover:bg-emerald-50/60' : 'bg-rose-50/30 border-rose-200 hover:bg-rose-50/60'}`}
                         >
                             <div className="flex items-center gap-4">
                                 {/* Avatar placeholder */}
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${isPresent ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                    {reg.student.fullname.charAt(0)}
                                 </div>
                                 <div>
                                     <p className={`font-bold ${isPresent ? 'text-gray-800' : 'text-gray-500'}`}>{reg.student.fullname}</p>
                                     <p className="text-xs text-gray-500 font-medium">Index: {reg.student.indexNo}</p>
                                 </div>
                             </div>

                             {/* The Toggle Switch Design */}
                             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-sm shadow-sm transition-all ${isPresent ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-rose-600 border-rose-200'}`}>
                                 {isPresent ? (
                                     <><CheckCircle2 size={16} /> Present</>
                                 ) : (
                                     <><XCircle size={16} /> Absent</>
                                 )}
                             </div>
                         </div>
                     );
                 })}
             </div>

             {/* Footer Action */}
             <div className="p-5 border-t border-gray-200/60 bg-white/50 shrink-0 flex justify-end">
                 <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                 >
                     <Save size={18} /> {isSubmitting ? "Saving..." : "Save Attendance"}
                 </button>
             </div>

           </div>
        )}
      </div>

    </div>
  );
};

export default AttendanceTracker;