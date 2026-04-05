import { 
  X, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  Users,
  Edit,
  Trash2
} from 'lucide-react';

const StudentView = ({ student, onClose, onEdit, onDelete }) => {
  if (!student) return null;

  // Helper to format dates cleanly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString.split('T')[0];
  };

  return (
    // THE FIX: Removed "fixed inset-0". It is now a flexible sibling component (w-1/3 or fixed width)
    // min-w-[380px] ensures it never gets too squished on smaller laptop screens
    <div className="w-1/3 min-w-[350px] h-full flex flex-col bg-white/85 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-3xl animate-in slide-in-from-right duration-300 overflow-hidden ml-4">
      
      {/* HEADER */}
      <div className="p-5 border-b border-gray-200/50 flex justify-between items-center bg-white/40">
        <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight ml-2">
          Student Profile
        </h2>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-red-600 transition p-2 rounded-xl hover:bg-red-50/80"
        >
          <X size={22} />
        </button>
      </div>
      
      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        
        {/* PROFILE HERO SECTION */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-inner border border-blue-100">
            <User size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {student.fullname}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {student.nameWithInitial || "No Initials Provided"}
          </p>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold mt-4 shadow-sm border ${
            student.studentStatus?.id === 1 
              ? "bg-green-100/80 border-green-200 text-green-800" 
              : "bg-red-100/80 border-red-200 text-red-800"
          }`}>
            {student.studentStatus?.name || "Active"}
          </span>

          {/* NEW: QUICK ACTION BUTTONS (EDIT & DELETE) */}
          <div className="flex gap-3 mt-5 w-full">
            <button 
              onClick={() => onEdit && onEdit(student)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/50 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Edit size={16} /> Edit
            </button>
            <button 
              onClick={() => onDelete && onDelete(student)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/50 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* SECTION 1: QUICK ACADEMICS */}
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-blue-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <ShieldCheck size={12} /> Reg ID
            </p>
            <p className="font-semibold text-gray-800">
              {student.indexNo || `STU-${student.id.toString().padStart(3, '0')}`}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-blue-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <GraduationCap size={12} /> Class
            </p>
            <p className="font-semibold text-gray-800">
              {student.grade?.name || 'Not Assigned'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[11px] text-blue-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <Calendar size={12} /> Enrolled Date
            </p>
            <p className="font-semibold text-gray-800">
              {formatDate(student.addDate)}
            </p>
          </div>
        </div>

        {/* SECTION 2: PERSONAL IDENTITY */}
        <div>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText size={16} /> Personal Details
          </h4>
          <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Date of Birth</p>
                <p className="font-medium text-gray-800">{formatDate(student.dob)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">NIC Number</p>
                <p className="font-medium text-gray-800">{student.nic || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Birth Certificate No.</p>
              <p className="font-medium text-gray-800">{student.birthCertificateNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5 flex items-center gap-1">
                <MapPin size={12} /> Address
              </p>
              <p className="font-medium text-gray-800 leading-snug">{student.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: MONASTIC / TYPE INFO */}
        <div>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen size={16} /> Monastic Information
          </h4>
          <div className="space-y-3 bg-orange-50/30 p-4 rounded-2xl border border-orange-100/50">
            <div>
              <p className="text-xs text-orange-800/70 font-medium mb-0.5">Student Type</p>
              <p className="font-semibold text-orange-900">{student.studentType?.name || 'N/A'}</p>
            </div>
            
            {/* ONLY SHOW NIKAYA/ORDINATION IF MONK (Type 1) */}
            {student.studentType?.id === 1 && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-orange-100">
                <div>
                  <p className="text-xs text-orange-800/70 font-medium mb-0.5">Nikaya</p>
                  <p className="font-medium text-orange-900">{student.nikaya?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-orange-800/70 font-medium mb-0.5">Ordination Date</p>
                  <p className="font-medium text-orange-900">{formatDate(student.ordinationDate)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: GUARDIAN & HISTORY */}
        <div className="pb-4">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users size={16} /> Background & Guardian
          </h4>
          <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Previous School / Pirivena</p>
              <p className="font-medium text-gray-800">{student.previousSchoolPirivena || 'N/A'}</p>
            </div>
            <div className="pt-2 border-t border-gray-200/50">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Linked Guardian</p>
              <p className="font-semibold text-indigo-700">
                {student.guardian ? student.guardian.fullname : 'No Guardian Linked'}
              </p>
            </div>
            {student.note && (
              <div className="pt-2 border-t border-gray-200/50">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Additional Notes</p>
                <p className="text-sm font-medium text-gray-700 italic border-l-2 border-gray-300 pl-2">
                  "{student.note}"
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentView;