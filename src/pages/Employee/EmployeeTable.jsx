import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, Eye, ChevronLeft, ChevronRight, Briefcase } from "lucide-react";

const EmployeeTable = ({ onAddClick, onViewClick , refreshTrigger}) => {
  // --- STATE ---
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:8080/employee/all");
        setEmployees(response.data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, [refreshTrigger]);

  // --- SEARCH ENGINE ---
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = emp.fullName && emp.fullName.toLowerCase().includes(searchLower);
    const idMatch = emp.employeeNo && emp.employeeNo.toLowerCase().includes(searchLower);
    const nicMatch = emp.nic && emp.nic.toLowerCase().includes(searchLower);
    return nameMatch || idMatch || nicMatch;
  });

  // --- PAGINATION ENGINE ---
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl flex flex-col h-full overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="p-6 border-b border-gray-200/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
            <Briefcase size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
            Staff Directory
          </h2>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by name, NIC or Emp No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all shadow-sm text-sm"
            />
          </div>

          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 whitespace-nowrap text-sm"
          >
            <Plus size={18} />
            Add Staff
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-blue-50/40 text-blue-900 font-bold uppercase text-xs tracking-wider border-b border-gray-200/60">
            <tr>
              <th className="px-6 py-4">Emp No</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Designation</th>
              <th className="px-6 py-4">Mobile</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading staff records...
                  </div>
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-100/50 hover:bg-blue-50/40 transition-colors duration-150">
                  <td className="px-6 py-4 font-semibold text-gray-800">{emp.employeeNo}</td>
                  <td className="px-6 py-4 font-medium">
                    {emp.title ? `${emp.title.name} ` : ''}{emp.fullName}
                  </td>
                  <td className="px-6 py-4">{emp.designation?.name || '-'}</td>
                  <td className="px-6 py-4 tracking-wide">{emp.mobile}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      emp.status?.id === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {emp.status?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    <button
                      className="text-blue-600 hover:text-indigo-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors shadow-sm"
                      onClick={() => onViewClick(emp)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                  <p className="text-lg font-medium">No staff members found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {totalPages > 0 && !isLoading && (
        <div className="p-4 border-t border-gray-200/60 bg-white/40 flex items-center justify-between">
          <div className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900">{startIndex + 1}</span> to{" "}
            <span className="text-gray-900">{Math.min(startIndex + itemsPerPage, filteredEmployees.length)}</span> of{" "}
            <span className="text-gray-900">{filteredEmployees.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${currentPage === page ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"}`}>
                  {page}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;