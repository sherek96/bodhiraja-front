import GuardianRegistration from "./GuardianRegistration";
import GuardianTable from "./GuardianTable";
import GuardianView from "./GuardianView";
import { useState } from "react";
import axios from "axios";

const GuardianManagement = () => {
  const [selectedGuardian, setSelectedGuardian] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDelete = async (guardian) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete ${guardian.fullname}?`);
    if (!isConfirmed) return;

    try {
      await axios.delete ("http://localhost:8080/guardian/delete", { data: { id: guardian.id } });
      alert("Guardian deleted successfully.");
      setSelectedGuardian(null);

      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete guardian:", error);
      alert("Failed to delete guardian. Please try again.");
    }
  }

  return (
   <div className="flex gap-4 h-[calc(100vh-8rem)]">
    <div className={`transition-all duration-300 ease-in-out ${selectedGuardian ? "w-2/3" : "w-full"}`}>
      <GuardianTable
      onAddClick={()=> setIsModalOpen(true)}
      onViewClick={(guardian) => setSelectedGuardian(guardian)}
      refreshTrigger={refreshTrigger}
      />
    </div>
    {selectedGuardian && (
      <GuardianView
      guardian={selectedGuardian}
      onCloseClick={()=>setSelectedGuardian(null)}
      onEdit={()=> setIsModalOpen(true)}
      onDelete={handleDelete}
      />
    )}
    <GuardianRegistration
    isModalOpen={isModalOpen}
    onCloseClick={()=> setIsModalOpen(false)}
     onSuccess={() => {setRefreshTrigger((prev) => prev + 1), setSelectedGuardian(null)}}
     guardianToEdit={selectedGuardian}
    />
   </div>
  );
};

export default GuardianManagement;
