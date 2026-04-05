import { 
  X, 
  User, 
  Edit, 
  Trash2, 
  Phone, 
  MessageCircle, 
  MapPin, 
  FileText, 
  Briefcase, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';

const GuardianView = ({ guardian, onCloseClick, onEdit, onDelete }) => {
  if (!guardian) return null;

  // Helper to format dates cleanly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString.split('T')[0];
  };

  return (
    // Flexible sibling component (w-1/3) that shrinks the table, not overlaps it
    <div className="w-1/3 min-w-[350px] h-full flex flex-col bg-white/85 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-3xl animate-in slide-in-from-right duration-300 overflow-hidden ml-4">
      
      {/* HEADER */}
      <div className="p-5 border-b border-gray-200/50 flex justify-between items-center bg-white/40">
        <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight ml-2">
          Guardian Profile
        </h2>
        <button 
          onClick={onCloseClick} 
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
            {/* Include the title (Ven, Mr, etc.) if it exists */}
            {guardian.title ? `${guardian.title.name} ` : ''}{guardian.fullname}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {guardian.nameWithInitials || "No Initials Provided"}
          </p>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold mt-4 shadow-sm border ${
            guardian.guardianStatus?.id === 1 
              ? "bg-green-100/80 border-green-200 text-green-800" 
              : "bg-red-100/80 border-red-200 text-red-800"
          }`}>
            {guardian.guardianStatus?.name || "Active"}
          </span>

          {/* QUICK ACTION BUTTONS (EDIT & DELETE) */}
          <div className="flex gap-3 mt-5 w-full">
            <button 
              onClick={() => onEdit && onEdit(guardian)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/50 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Edit size={16} /> Edit
            </button>
            <button 
              onClick={() => onDelete && onDelete(guardian)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/50 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* SECTION 1: QUICK CONTACT & SYSTEM INFO */}
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-blue-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <Phone size={12} /> Primary Phone
            </p>
            <p className="font-semibold text-gray-800">
              {guardian.phone || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-blue-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <MessageCircle size={12} /> WhatsApp
            </p>
            <p className="font-semibold text-gray-800">
              {guardian.whatsappNumber || 'N/A'}
            </p>
          </div>
          <div className="col-span-1 pt-2 border-t border-blue-100/60">
            <p className="text-[11px] text-blue-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <ShieldCheck size={12} /> Guardian ID
            </p>
            <p className="font-semibold text-gray-800">
              GRD-{guardian.id?.toString().padStart(3, '0')}
            </p>
          </div>
          <div className="col-span-1 pt-2 border-t border-blue-100/60">
            <p className="text-[11px] text-blue-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <Calendar size={12} /> Registered
            </p>
            <p className="font-semibold text-gray-800">
              {formatDate(guardian.addDate)}
            </p>
          </div>
        </div>

        {/* SECTION 2: PERSONAL IDENTITY */}
        <div>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText size={16} /> Identity & Location
          </h4>
          <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">NIC Number</p>
              <p className="font-medium text-gray-800 tracking-wide">{guardian.nic || 'N/A'}</p>
            </div>
            <div className="pt-2 border-t border-gray-200/50">
              <p className="text-xs text-gray-500 font-medium mb-0.5 flex items-center gap-1">
                <MapPin size={12} /> Address
              </p>
              <p className="font-medium text-gray-800 leading-snug">{guardian.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: DEMOGRAPHICS & NOTES */}
        <div className="pb-4">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Briefcase size={16} /> Demographics
          </h4>
          <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Guardian Type</p>
                <p className="font-semibold text-indigo-700">{guardian.guardianType?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Occupation</p>
                <p className="font-medium text-gray-800">{guardian.occupation || 'N/A'}</p>
              </div>
            </div>
            
            {guardian.note && (
              <div className="pt-3 mt-1 border-t border-gray-200/50">
                <p className="text-xs text-gray-500 font-medium mb-1">Additional Notes</p>
                <p className="text-sm font-medium text-gray-700 italic border-l-2 border-gray-300 pl-2">
                  "{guardian.note}"
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuardianView;