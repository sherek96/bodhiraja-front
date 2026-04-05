import EmployeeTable from "./EmployeeTable";
import EmployeeView from "./EmployeeView";
import EmployeeRegistraion from "./EmployeeRegistration"
import { useState } from "react";
import axios from "axios";

const EmployeeManagement = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDelete = async (employee) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete ${employee.fullName}?`);
    if (!isConfirmed) return;

    try {
      await axios.delete ("http://localhost:8080/employee/delete", { data: { id: employee.id } });
      alert("Employee deleted successfully.");
      setSelectedEmployee(null);

      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete employee:", error);
      alert("Failed to delete employee. Please try again.");
    }
  }


  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      <div className={`transition-all duration-300 ease-in-out ${selectedEmployee ? "w-2/3" : "w-full"}`}>
        <EmployeeTable
          onAddClick = {()=> setIsModalOpen(true)}
          onViewClick = {(employee)=> setSelectedEmployee(employee)}
          refreshTrigger={refreshTrigger} 
        />
      </div>
      {selectedEmployee && (
       
          <EmployeeView
           employee = {selectedEmployee}
           onClose = {()=>setSelectedEmployee(null)}
            onEdit={()=>setIsModalOpen(true)}
            onDelete={handleDelete}
          />
       
      )}
      <EmployeeRegistraion
      isModalOpen = {isModalOpen}
      onClose = {() => setIsModalOpen(false)}
      employeeToEdit = {selectedEmployee}
      onSuccess={() => {setRefreshTrigger((prev) => prev + 1), setSelectedEmployee(null)}}
      />
    </div>
  );
};

export default EmployeeManagement;
