import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCog, UserPlus, KeyRound, Shield } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // State for the new user form
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        employeeId: '',
        role: 'TEACHER' // Default selection
    });

    useEffect(() => {
        fetchUsers();
        fetchEmployees();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:8080/employee/all');
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees", error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/users', formData);
            setMessage("User created successfully!");
            setIsError(false);
            fetchUsers(); 
            
            // Clear the form
            setFormData({ username: '', password: '', email: '', employeeId: '', role: 'TEACHER' });
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data || "Error creating user");
            setIsError(true);
        }
    };

    const handleResetPassword = async (userId) => {
        if (window.confirm("Are you sure you want to reset this user's password to '1234'?")) {
            try {
                await axios.put(`http://localhost:8080/users/${userId}/reset-password`);
                alert("Password reset to 1234 successfully!");
            } catch (error) {
                alert("Failed to reset password.");
            }
        }
    };

    // --- SHARED STYLING CLASSES (From your design language) ---
    const inputBaseClass = "w-full p-2.5 bg-white/50 border rounded-xl shadow-sm backdrop-blur-sm focus:bg-white/80 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300 text-gray-800 placeholder-gray-400";
    const labelClass = "text-sm font-semibold text-gray-700 mb-1 ml-1";
    const requiredStar = <span className="text-red-500 ml-1">*</span>;

    const roles = ['ADMIN', 'PRINCIPAL', 'TEACHER', 'CLERK'];

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-10">
            
            {/* --- TOP SECTION: ADD USER FORM --- */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl p-6 md:p-8">
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                        <UserPlus size={28} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
                        Register System User
                    </h2>
                </div>
                
                {message && (
                    <div className={`p-4 mb-6 rounded-xl border backdrop-blur-sm ${isError ? "bg-red-50/50 border-red-200 text-red-700" : "bg-green-50/50 border-green-200 text-green-700"} font-medium flex items-center gap-2`}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleCreateUser} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        
                        <div className="flex flex-col">
                            <label className={labelClass}>Username{requiredStar}</label>
                            <input type="text" name="username" placeholder="johndoe" 
                                   value={formData.username} onChange={handleInputChange} required 
                                   className={`${inputBaseClass} border-white/50`} />
                        </div>
                        
                        <div className="flex flex-col">
                            <label className={labelClass}>Temporary Password{requiredStar}</label>
                            <input type="password" name="password" placeholder="••••••••" 
                                   value={formData.password} onChange={handleInputChange} required 
                                   className={`${inputBaseClass} border-white/50`} />
                        </div>
                        
                        <div className="flex flex-col">
                            <label className={labelClass}>Email Address{requiredStar}</label>
                            <input type="email" name="email" placeholder="john@pirivena.lk" 
                                   value={formData.email} onChange={handleInputChange} required 
                                   className={`${inputBaseClass} border-white/50`} />
                        </div>

                        <div className="flex flex-col">
                            <label className={labelClass}>Link to Employee{requiredStar}</label>
                            <select name="employeeId" value={formData.employeeId} onChange={handleInputChange} required
                                    className={`${inputBaseClass} border-white/50`}>
                                <option value="">-- Select Employee --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.employeeNo} - {emp.nameWithInitial}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Styled Role Selection */}
                    <div className="flex flex-col mt-2">
                        <label className={labelClass}>System Role{requiredStar}</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-1">
                            {roles.map((roleOption) => (
                                <label key={roleOption} 
                                       className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                                           formData.role === roleOption 
                                           ? 'border-blue-400 bg-blue-50/60 shadow-sm text-blue-700 font-bold' 
                                           : 'border-white/60 bg-white/40 hover:bg-white/80 text-gray-600 font-medium'
                                       }`}>
                                    <input 
                                        type="radio" 
                                        name="role" 
                                        value={roleOption} 
                                        checked={formData.role === roleOption} 
                                        onChange={handleInputChange}
                                        className="hidden" // Hide the ugly default dot!
                                    />
                                    {roleOption === 'ADMIN' && <Shield size={16} className={formData.role === roleOption ? "text-blue-600" : "text-gray-400"} />}
                                    <span className="capitalize">{roleOption.toLowerCase()}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-300/50 mt-2">
                        <button type="submit" 
                                className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-semibold tracking-wide">
                            <UserPlus size={18} />
                            Create User Account
                        </button>
                    </div>
                </form>
            </div>

            {/* --- BOTTOM SECTION: USER TABLE --- */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl flex flex-col overflow-hidden">
                
                <div className="p-6 border-b border-gray-200/50 flex items-center gap-3 bg-white/30">
                    <div className="p-2 bg-indigo-100/50 text-indigo-600 rounded-lg">
                        <UserCog size={24} />
                    </div>
                    <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
                        Existing User Directory
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-blue-50/40 text-blue-900 font-bold uppercase text-xs tracking-wider border-b border-gray-200/60">
                            <tr>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Email Address</th>
                                <th className="px-6 py-4">Linked Employee</th>
                                <th className="px-6 py-4">Permissions</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user.id} className="border-b border-gray-100/50 hover:bg-blue-50/40 transition-colors duration-150">
                                        <td className="px-6 py-4 font-semibold text-gray-800">{user.username}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            {user.employee ? (
                                                <span className="font-medium text-blue-700">{user.employee.nameWithInitial}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">Unlinked Account</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {user.roles.map(r => (
                                                    <span key={r.id} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {r.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 flex justify-center">
                                            <button 
                                                onClick={() => handleResetPassword(user.id)}
                                                className="flex items-center gap-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all shadow-sm font-medium text-xs"
                                                title="Force password reset to 1234"
                                            >
                                                <KeyRound size={14} />
                                                Reset
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                                        <p className="text-lg font-medium">No system users found.</p>
                                        <p className="text-sm mt-1">Use the form above to register your first user.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}