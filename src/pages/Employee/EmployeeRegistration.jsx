import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  validateMobile,
  validateName,
  generateShortName,
  validateNICAndAge,
  ageValidator,
  validateEmail,
  validateRequired,
} from "../../utils/validation";

const EmployeeRegistration = ({ isModalOpen, onClose, employeeToEdit, onSuccess }) => {
  const [isRendered, setIsRendered] = useState(isModalOpen);
  const [isClosing, setIsClosing] = useState(false);

  // --- 1. THE DROPDOWN STORAGE BINS ---
  const [titlesList, setTitlesList] = useState([]);
  const [designationsList, setDesignationsList] = useState([]);
  const [employeeTypesList, setEmployeeTypesList] = useState([]);
  const [statusList, setStatusList] = useState([]);

  // --- 2. THE FORM BRAIN (Matched to your exact variable names!) ---
  const [formData, setFormData] = useState({
    titleId: "",
    fullName: "",
    nameWithInitial: "",
    nic: "",
    birthdate: "",
    mobile: "",
    email: "",
    address: "",
    emergencyContactPhone: "",
    joinedDate: "",
    designationId: "",
    employeeTypeId: "",
    statusId: "1",
    note: "",
  });

  const [errors, setErrors] = useState({});

  // --- 3. THE MORNING ROUTINE (API CALL) ---
  useEffect(() => {
    if (isModalOpen) {
      setIsRendered(true);
      setIsClosing(false);

      // Reset form on open
      if (employeeToEdit) {
        // If we clicked "Edit", fill the boxes with their data!
        // We use the optional chaining (?.) just in case a field is null in the DB
        setFormData({
          id: employeeToEdit.id,
          titleId: employeeToEdit.title?.id || "",
          fullName: employeeToEdit.fullName || "",
          nameWithInitial: employeeToEdit.nameWithInitial || "",
          nic: employeeToEdit.nic || "",
          birthdate: employeeToEdit.birthdate
            ? employeeToEdit.birthdate.split("T")[0]
            : "", // Strip time from DB date
          mobile: employeeToEdit.mobile || "",
          email: employeeToEdit.email || "",
          address: employeeToEdit.address || "",
          emergencyContactPhone: employeeToEdit.emergencyContactPhone || "",
          joinedDate: employeeToEdit.joinedDate
            ? employeeToEdit.joinedDate.split("T")[0]
            : "",
          designationId: employeeToEdit.designation?.id || "",
          employeeTypeId: employeeToEdit.employeeType?.id || "",
          statusId: employeeToEdit.status?.id || "1",
          note: employeeToEdit.note || "",
        });
      } else {
        // If we clicked "Add New", clear everything out
        setFormData({
          id: null,
          titleId: "",
          fullName: "",
          nameWithInitial: "",
          nic: "",
          birthdate: "",
          mobile: "",
          email: "",
          address: "",
          emergencyContactPhone: "",
          joinedDate: "",
          designationId: "",
          employeeTypeId: "",
          statusId: "1",
          note: "",
        });
      }
      setErrors({});

      const fetchDropdowns = async () => {
        try {
          const [titlesRes, desigRes, typesRes, statusRes] = await Promise.all([
            axios.get("http://localhost:8080/guardian/title"),
            axios.get("http://localhost:8080/employee/designation/all"),
            axios.get("http://localhost:8080/employee/type/all"),
            axios.get("http://localhost:8080/employee/status/all"),
          ]);
          setTitlesList(titlesRes.data);
          setDesignationsList(desigRes.data);
          setEmployeeTypesList(typesRes.data);
          setStatusList(statusRes.data);
        } catch (error) {
          console.error("Failed to load dropdowns:", error);
        }
      };
      fetchDropdowns();
    } else if (isRendered) {
      setIsClosing(true);
      setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 400);
    }
  }, [isModalOpen, isRendered]);

  // --- 4. THE LOGIC & REFLEXES ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      const result = validateName(value);
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, fullName: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, fullName: null }));
        setFormData((prev) => ({
          ...prev,
          nameWithInitial: generateShortName(value),
        }));
      }
    }

    if (name === "nic") {
      const result = validateNICAndAge(value, 18, 60, "Employee");
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, nic: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, nic: null }));
        if (result.dob) {
          setFormData((prev) => ({ ...prev, birthdate: result.dob }));
          setErrors((prev) => ({ ...prev, birthdate: null }));
        }
      }
    }

    if (name === "birthdate") {
      const result = ageValidator(value, 18, 60, "Employee");
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, birthdate: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, birthdate: null }));
      }
    }

    if (name === "mobile" && value.trim() !== "") {
      const result = validateMobile(value);
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, mobile: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, mobile: null }));
        setFormData((prev) => ({ ...prev, mobile: value.replaceAll(" ", "") }));
      }
    }

    if (name === "emergencyContactPhone" && value.trim() !== "") {
      const result = validateMobile(value);
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, emergencyContactPhone: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, emergencyContactPhone: null }));
        setFormData((prev) => ({
          ...prev,
          emergencyContactPhone: value.replaceAll(" ", ""),
        }));
      }
    }

    if (name === "email" && value.trim() !== "") {
      const result = validateEmail(value);
      if (!result.isValid)
        setErrors((prev) => ({ ...prev, email: result.error }));
      else setErrors((prev) => ({ ...prev, email: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Wake up EVERY bouncer
    const nameCheck = validateName(formData.fullName);
    const nicCheck = validateNICAndAge(formData.nic, 18, 60, "Employee");
    const dobCheck = ageValidator(formData.birthdate, 18, 60, "Employee");
    const mobileCheck = validateMobile(formData.mobile);
    const emergencyCheck = formData.emergencyContactPhone
      ? validateMobile(formData.emergencyContactPhone)
      : { isValid: true, error: null };
    const emailCheck = formData.email
      ? validateEmail(formData.email)
      : { isValid: true, error: null };

    const req = {
      title: validateRequired(formData.titleId, "Title"),
      address: validateRequired(formData.address, "Address"),
      joinedDate: validateRequired(formData.joinedDate, "Joined Date"),
      designation: validateRequired(formData.designationId, "Designation"),
      employeeType: validateRequired(
        formData.employeeTypeId,
        "Employment Type",
      ),
    };

    // 2. Collect all reports
    const finalErrors = {
      titleId: req.title.isValid ? null : req.title.error,
      fullName: nameCheck.isValid ? null : nameCheck.error,
      nic: nicCheck.isValid ? null : nicCheck.error,
      birthdate: dobCheck.isValid ? null : dobCheck.error,
      mobile: mobileCheck.isValid ? null : mobileCheck.error,
      email: emailCheck.isValid ? null : emailCheck.error,
      emergencyContactPhone: emergencyCheck.isValid
        ? null
        : emergencyCheck.error,
      address: req.address.isValid ? null : req.address.error,
      joinedDate: req.joinedDate.isValid ? null : req.joinedDate.error,
      designationId: req.designation.isValid ? null : req.designation.error,
      employeeTypeId: req.employeeType.isValid ? null : req.employeeType.error,
    };

    setErrors((prev) => ({ ...prev, ...finalErrors }));

    // 3. Did ANY bouncer find an error?
    if (Object.values(finalErrors).some((err) => err !== null)) {
      console.log("Submission stopped. Missing/invalid fields.");
      return;
    }

    // 4. Format for the Java Backend (Using exact mapping)
    const payloadForDatabase = {
      id: formData.id, // This is null for new employees, but has a number for edits!
      fullName: formData.fullName,
      nameWithInitial: formData.nameWithInitial,
      nic: formData.nic,
      birthdate: formData.birthdate,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      emergencyContactPhone: formData.emergencyContactPhone,
      joinedDate: formData.joinedDate,
      note: formData.note,
      title: { id: parseInt(formData.titleId, 10) },
      designation: { id: parseInt(formData.designationId, 10) },
      employeeType: { id: parseInt(formData.employeeTypeId, 10) },
      status: { id: parseInt(formData.statusId, 10) },
    };

    console.log("Ready for Java:", payloadForDatabase);

    try {
      // THE TRAFFIC COP: Which way do we send the data?
      if (formData.id) {
        // If we have an ID, we are UPDATING
        await axios.put(
          "http://localhost:8080/employee/update",
          payloadForDatabase,
        );
        console.log("Update successful!");
        onSuccess();
      } else {
        // If we don't have an ID, we are ADDING
        await axios.post(
          "http://localhost:8080/employee/add",
          payloadForDatabase,
        );
        console.log("Add successful!");
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Failed to save employee:", error);
      // Optional: If you want to show the duplicate error to the user
      if (error.response && error.response.data) {
        alert("Server Error: " + error.response.data);
      }
    }
  };

  if (!isRendered) return null;

  // --- 5. THE UI (BEAUTIFIED HTML) ---
  const inputBaseClass =
    "w-full p-2.5 bg-white/50 border rounded-xl shadow-sm backdrop-blur-sm focus:bg-white/80 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300 text-gray-800 placeholder-gray-400";
  const labelClass = "text-sm font-semibold text-gray-700 mb-1 ml-1";
  const requiredStar = <span className="text-red-500 ml-1">*</span>;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity ${isClosing ? "animate-glass-out" : "animate-glass"}`}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl p-8 custom-scrollbar ${isClosing ? "animate-modal-out" : "animate-modal"}`}
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-6 tracking-tight">
          Register Staff Member
        </h2>

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* --- ZONE 1: IDENTITY --- */}
          <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-5 shadow-inner">
            <h3 className="font-bold text-blue-800 border-b border-blue-200/50 pb-2 mb-4">
              Identity Details
            </h3>
            <div className="grid grid-cols-12 gap-5">
              <div className="flex flex-col col-span-3">
                <label className={labelClass}>Title{requiredStar}</label>
                <select
                  name="titleId"
                  value={formData.titleId}
                  onChange={handleChange}
                  className={`${inputBaseClass} ${errors.titleId ? "border-red-400" : "border-white/50"}`}
                >
                  <option value="">-- Select --</option>
                  {titlesList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.titleId && (
                  <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                    {errors.titleId}
                  </span>
                )}
              </div>

              <div className="flex flex-col col-span-9">
                <label className={labelClass}>Full Name{requiredStar}</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBaseClass} ${errors.fullName ? "border-red-400" : "border-white/50"}`}
                />
                {errors.fullName && (
                  <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div className="flex flex-col col-span-5">
                <label className={labelClass}>Name with Initials</label>
                <input
                  name="nameWithInitial"
                  value={formData.nameWithInitial}
                  readOnly
                  className="w-full p-2.5 bg-gray-100/50 border border-white/40 rounded-xl shadow-sm text-gray-500 cursor-not-allowed outline-none"
                />
              </div>

              <div className="flex flex-col col-span-4">
                <label className={labelClass}>NIC Number{requiredStar}</label>
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

              <div className="flex flex-col col-span-3">
                <label className={labelClass}>
                  Date of Birth{requiredStar}
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBaseClass} ${errors.birthdate ? "border-red-400" : "border-white/50"}`}
                />
                {errors.birthdate && (
                  <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                    {errors.birthdate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* --- ZONE 2: CONTACT & EMERGENCY --- */}
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label className={labelClass}>Mobile Number{requiredStar}</label>
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseClass} ${errors.mobile ? "border-red-400" : "border-white/50"}`}
              />
              {errors.mobile && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.mobile}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseClass} ${errors.email ? "border-red-400" : "border-white/50"}`}
              />
              {errors.email && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col col-span-2">
              <label className={labelClass}>
                Residential Address{requiredStar}
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                rows="2"
                className={`${inputBaseClass} resize-none ${errors.address ? "border-red-400" : "border-white/50"}`}
              />
              {errors.address && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.address}
                </span>
              )}
            </div>

            <div className="flex flex-col col-span-2 md:col-span-1">
              <label className={labelClass}>Emergency Contact Phone</label>
              <input
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 0712345678"
                className={`${inputBaseClass} ${errors.emergencyContactPhone ? "border-red-400" : "border-white/50"}`}
              />
              {errors.emergencyContactPhone && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.emergencyContactPhone}
                </span>
              )}
            </div>
          </div>

          <hr className="border-gray-300/50" />

          {/* --- ZONE 3: EMPLOYMENT DETAILS --- */}
          <div className="grid grid-cols-3 gap-5">
            <div className="flex flex-col">
              <label className={labelClass}>Designation{requiredStar}</label>
              <select
                name="designationId"
                value={formData.designationId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseClass} ${errors.designationId ? "border-red-400" : "border-white/50"}`}
              >
                <option value="">-- Select --</option>
                {designationsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.designationId && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.designationId}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>
                Employment Type{requiredStar}
              </label>
              <select
                name="employeeTypeId"
                value={formData.employeeTypeId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseClass} ${errors.employeeTypeId ? "border-red-400" : "border-white/50"}`}
              >
                <option value="">-- Select --</option>
                {employeeTypesList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.employeeTypeId && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.employeeTypeId}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Joined Date{requiredStar}</label>
              <input
                type="date"
                name="joinedDate"
                value={formData.joinedDate}
                onChange={handleChange}
                className={`${inputBaseClass} ${errors.joinedDate ? "border-red-400" : "border-white/50"}`}
              />
              {errors.joinedDate && (
                <span className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.joinedDate}
                </span>
              )}
            </div>
          </div>

          {/* --- ZONE 4: NOTES & STATUS --- */}
          <div className="grid grid-cols-3 gap-5">
            <div className="flex flex-col col-span-2">
              <label className={labelClass}>Additional Notes</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="1"
                className={`${inputBaseClass} resize-none`}
              />
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>System Status</label>
              <select
                name="statusId"
                value={formData.statusId}
                onChange={handleChange}
                disabled
                className="w-full p-2.5 bg-gray-100/50 border border-white/40 rounded-xl shadow-sm text-gray-500 cursor-not-allowed outline-none"
              >
                {statusList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
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
              {formData.id ? "Update Employee" : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegistration;
