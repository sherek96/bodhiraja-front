import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  validateName,
  generateShortName,
  validateNIC,
  validateMobile, // Added this for phone/whatsapp
  validateRequired,
} from "../../utils/validation";

const GuardianRegistration = ({ isModalOpen, onCloseClick, onSuccess, guardianToEdit }) => {
  const [isRendered, setIsRendered] = useState(isModalOpen);
  const [isClosing, setIsClosing] = useState(false);

  // --- THE DROPDOWN STORAGE BINS ---
  const [titlesList, setTitlesList] = useState([]);
  const [guardianTypesList, setGuardianTypesList] = useState([]);
  const [guardianStatusList, setGuardianStatusList] = useState([]);

  // --- THE FORM BRAIN ---
  const [formData, setFormData] = useState({
    title: "",
    fullname: "",
    nameWithInitials: "", // Matched to your backend JSON!
    nic: "",
    phone: "",
    whatsappNumber: "",
    address: "",
    occupation: "",
    guardianType: "",
    guardianStatus: "1", // Default to Active
    note: "",
  });

  const [errors, setErrors] = useState({});

  // --- THE MORNING ROUTINE (API CALL) ---
  useEffect(() => {
    if (isModalOpen) {
      setIsRendered(true);
      setIsClosing(false);

     if (guardianToEdit) {
      setFormData({
        id: guardianToEdit.id, 
        title: guardianToEdit.title?.id || "",
        fullname: guardianToEdit.fullname || "",
        nameWithInitials: guardianToEdit.nameWithInitials || "",
        nic: guardianToEdit.nic || "",
        phone: guardianToEdit.phone || "",
        whatsappNumber: guardianToEdit.whatsappNumber || "",
        address: guardianToEdit.address || "",
        occupation: guardianToEdit.occupation || "",
        guardianType: guardianToEdit.guardianType?.id || "",
        guardianStatus: guardianToEdit.guardianStatus?.id || "1",
        note: guardianToEdit.note || "",
      });
     } else {
      setFormData({
        id: null,
        title: "",
        fullname: "",
        nameWithInitials: "",
        nic: "",
        phone: "",
        whatsappNumber: "",
        address: "",
        occupation: "",
        guardianType: "",
        guardianStatus: "1",
        note: "",
      });
     }
      setErrors({});

      const fetchDropdownData = async () => {
        try {
          const [titlesRes, typesRes, statusRes] = await Promise.all([
            axios.get("http://localhost:8080/guardian/title"), // Assuming you created this endpoint!
            axios.get("http://localhost:8080/guardian/type/all"),
            axios.get("http://localhost:8080/guardian/status/all"),
          ]);

          setTitlesList(titlesRes.data);
          setGuardianTypesList(typesRes.data);
          setGuardianStatusList(statusRes.data);
        } catch (error) {
          console.error("Axios failed to load database records:", error);
        }
      };

      fetchDropdownData();
    } else if (isRendered) {
      setIsClosing(true);
      setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 400); // Matches your CSS animation timing
    }
  }, [isModalOpen, isRendered]);

  // ==========================================
  // 2. THE LOGIC & REFLEXES
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // 1. Fullname Format Validation & Auto-Initials
    if (name === "fullname") {
      const result = validateName(value);
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, fullname: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, fullname: null }));
        setFormData((prev) => ({
          ...prev,
          nameWithInitials: generateShortName(value),
        }));
      }
    }

    // 2. NIC Format Validation
    if (name === "nic" && value.trim() !== "") {
      const result = validateNIC(value); // Assuming validateNIC doesn't need age params for Guardians
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, nic: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, nic: null }));
      }
    }

    // 3. Phone Format Validation
    if (name === "phone" && value.trim() !== "") {
      const result = validateMobile(value);
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, phone: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, phone: null }));
      }
    }

    // 4. WhatsApp Format Validation
    if (name === "whatsappNumber" && value.trim() !== "") {
      const result = validateMobile(value);
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, whatsappNumber: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, whatsappNumber: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FORMAT CHECKS (Run them again just in case the user bypassed handleBlur)
    const nameCheck = validateName(formData.fullname);
    const phoneFormatCheck = validateMobile(formData.phone);
    
    // Optional Format Checks (Only error if they typed something invalid)
    const nicCheck = formData.nic ? validateNIC(formData.nic) : { isValid: true, error: null };
    const whatsappCheck = formData.whatsappNumber ? validateMobile(formData.whatsappNumber) : { isValid: true, error: null };

    // PRESENCE CHECKS (The ones you specifically requested!)
    const titleCheck = validateRequired(formData.title, "Title");
    const phoneRequiredCheck = validateRequired(formData.phone, "Phone Number");
    const addressCheck = validateRequired(formData.address, "Address");
    const occupationCheck = validateRequired(formData.occupation, "Occupation");
    const typeCheck = validateRequired(formData.guardianType, "Guardian Type");

    const finalErrors = {
      title: titleCheck.isValid ? null : titleCheck.error,
      fullname: nameCheck.isValid ? null : nameCheck.error,
      nic: nicCheck.isValid ? null : nicCheck.error,
      phone: !phoneRequiredCheck.isValid ? phoneRequiredCheck.error : (phoneFormatCheck.isValid ? null : phoneFormatCheck.error),
      whatsappNumber: whatsappCheck.isValid ? null : whatsappCheck.error,
      address: addressCheck.isValid ? null : addressCheck.error,
      occupation: occupationCheck.isValid ? null : occupationCheck.error,
      guardianType: typeCheck.isValid ? null : typeCheck.error,
    };

    setErrors((prev) => ({ ...prev, ...finalErrors }));

    const hasErrors = Object.values(finalErrors).some((error) => error !== null);

    if (hasErrors) {
      console.log("Submission stopped. Missing or invalid fields.");
      return;
    }

    // Assemble the payload exactly matching your JSON structure
    const payloadForDatabase = {
      id: formData.id,
      fullname: formData.fullname,
      nameWithInitials: formData.nameWithInitials,
      nic: formData.nic,
      phone: formData.phone,
      whatsappNumber: formData.whatsappNumber,
      address: formData.address,
      occupation: formData.occupation,
      note: formData.note,
      title: { id: parseInt(formData.title, 10) },
      guardianType: { id: parseInt(formData.guardianType, 10) },
      guardianStatus: { id: parseInt(formData.guardianStatus, 10) },
    };

    console.log("Ready for Java:", payloadForDatabase);

    try {
      if (formData.id) {
        
        await axios.put(
          "http://localhost:8080/guardian/update",
          payloadForDatabase ,
        );
        console.log("Update successful!");
        onSuccess();
      } else {
        // If we don't have an ID, we are ADDING
        await axios.post(
          "http://localhost:8080/guardian/add",
          payloadForDatabase
        );
        console.log("Add successful!");
        onSuccess();
      }
      onCloseClick();
    } catch (error) {
      console.error("Failed to save guardian:", error);
      if (error.response && error.response.data && error.response.data) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (!isRendered) return null;

  // ==========================================
  // 3. THE UI (BEAUTIFIED HTML)
  // ==========================================

  const inputBaseClass = "w-full p-2.5 bg-white/50 border rounded-xl shadow-sm backdrop-blur-sm focus:bg-white/80 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300 text-gray-800 placeholder-gray-400";
  const labelClass = "text-sm font-semibold text-gray-700 mb-1 ml-1";
  const requiredStar = <span className="text-red-500 ml-1">*</span>;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity ${isClosing ? "animate-glass-out" : "animate-glass"}`}>
      <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl p-8 custom-scrollbar ${isClosing ? "animate-modal-out" : "animate-modal"}`}>
        
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-6 tracking-tight">
          Register Guardian
        </h2>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
          
          {/* --- ZONE 1: IDENTITY --- */}
          <div className="grid grid-cols-12 gap-5">
            <div className="flex flex-col col-span-3">
              <label className={labelClass}>Title{requiredStar}</label>
              <select name="title" value={formData.title} onChange={handleChange} className={`${inputBaseClass} ${errors.title ? "border-red-400" : "border-white/50"}`}>
                <option value="">-- Select --</option>
                {titlesList.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.title && <span className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.title}</span>}
            </div>

            <div className="flex flex-col col-span-9">
              <label className={labelClass}>Full Name{requiredStar}</label>
              <input name="fullname" value={formData.fullname} onChange={handleChange} onBlur={handleBlur} className={`${inputBaseClass} ${errors.fullname ? "border-red-400" : "border-white/50"}`} />
              {errors.fullname && <span className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.fullname}</span>}
            </div>

            <div className="flex flex-col col-span-6">
              <label className={labelClass}>Name with Initials</label>
              <input name="nameWithInitials" value={formData.nameWithInitials} readOnly className="w-full p-2.5 bg-gray-100/50 border border-white/40 rounded-xl shadow-sm backdrop-blur-sm text-gray-600 cursor-not-allowed outline-none" />
            </div>

            <div className="flex flex-col col-span-6">
              <label className={labelClass}>NIC Number (Optional)</label>
              <input name="nic" value={formData.nic} onChange={handleChange} onBlur={handleBlur} className={`${inputBaseClass} ${errors.nic ? "border-red-400" : "border-white/50"}`} />
              {errors.nic && <span className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.nic}</span>}
            </div>
          </div>

          <hr className="border-gray-300/50" />

          {/* --- ZONE 2: CONTACT DETAILS --- */}
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label className={labelClass}>Primary Phone{requiredStar}</label>
              <input name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className={`${inputBaseClass} ${errors.phone ? "border-red-400" : "border-white/50"}`} />
              {errors.phone && <span className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.phone}</span>}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>WhatsApp Number (Optional)</label>
              <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} onBlur={handleBlur} className={`${inputBaseClass} ${errors.whatsappNumber ? "border-red-400" : "border-white/50"}`} />
              {errors.whatsappNumber && <span className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.whatsappNumber}</span>}
            </div>

            <div className="flex flex-col col-span-2">
              <label className={labelClass}>Address{requiredStar}</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className={`${inputBaseClass} resize-none ${errors.address ? "border-red-400" : "border-white/50"}`} />
              {errors.address && <span className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.address}</span>}
            </div>
          </div>

          <hr className="border-gray-300/50" />

          {/* --- ZONE 3: DEMOGRAPHICS --- */}
          <div className="grid grid-cols-3 gap-5">
            <div className="flex flex-col">
              <label className={labelClass}>Occupation{requiredStar}</label>
              <input name="occupation" value={formData.occupation} onChange={handleChange} className={`${inputBaseClass} ${errors.occupation ? "border-red-400" : "border-white/50"}`} />
              {errors.occupation && <span className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.occupation}</span>}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Guardian Type{requiredStar}</label>
              <select name="guardianType" value={formData.guardianType} onChange={handleChange} className={`${inputBaseClass} ${errors.guardianType ? "border-red-400" : "border-white/50"}`}>
                <option value="">-- Select --</option>
                {guardianTypesList.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {errors.guardianType && <span className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.guardianType}</span>}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Status</label>
              <select name="guardianStatus" value={formData.guardianStatus} onChange={handleChange} disabled className="w-full p-2.5 bg-gray-100/50 border border-white/40 rounded-xl shadow-sm backdrop-blur-sm text-gray-500 cursor-not-allowed outline-none">
                {guardianStatusList.map((status) => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* --- ZONE 4: NOTES --- */}
          <div className="flex flex-col">
            <label className={labelClass}>Additional Notes</label>
            <textarea name="note" value={formData.note} onChange={handleChange} rows="2" className={`${inputBaseClass} resize-none border-white/50`} />
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="flex justify-end gap-4 mt-2 pt-5 border-t border-gray-300/50">
            <button type="button" onClick={onCloseClick} className="px-6 py-2.5 text-gray-600 bg-white/50 border border-white/60 shadow-sm rounded-xl hover:bg-white/80 transition-all font-medium">
              Cancel
            </button>
            <button type="submit" className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-semibold tracking-wide">
              Save Guardian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuardianRegistration;