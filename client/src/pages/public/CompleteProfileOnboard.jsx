import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LeftPanel from '../../components/auth_page/LeftPannel';
import TrustLables from '../../components/auth_page/TrustLables';
import {
    User,
    UserPlus,
    Mail,
    Plus,
    Trash2,
    GraduationCap,
    Briefcase,
    MapPin,
    Code,
    ShieldCheck,
    Users,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Calendar,
    BriefcaseBusiness
} from 'lucide-react';

const CompleteProfile = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState(1); // 1: Personal, 2: Education, 3: Experience, 4: Skills

    // Form states
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [headline, setHeadline] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('India');
    const [pincode, setPincode] = useState('');

    // Dynamic Lists
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');

    const [education, setEducation] = useState([]);
    const [exp, setExperience] = useState([]);

    // Temporary items to add
    const [newEdu, setNewEdu] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        graduationYear: ''
    });

    const [newExp, setNewExp] = useState({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        isCurrent: false
    });

    const authSteps = [
        { title: "Register", icon: <UserPlus size={16} /> },
        { title: "Verify Email", icon: <Mail size={16} /> },
        { title: "Complete Profile", icon: <User size={16} /> }
    ];

    // Skill Handlers
    const addSkill = (e) => {
        e?.preventDefault();
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
            setSkillInput('');
        }
    };

    const removeSkill = (indexToRemove) => {
        setSkills(skills.filter((_, idx) => idx !== indexToRemove));
    };

    // Education Handlers
    const addEducation = (e) => {
        e.preventDefault();
        if (!newEdu.institution || !newEdu.degree) {
            toast.error("Institution and Degree are required.");
            return;
        }
        setEducation([...education, { ...newEdu, graduationYear: parseInt(newEdu.graduationYear) || undefined }]);
        setNewEdu({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
        toast.success("Education record added!");
    };

    const removeEducation = (index) => {
        setEducation(education.filter((_, idx) => idx !== index));
    };

    // Experience Handlers
    const addExperience = (e) => {
        e.preventDefault();
        if (!newExp.company || !newExp.position) {
            toast.error("Company and Position are required.");
            return;
        }
        setExperience([...exp, { ...newExp }]);
        setNewExp({ company: '', position: '', startDate: '', endDate: '', isCurrent: false });
        toast.success("Experience record added!");
    };

    const removeExperience = (index) => {
        setExperience(exp.filter((_, idx) => idx !== index));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !city || !state) {
            toast.error("Please complete the Basic Info & Location sections (First Name, Last Name, City, State are required).");
            setActiveTab(1);
            return;
        }

        setIsSubmitting(true);
        const token = sessionStorage.getItem("accessToken");

        const payload = {
            firstName,
            lastName,
            proffesionalHeadLine: headline,
            location: {
                address,
                city,
                state,
                country,
                pincode
            },
            skills,
            education,
            experience: exp
        };

        try {
            const response = await axios.post("http://localhost:8000/api/profile/create-profile", payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            toast.success(response.data.message || "Profile completed successfully!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Failed to complete profile. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextTab = (e) => {
        e.preventDefault();
        if (activeTab === 1) {
            if (!firstName || !lastName || !city || !state) {
                toast.error("First Name, Last Name, City, and State are required.");
                return;
            }
        }
        setActiveTab((prev) => prev + 1);
    };

    const prevTab = (e) => {
        e.preventDefault();
        setActiveTab((prev) => prev - 1);
    };

    return (
        <div className="min-h-screen page-shell flex">
            {/* Left Panel */}
            <div className="hidden lg:flex w-[32%] bg-[#004AC6] text-white">
                <LeftPanel
                    title="Setup Your Profile"
                    subtitle="Stand out in your community. Fill in details so peers, students, and recruiters can find you."
                    steps={authSteps}
                    currentStep={3}
                />
            </div>

            {/* Right Form Container */}
            <div className="flex-1 flex flex-col justify-between py-10 px-6 md:px-16 overflow-y-auto max-h-screen">
                <div className="w-full max-w-2xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#004AC6] bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                                <Sparkles size={12} /> Step {activeTab} of 4
                            </span>
                            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Complete Profile</h1>
                        </div>
                    </div>

                    {/* Stepper Tabs */}
                    <div className="flex justify-between items-center page-card p-2 rounded-[20px]">
                        {[
                            { step: 1, label: 'Basic Info', icon: <User size={16} /> },
                            { step: 2, label: 'Education', icon: <GraduationCap size={16} /> },
                            { step: 3, label: 'Experience', icon: <Briefcase size={16} /> },
                            { step: 4, label: 'Skills', icon: <Code size={16} /> }
                        ].map((t) => (
                            <button
                                key={t.step}
                                onClick={() => {
                                    if (t.step > 1 && (!firstName || !lastName || !city || !state)) {
                                        toast.error("Please fill out required fields in Basic Info first.");
                                        return;
                                    }
                                    setActiveTab(t.step);
                                }}
                                className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 py-2.5 px-1 md:px-3 rounded-lg text-xs font-semibold transition ${activeTab === t.step
                                    ? 'bg-[#004AC6] text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {t.icon}
                                <span className="hidden md:inline">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="page-card rounded-3xl p-8">
                        {/* Tab 1: Personal Details */}
                        {activeTab === 1 && (
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <User className="text-[#004AC6]" size={20} /> Personal Information
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Let the community know who you are.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name *</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="mt-1.5 block w-full h-12 px-4 rounded-xl border border-gray-300 shadow-sm focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="mt-1.5 block w-full h-12 px-4 rounded-xl border border-gray-300 shadow-sm focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Professional Headline</label>
                                    <input
                                        type="text"
                                        value={headline}
                                        onChange={(e) => setHeadline(e.target.value)}
                                        className="mt-1.5 block w-full h-12 px-4 rounded-xl border border-gray-300 shadow-sm focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                                        placeholder="e.g. Software Architect | Ex-Microsoft | Tech Mentor"
                                    />
                                </div>

                                <div className="border-b pt-4 pb-2">
                                    <h4 className="text-md font-bold text-gray-800 flex items-center gap-2">
                                        <MapPin className="text-[#004AC6]" size={18} /> Location Details
                                    </h4>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="mt-1.5 block w-full h-12 px-4 rounded-xl border border-gray-300 shadow-sm focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                                        placeholder="Apartment, suite, unit, building, street, etc."
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">City *</label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="mt-1.5 block w-full h-12 px-4 rounded-xl border border-gray-300 shadow-sm focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                                            placeholder="e.g. Bengaluru"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">State *</label>
                                        <input
                                            type="text"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="mt-1.5 block w-full h-12 px-4 rounded-xl border border-gray-300 shadow-sm focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                                            placeholder="e.g. Karnataka"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Pincode</label>
                                        <input
                                            type="text"
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            className="mt-1.5 block w-full h-12 px-4 rounded-xl border border-gray-300 shadow-sm focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                                            placeholder="560001"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Education Details */}
                        {activeTab === 2 && (
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <GraduationCap className="text-[#004AC6]" size={22} /> Education History
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Add your degree, university, or college details.</p>
                                </div>

                                {/* List of Added Education */}
                                {education.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">Added Schools</label>
                                        <div className="divide-y border rounded-xl overflow-hidden bg-gray-50">
                                            {education.map((edu, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-4 hover:bg-white transition">
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-sm">{edu.institution}</h4>
                                                        <p className="text-gray-600 text-xs mt-0.5">{edu.degree} in {edu.fieldOfStudy}</p>
                                                        {edu.graduationYear && <span className="inline-block bg-blue-50 text-[#004AC6] text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5">Class of {edu.graduationYear}</span>}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEducation(idx)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add Education Form Card */}
                                <div className="p-5 border border-blue-100 bg-blue-50/20 rounded-xl space-y-4">
                                    <h4 className="text-sm font-bold text-[#004AC6] flex items-center gap-1.5">
                                        <Plus size={16} /> Add Education Record
                                    </h4>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600">Institution Name</label>
                                        <input
                                            type="text"
                                            value={newEdu.institution}
                                            onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                                            className="mt-1 block w-full h-11 px-3 bg-white rounded-lg border border-gray-300 shadow-sm focus:border-[#004AC6] outline-none text-sm"
                                            placeholder="e.g. Stanford University"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Degree</label>
                                            <input
                                                type="text"
                                                value={newEdu.degree}
                                                onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                                                className="mt-1 block w-full h-11 px-3 bg-white rounded-lg border border-gray-300 shadow-sm focus:border-[#004AC6] outline-none text-sm"
                                                placeholder="e.g. M.S."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Field of Study</label>
                                            <input
                                                type="text"
                                                value={newEdu.fieldOfStudy}
                                                onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                                                className="mt-1 block w-full h-11 px-3 bg-white rounded-lg border border-gray-300 shadow-sm focus:border-[#004AC6] outline-none text-sm"
                                                placeholder="e.g. Computer Science"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Graduation Year</label>
                                            <input
                                                type="number"
                                                value={newEdu.graduationYear}
                                                onChange={(e) => setNewEdu({ ...newEdu, graduationYear: e.target.value })}
                                                className="mt-1 block w-full h-11 px-3 bg-white rounded-lg border border-gray-300 shadow-sm focus:border-[#004AC6] outline-none text-sm"
                                                placeholder="e.g. 2026"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addEducation}
                                        className="w-full h-10 bg-[#004AC6] hover:bg-[#0038A8] text-white font-semibold rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-sm"
                                    >
                                        <Plus size={14} /> Add Record to List
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Experience Details */}
                        {activeTab === 3 && (
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Briefcase className="text-[#004AC6]" size={20} /> Work Experience
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Add jobs, internships, or freelance work you've done.</p>
                                </div>

                                {/* List of Added Experience */}
                                {exp.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">Added Work Experience</label>
                                        <div className="divide-y border rounded-xl overflow-hidden bg-gray-50">
                                            {exp.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-4 hover:bg-white transition">
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-sm">{item.position}</h4>
                                                        <p className="text-gray-600 text-xs mt-0.5">{item.company}</p>
                                                        <p className="text-gray-400 text-[10px] mt-1.5 flex items-center gap-1">
                                                            <Calendar size={12} /> {item.startDate} &mdash; {item.isCurrent ? 'Present' : item.endDate}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExperience(idx)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add Experience Form Card */}
                                <div className="p-5 border border-blue-100 bg-blue-50/20 rounded-xl space-y-4">
                                    <h4 className="text-sm font-bold text-[#004AC6] flex items-center gap-1.5">
                                        <Plus size={16} /> Add Experience Record
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Company Name</label>
                                            <input
                                                type="text"
                                                value={newExp.company}
                                                onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                                                className="mt-1 block w-full h-11 px-3 bg-white rounded-lg border border-gray-300 shadow-sm focus:border-[#004AC6] outline-none text-sm"
                                                placeholder="e.g. Google"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Position / Title</label>
                                            <input
                                                type="text"
                                                value={newExp.position}
                                                onChange={(e) => setNewExp({ ...newExp, position: e.target.value })}
                                                className="mt-1 block w-full h-11 px-3 bg-white rounded-lg border border-gray-300 shadow-sm focus:border-[#004AC6] outline-none text-sm"
                                                placeholder="e.g. Senior Product Designer"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Start Date</label>
                                            <input
                                                type="date"
                                                value={newExp.startDate}
                                                onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                                                className="mt-1 block w-full h-11 px-3 bg-white rounded-lg border border-gray-300 shadow-sm focus:border-[#004AC6] outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">End Date</label>
                                            <input
                                                type="date"
                                                value={newExp.endDate}
                                                disabled={newExp.isCurrent}
                                                onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                                                className="mt-1 block w-full h-11 px-3 bg-white rounded-lg border border-gray-300 shadow-sm focus:border-[#004AC6] outline-none text-sm disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isCurrent"
                                            checked={newExp.isCurrent}
                                            onChange={(e) => setNewExp({ ...newExp, isCurrent: e.target.checked, endDate: e.target.checked ? '' : newExp.endDate })}
                                            className="h-4 w-4 rounded border-gray-300 text-[#004AC6] focus:ring-[#004AC6]"
                                        />
                                        <label htmlFor="isCurrent" className="text-xs font-medium text-gray-600">I currently work here</label>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addExperience}
                                        className="w-full h-10 bg-[#004AC6] hover:bg-[#0038A8] text-white font-semibold rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-sm"
                                    >
                                        <Plus size={14} /> Add Record to List
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Skills Details */}
                        {activeTab === 4 && (
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Code className="text-[#004AC6]" size={20} /> Skills & Expertise
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Specify technical skills, tools, or areas of expertise.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">Add Skills</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addSkill();
                                                }
                                            }}
                                            className="flex-1 h-12 px-4 rounded-xl border border-gray-300 shadow-sm focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                                            placeholder="Type a skill (e.g. React) and press Enter or Add"
                                        />
                                        <button
                                            type="button"
                                            onClick={addSkill}
                                            className="px-5 bg-[#004AC6] text-white font-bold rounded-xl hover:bg-[#0038A8] transition flex items-center justify-center gap-1"
                                        >
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>

                                    {skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-50 text-[#004AC6] text-sm font-semibold border border-blue-100"
                                                >
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSkill(idx)}
                                                        className="text-blue-400 hover:text-[#0038A8] focus:outline-none text-base"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 border border-dashed rounded-2xl bg-slate-100/70">
                                            <Code size={30} className="mx-auto text-gray-400" />
                                            <p className="text-xs text-gray-600 mt-2">No skills added yet. Add skills to help others find you.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="flex gap-4 pt-4">
                        {activeTab > 1 ? (
                            <button
                                type="button"
                                onClick={prevTab}
                                className="h-12 px-6 rounded-xl border border-gray-300 font-semibold text-gray-700 bg-white hover:bg-gray-50 transition flex items-center justify-center gap-2"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>
                        ) : (
                            <div className="w-0" />
                        )}

                        {activeTab < 4 ? (
                            <button
                                type="button"
                                onClick={nextTab}
                                className="h-12 flex-1 rounded-xl bg-[#004AC6] hover:bg-[#0038A8] text-white font-semibold transition flex items-center justify-center gap-2 shadow-sm"
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className="h-12 flex-1 rounded-xl bg-[#004AC6] hover:bg-[#0038A8] text-white font-semibold transition flex items-center justify-center gap-2 shadow-md disabled:opacity-75"
                            >
                                {isSubmitting ? "Finishing..." : "Complete & Go to Dashboard"} <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Labels */}
                <div className="w-full max-w-2xl mx-auto mt-8 pt-6 border-t">
                    <div className="flex flex-wrap justify-center gap-6">
                        <TrustLables icon={<ShieldCheck size={14} />} text="End-to-End Encryption" />
                        <TrustLables icon={<Users size={14} />} text="Verified Campus Profiles" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;