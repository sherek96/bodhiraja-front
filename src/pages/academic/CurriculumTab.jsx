import React, { useState, useEffect } from 'react';
import { BookMarked, GraduationCap, Plus, Trash2, ChevronRight, ArrowLeft, BookOpenCheck } from 'lucide-react';
import axios from 'axios';

const CurriculumTab = () => {
  // --- STATE ---
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  const [grades, setGrades] = useState([]);
  const [newGradeName, setNewGradeName] = useState("");
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  
  const [selectedGrade, setSelectedGrade] = useState(null); 
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]); // Tracks the checkboxes!

  useEffect(() => {
    fetchSubjects();
    fetchGrades();
  }, []);

  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      const response = await axios.get("http://localhost:8080/api/subjects");
      setSubjects(response.data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchGrades = async () => {
    try {
      setIsLoadingGrades(true);
      const response = await axios.get("http://localhost:8080/api/grades");
      setGrades(response.data);
    } catch (error) {
      console.error("Failed to fetch grades:", error);
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      await axios.post("http://localhost:8080/api/subjects", { name: newSubjectName.trim() });
      setNewSubjectName(""); 
      fetchSubjects();       
    } catch (error) {
      console.error("Failed to add subject:", error);
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (!newGradeName.trim()) return;
    try {
      await axios.post("http://localhost:8080/api/grades", { name: newGradeName.trim() });
      setNewGradeName(""); 
      fetchGrades();       
    } catch (error) {
      console.error("Failed to add grade:", error);
    }
  };

  // --- SYLLABUS LOGIC ---
  const handleGradeClick = (grade) => {
      setSelectedGrade(grade);
      // Pre-check the boxes if the grade already has subjects assigned!
      if (grade.subjects) {
          setSelectedSubjectIds(grade.subjects.map(s => s.id));
      } else {
          setSelectedSubjectIds([]);
      }
  };

  const toggleSubject = (subjectId) => {
      setSelectedSubjectIds(prev => 
          prev.includes(subjectId) 
              ? prev.filter(id => id !== subjectId) // Uncheck
              : [...prev, subjectId]                // Check
      );
  };

  const handleSaveSyllabus = async () => {
      try {
          // Send the array of IDs exactly how your Java @RequestBody expects it!
          await axios.post(`http://localhost:8080/api/grades/${selectedGrade.id}/subjects`, selectedSubjectIds);
          alert("Syllabus updated successfully!");
          
          fetchGrades(); // Refresh the list so the new subjects are saved in React state
          setSelectedGrade(null); // Go back to the Grade list
      } catch (error) {
          console.error("Failed to save syllabus:", error);
          alert("Failed to save. Check server logs.");
      }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
      
      {/* ========================================= */}
      {/* LEFT COLUMN: SUBJECTS                     */}
      {/* ========================================= */}
      <div className="bg-white/40 border border-white/50 shadow-sm rounded-2xl p-5 flex flex-col h-full min-h-0 relative">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200/50 pb-3 shrink-0">
          <BookMarked className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Subjects</h3>
        </div>
        
        <form onSubmit={handleAddSubject} className="flex gap-2 mb-4 shrink-0">
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Add new subject..."
            className="flex-1 p-2.5 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all shadow-sm text-sm"
          />
          <button type="submit" disabled={!newSubjectName.trim()} className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center">
            <Plus size={20} />
          </button>
        </form>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          {isLoadingSubjects ? (
            <p className="text-center text-gray-500 mt-4 text-sm">Loading...</p>
          ) : subjects.map((subject) => (
            <div key={subject.id} className="flex items-center justify-between bg-white/60 border border-gray-100 p-3 rounded-xl hover:bg-blue-50/50 transition-colors">
              <span className="font-semibold text-gray-700">{subject.name}</span>
              <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* RIGHT COLUMN: GRADES & SYLLABUS           */}
      {/* ========================================= */}
      <div className="bg-white/40 border border-white/50 shadow-sm rounded-2xl p-5 flex flex-col h-full min-h-0 relative overflow-hidden">
        
        {!selectedGrade ? (
          
          /* --- VIEW 1: THE GRADE LIST --- */
          <div className="flex flex-col h-full animate-in slide-in-from-left duration-300">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200/50 pb-3 shrink-0">
              <GraduationCap className="text-indigo-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">Grades</h3>
            </div>
            
            <form onSubmit={handleAddGrade} className="flex gap-2 mb-4 shrink-0">
              <input
                type="text"
                value={newGradeName}
                onChange={(e) => setNewGradeName(e.target.value)}
                placeholder="e.g. Mulika 1"
                className="flex-1 p-2.5 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all shadow-sm text-sm"
              />
              <button type="submit" disabled={!newGradeName.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center">
                <Plus size={20} />
              </button>
            </form>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {isLoadingGrades ? (
                <p className="text-center text-gray-500 mt-4 text-sm">Loading...</p>
              ) : grades.map((grade) => (
                <div 
                  key={grade.id} 
                  onClick={() => handleGradeClick(grade)} // Updated to trigger pre-checking!
                  className="flex items-center justify-between bg-white/60 border border-indigo-100 p-3 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-700">{grade.name}</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {grade.subjects?.length || 0} Subjects Assigned
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-100/50 px-2 py-1 rounded-md">Edit Syllabus</span>
                    <ChevronRight size={18} className="text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : (

          /* --- VIEW 2: THE SYLLABUS BUILDER --- */
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            
            <div className="flex items-center gap-3 mb-4 border-b border-indigo-200/50 pb-3 shrink-0">
              <button 
                onClick={() => setSelectedGrade(null)} 
                className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-2 text-indigo-700">
                <BookOpenCheck size={22} />
                <h3 className="text-xl font-extrabold tracking-tight">
                  {selectedGrade.name} Syllabus
                </h3>
              </div>
            </div>

            {/* Checkbox Area */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-2 mb-4">
              {subjects.map((subject) => (
                  <label key={subject.id} className="flex items-center justify-between bg-white/60 border border-gray-200 p-3 rounded-xl hover:bg-indigo-50/50 transition-colors cursor-pointer group">
                      <span className="font-medium text-gray-700 select-none">{subject.name}</span>
                      <input 
                          type="checkbox" 
                          checked={selectedSubjectIds.includes(subject.id)}
                          onChange={() => toggleSubject(subject.id)}
                          className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                  </label>
              ))}
              {subjects.length === 0 && (
                  <p className="text-center text-gray-400 text-sm italic mt-4">Please add Subjects on the left side first.</p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-indigo-200/50 shrink-0">
                <button 
                    onClick={() => setSelectedGrade(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSaveSyllabus}
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                    Save Syllabus
                </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CurriculumTab;