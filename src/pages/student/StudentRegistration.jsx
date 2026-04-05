import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  validateName,
  generateShortName,
  validateNIC,
  ageValidator,
  validateRequired,
} from "../../utils/validation";

const StudentRegistration = ({
  isModalOpen,
  onClose,
  studentToEdit,
  onSuccess,
}) => {
  const [isRendered, setIsRendered] = useState(isModalOpen);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

  // --- THE DROPDOWN STORAGE BINS ---
  const [guardiansList, setGuardiansList] = useState([]);
  const [nikayasList, setNikayasList] = useState([]);
  const [gradesList, setGradesList] = useState([]);
  const [studentTypesList, setStudentTypesList] = useState([]);
  const [studentStatesList, setStudentStatusList] = useState([]);

  // --- THE FORM BRAIN ---
  const [formData, setFormData] = useState({
    fullname: "",
    nameWithInitial: "",
    nic: "",
    dob: "",
    birthCertificateNo: "",
    address: "",
    studentType: "",
    nikaya: "",
    ordinationDate: "",
    grade: "",
    previousSchoolPirivena: "",
    studentStatus: "1",
    note: "",
    guardian: "",
  });

  const [guardianSearchText, setGuardianSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [errors, setErrors] = useState({});

  // --- THE MORNING ROUTINE (API CALL) ---
  useEffect(() => {
    if (isModalOpen) {
      setIsRendered(true);
      setIsClosing(false);

      if (studentToEdit) {
        setFormData({
          id: studentToEdit.id,
          fullname: studentToEdit.fullname || "",
          nameWithInitial: studentToEdit.nameWithInitial || "",
          nic: studentToEdit.nic || "",
          dob: studentToEdit.dob ? studentToEdit.dob.split("T")[0] : "",
          birthCertificateNo: studentToEdit.birthCertificateNo || "",
          address: studentToEdit.address || "",
          studentType: studentToEdit.studentType?.id || "",
          nikaya: studentToEdit.nikaya?.id || "",
          ordinationDate: studentToEdit.ordinationDate
            ? studentToEdit.ordinationDate.split("T")[0]
            : "",
          grade: studentToEdit.grade?.id || "",
          previousSchoolPirivena: studentToEdit.previousSchoolPirivena || "",
          studentStatus: studentToEdit.studentStatus?.id || "1",
          note: studentToEdit.note || "",
          guardian: studentToEdit.guardian?.id || "",
        });
        setGuardianSearchText(studentToEdit.guardian?.fullname || "");
      } else {
        // Reset the main form data
        setFormData({
          id: null,
          fullname: "",
          nameWithInitial: "",
          nic: "",
          dob: "",
          birthCertificateNo: "",
          address: "",
          studentType: "",
          nikaya: "",
          ordinationDate: "",
          grade: "",
          previousSchoolPirivena: "",
          studentStatus: "1",
          note: "",
          guardian: "",
        });

        setGuardianSearchText("");
      }
      setErrors({});

      // FIX 2: Clear the Search Box memory when the modal opens!

      setIsDropdownOpen(false);

      const fetchDropdownData = async () => {
        try {
          const [guardiansRes, nikayasRes, gradesRes, typesRes, statusRes] =
            await Promise.all([
              axios.get("http://localhost:8080/guardian/all"),
              axios.get("http://localhost:8080/student/nikaya/all"),
              axios.get("http://localhost:8080/academic/grade/all"),
              axios.get("http://localhost:8080/student/type/all"),
              axios.get("http://localhost:8080/student/status/all"),
            ]);

          setGuardiansList(guardiansRes.data);
          setNikayasList(nikayasRes.data);
          setGradesList(gradesRes.data);
          setStudentTypesList(typesRes.data);
          setStudentStatusList(statusRes.data);
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
      }, 400);
    }
  }, [isModalOpen, isRendered]);

  // ==========================================
  // 2. THE LOGIC & REFLEXES
  // ==========================================

  const filteredGuardians = guardiansList.filter(
    (g) =>
      g.fullname.toLowerCase().includes(guardianSearchText.toLowerCase()) ||
      (g.nic && g.nic.toLowerCase().includes(guardianSearchText.toLowerCase())),
  );

  const handleSelectGuardian = (guardian) => {
    // FIX 3: Auto-fill the address if the guardian has one!
    setFormData((prev) => ({
      ...prev,
      guardian: guardian.id,
      address: guardian.address || prev.address, // Only overwrites if guardian has an address
    }));

    // Clear the address error if it just auto-filled
    if (guardian.address) {
      setErrors((prev) => ({ ...prev, address: null }));
    }

    setGuardianSearchText(guardian.fullname);
    setIsDropdownOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      if (name === "studentType" && value === "2") {
        updatedData.ordinationDate = "";
        updatedData.nikaya = "";
      }
      return updatedData;
    });

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors, [name]: null };
      if (name === "studentType" && value === "2") {
        updatedErrors.ordinationDate = null;
        updatedErrors.nikaya = null;
      }
      return updatedErrors;
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "fullname") {
      const result = validateName(value);
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, fullname: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, fullname: null }));
        setFormData((prev) => ({
          ...prev,
          nameWithInitial: generateShortName(value),
        }));
      }
    }

    if (name === "nic") {
      const result = validateNIC(value, 16, 21, "Student");
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, nic: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, nic: null }));
        if (result.dob !== null) {
          setFormData((prev) => ({ ...prev, dob: result.dob }));
          setErrors((prev) => ({ ...prev, dob: null }));
        }
      }
    }

    if (name === "dob") {
      const result = ageValidator(value, 6, 21, "Student");
      setErrors((prev) => ({
        ...prev,
        dob: result.isValid ? null : result.error,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameCheck = validateName(formData.fullname);
    const nicCheck = validateNIC(formData.nic, 16, 21, "Student");
    const dobCheck = ageValidator(formData.dob, 6, 21, "Student");
    const dobRequiredCheck = validateRequired(formData.dob, "Date of Birth");
    const birthCertificateCheck = validateRequired(
      formData.birthCertificateNo,
      "Birth Certificate number",
    );
    const typeCheck = validateRequired(formData.studentType, "Student Type");
    const gradeCheck = validateRequired(formData.grade, "Grade");
    const guardianCheck = validateRequired(formData.guardian, "Guardian");
    const addressCheck = validateRequired(formData.address, "Address");
    const prevSchool = validateRequired(
      formData.previousSchoolPirivena,
      "Previous School or Pirivena",
    );

    let ordinationCheck = { isValid: true, error: null };
    let nikayaCheck = { isValid: true, error: null };

    if (String(formData.studentType) === "1") {
      ordinationCheck = validateRequired(
        formData.ordinationDate,
        "Ordination Date",
      );
      nikayaCheck = validateRequired(formData.nikaya, "Nikaya");
    }

    const finalErrors = {
      fullname: nameCheck.isValid ? null : nameCheck.error,
      nic: nicCheck.isValid ? null : nicCheck.error,
      dob: !dobRequiredCheck.isValid
        ? dobRequiredCheck.error
        : dobCheck.isValid
          ? null
          : dobCheck.error,
      studentType: typeCheck.isValid ? null : typeCheck.error,
      grade: gradeCheck.isValid ? null : gradeCheck.error,
      ordinationDate: ordinationCheck.isValid ? null : ordinationCheck.error,
      nikaya: nikayaCheck.isValid ? null : nikayaCheck.error,
      previousSchoolPirivena: prevSchool.isValid ? null : prevSchool.error,
      address: addressCheck.isValid ? null : addressCheck.error,
      guardian: guardianCheck.isValid ? null : guardianCheck.error,
      birthCertificateNo: birthCertificateCheck.isValid
        ? null
        : birthCertificateCheck.error,
    };

    setErrors((prev) => ({ ...prev, ...finalErrors }));

    if (Object.values(finalErrors).some((err) => err !== null)) {
      console.log("Submission stopped. Missing/invalid fields.");
      return;
    }

    const payloadForDatabase = {
      id: formData.id,
      fullname: formData.fullname,
      nameWithInitial: formData.nameWithInitial,
      nic: formData.nic,
      dob: formData.dob,
      birthCertificateNo: formData.birthCertificateNo,
      address: formData.address,
      ordinationDate: formData.ordinationDate || null,
      previousSchoolPirivena: formData.previousSchoolPirivena,
      note: formData.note,
      guardian: { id: parseInt(formData.guardian, 10) },
      studentType: { id: parseInt(formData.studentType, 10) },
      grade: { id: parseInt(formData.grade, 10) },
      studentStatus: { id: parseInt(formData.studentStatus, 10) },
      nikaya: formData.nikaya ? { id: parseInt(formData.nikaya, 10) } : null,
    };

    console.log("Ready for Java:", payloadForDatabase);

    try {
      if (formData.id) {
        const response = await axios.put(
          "http://localhost:8080/student/update",
          payloadForDatabase,
        );
        alert("Student updated successfully!");
        onSuccess();
      } else {
        const response = await axios.post(
          "http://localhost:8080/student/add",
          payloadForDatabase,
        );
        alert("Student added successfully!");
        onSuccess();
      }
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data || error.message || "Failed to save student";
      console.error("Failed to save student:", error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // FIX 1: Change this to isRendered so the animation has time to play!
  if (!isRendered) return null;

  // ==========================================
  // 3. THE UI (BEAUTIFIED HTML)
  // ==========================================

  const inputBaseClass =
    "w-full p-2.5 bg-white/50 border rounded-xl shadow-sm backdrop-blur-sm focus:bg-white/80 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300 text-gray-800 placeholder-gray-400";
  const labelClass = "text-sm font-semibold text-gray-700 mb-1 ml-1";
  const requiredStar = <span className="text-red-500 ml-1">*</span>;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity ${isClosing ? "animate-glass-out" : "animate-glass"}`}
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl p-8 custom-scrollbar ${isClosing ? "animate-modal-out" : "animate-modal"}`}
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-6 tracking-tight">
          Register Pirivena Student
        </h2>

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* --- ZONE 1: SEARCHABLE GUARDIAN --- */}
          <div className="bg-blue-100/30 border border-blue-200/50 rounded-2xl p-5 shadow-inner backdrop-blur-sm flex items-start justify-between">
            <div className="flex flex-col w-2/3 relative">
              <label className="text-sm font-bold text-blue-900 mb-1 ml-1">
                Search & Select Guardian{requiredStar}
              </label>
              <input
                type="text"
                placeholder="Type name or NIC to search..."
                value={guardianSearchText}
                onChange={(e) => {
                  setGuardianSearchText(e.target.value);
                  setIsDropdownOpen(true);
                  if (e.target.value === "") {
                    setFormData((prev) => ({ ...prev, guardian: "" }));
                  }
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className={`${inputBaseClass} ${errors.guardian ? "border-red-400" : "border-blue-200"}`}
              />

              {isDropdownOpen && guardianSearchText.trim() !== "" && (
                <ul className="absolute z-10 top-[75px] left-0 w-full bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                  {filteredGuardians.length > 0 ? (
                    filteredGuardians.map((g) => (
                      <li
                        key={g.id}
                        onClick={() => handleSelectGuardian(g)}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-semibold text-gray-800">
                          {g.fullname}
                        </div>
                        <div className="text-xs text-gray-500 font-medium tracking-wide">
                          NIC: {g.nic}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-gray-500 text-sm italic text-center">
                      No guardian found. Click "Add New"
                    </li>
                  )}
                </ul>
              )}
              {errors.guardian && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.guardian}
                </span>
              )}
            </div>

            <div className="w-1/3 flex justify-end mt-7">
              <button
                type="button"
                onClick={() => {
                  onClose(); // 1. Close the student modal
                  navigate("/guardian"); // 2. Change this to your actual Guardian route!
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                + Add New Guardian
              </button>
            </div>
          </div>

          {/* --- ZONE 2: PERSONAL DETAILS --- */}
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col col-span-2">
              <label className={labelClass}>Full Name{requiredStar}</label>
              <input
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseClass} ${errors.fullname ? "border-red-400" : "border-white/50"}`}
              />
              {errors.fullname && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.fullname}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Name with Initials</label>
              <input
                name="nameWithInitial"
                value={formData.nameWithInitial}
                readOnly
                className="w-full p-2.5 bg-gray-100/50 border border-white/40 rounded-xl shadow-sm backdrop-blur-sm text-gray-600 cursor-not-allowed outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>NIC Number (Optional)</label>
              <input
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseClass} ${errors.nic ? "border-red-400" : "border-white/50"}`}
              />
              {errors.nic && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.nic}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Date of Birth{requiredStar}</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseClass} ${errors.dob ? "border-red-400" : "border-white/50"}`}
              />
              {errors.dob && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.dob}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>
                Birth Certificate No.{requiredStar}
              </label>
              <input
                name="birthCertificateNo"
                value={formData.birthCertificateNo}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseClass} ${errors.birthCertificateNo ? "border-red-400" : "border-white/50"}`}
              />
              {errors.birthCertificateNo && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.birthCertificateNo}
                </span>
              )}
            </div>

            <div className="flex flex-col col-span-2">
              <label className={labelClass}>Address{requiredStar}</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className={`${inputBaseClass}  ${errors.address ? "border-red-400" : "border-white/50"}`}
              />
              {errors.address && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.address}
                </span>
              )}
            </div>
          </div>

          <hr className="border-gray-300/50" />

          {/* --- ZONE 3: MONASTIC DETAILS --- */}
          <div className="flex flex-col w-1/2 pr-2">
            <label className={labelClass}>Student Type{requiredStar}</label>
            <select
              name="studentType"
              value={formData.studentType}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputBaseClass} ${errors.studentType ? "border-red-400" : "border-white/50"}`}
            >
              <option value="">-- Select Type --</option>
              {studentTypesList.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.studentType && (
              <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                {errors.studentType}
              </span>
            )}
          </div>

          {String(formData.studentType) === "1" && (
            <div className="bg-orange-50/40 border border-orange-200/50 backdrop-blur-sm rounded-2xl p-5 shadow-inner flex flex-col gap-4 mb-2 animate-fade-in">
              <h3 className="font-bold text-orange-800 border-b border-orange-200/50 pb-2">
                Monastic Information
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-orange-900 mb-1 ml-1">
                    Nikaya{requiredStar}
                  </label>
                  <select
                    name="nikaya"
                    value={formData.nikaya}
                    onChange={handleChange}
                    className={`${inputBaseClass} ${errors.nikaya ? "border-red-400" : "border-orange-200/50"}`}
                  >
                    <option value="">-- Select Nikaya --</option>
                    {nikayasList.map((nikaya) => (
                      <option key={nikaya.id} value={nikaya.id}>
                        {nikaya.name}
                      </option>
                    ))}
                  </select>
                  {errors.nikaya && (
                    <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                      {errors.nikaya}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-orange-900 mb-1 ml-1">
                    Ordination Date{requiredStar}
                  </label>
                  <input
                    type="date"
                    name="ordinationDate"
                    value={formData.ordinationDate}
                    onChange={handleChange}
                    className={`${inputBaseClass} ${errors.ordinationDate ? "border-red-400" : "border-orange-200/50"}`}
                  />
                  {errors.ordinationDate && (
                    <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                      {errors.ordinationDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- ZONE 4: ACADEMIC DETAILS --- */}
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label className={labelClass}>Grade{requiredStar}</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`${inputBaseClass} ${errors.grade ? "border-red-400" : "border-white/50"}`}
              >
                <option value="">-- Select Grade --</option>
                {gradesList.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
              {errors.grade && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.grade}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Student Status</label>
              <select
                name="studentStatus"
                value={formData.studentStatus}
                onChange={handleChange}
                disabled
                className="w-full p-2.5 bg-gray-100/50 border border-white/40 rounded-xl shadow-sm backdrop-blur-sm text-gray-500 cursor-not-allowed outline-none"
              >
                {studentStatesList.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col col-span-2">
              <label className={labelClass}>
                Previous School / Pirivena{requiredStar}
              </label>
              <input
                name="previousSchoolPirivena"
                value={formData.previousSchoolPirivena}
                onChange={handleChange}
                className={`${inputBaseClass}  ${errors.previousSchoolPirivena ? "border-red-400" : "border-white/50"}`}
              />
              {errors.previousSchoolPirivena && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.previousSchoolPirivena}
                </span>
              )}
            </div>

            <div className="flex flex-col col-span-2">
              <label className={labelClass}>Additional Notes</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="2"
                className={`${inputBaseClass} resize-none border-white/50`}
              />
            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="flex justify-end gap-4 mt-2 pt-5 border-t border-gray-300/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 bg-white/50 border border-white/60 shadow-sm rounded-xl hover:bg-white/80 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-semibold tracking-wide"
            >
              {formData.id ? "Update Student" : "Save Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;
