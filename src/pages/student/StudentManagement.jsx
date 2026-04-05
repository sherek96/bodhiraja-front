import { useState } from 'react';
import StudentTable from './StudentTable';
import StudentRegistration from './StudentRegistration';
import StudentView from './StudentView';
import axios from 'axios';

const StudentManagement = () => {
  // State to control what is visible
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to trigger data refresh in child components

  // Handler for deleting a student
  const handleDelete = async (student) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete ${student.fullname}?`);
    if (!isConfirmed) return;

    try {
      await axios.delete("http://localhost:8080/student/delete", { data: { id: student.id } });
      alert("Student deleted successfully.");
      setSelectedStudent(null); // Close the detail view if the deleted student was being viewed

      // Trigger a refresh in the StudentTable to reflect the deletion
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("Failed to delete student. Please try again.");

    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      
      {/* The Table Container
        Notice the transition classes: If a student is selected, it shrinks to w-2/3.
      */}
      <div className={`transition-all duration-300 ease-in-out ${selectedStudent ? 'w-2/3' : 'w-full'}`}>
        <StudentTable 
          onAddClick={() => setIsModalOpen(true)} 
          onViewClick={(student) => setSelectedStudent(student)} 
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* The Right Side Panel */}
      {selectedStudent && (
        <StudentView 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          onDelete={handleDelete}
          onEdit={()=> setIsModalOpen(true)}
        />
      )}

      {/* The Glassmorphism Form Modal */}
      <StudentRegistration 
        isModalOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        studentToEdit={selectedStudent}
        onSuccess={() => {
          setRefreshTrigger((prev) => prev + 1); // Refresh the table after add/edit
          setSelectedStudent(null); // Close the detail view if we just edited that student
        }}
      />

    </div>
  );
};

export default StudentManagement;