import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
    User,
    Mail,
    MapPin,
    GraduationCap,
    Briefcase,
    Code,
    Plus,
    Trash2,
    Camera,
    MessageSquare,
    Handshake,
    Sparkles,
    Calendar,
    Edit2,
    Save,
    X,
    BriefcaseBusiness
} from 'lucide-react';

const UserProfile = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    // Editing States (For own profile)
    const [isEditingBasic, setIsEditingBasic] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [headline, setHeadline] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('India');
    const [pincode, setPincode] = useState('');

    // Dynamic Lists (Own profile inputs)
    const [skillInput, setSkillInput] = useState('');
    const [newEdu, setNewEdu] = useState({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
    const [editEdu, setEditEdu] = useState(null);
    const [newExp, setNewExp] = useState({ company: '', position: '', startDate: '', endDate: '', isCurrent: false });
    const [editExp, setEditExp] = useState(null);

    // Modals/expanders for additions
    const [showAddEdu, setShowAddEdu] = useState(false);
    const [showAddExp, setShowAddExp] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('accessToken');
    const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

    const fetchProfile = async () => {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const isViewingOwnProfile = !userId || userId === currentUser?._id;
        setIsOwnProfile(isViewingOwnProfile);

        try {
            let response;
            // Determine if viewing own profile or someone else's
            if (isViewingOwnProfile) {
                response = await axios.get('http://localhost:8000/api/profile/get-profile', { headers });
            } else {
                response = await axios.get(`http://localhost:8000/api/profile/get-profile/${userId}`, { headers });
            }

            if (response.data?.profile) {
                const p = response.data.profile;
                setProfile(p);

                // Prepopulate basic edit states
                setFirstName(p.firstName || '');
                setLastName(p.lastName || '');
                setHeadline(p.proffesionalHeadLine || '');
                setAddress(p.location?.address || '');
                setCity(p.location?.city || '');
                setState(p.location?.state || '');
                setCountry(p.location?.country || 'India');
                setPincode(p.location?.pincode || '');
            }
        } catch (err) {
            const status = err.response?.status;
            if (status === 404) {
                setProfile(null);
                if (isViewingOwnProfile) {
                    toast.warning('Profile not created yet. Complete your profile to continue.');
                }
            } else {
                console.error('Error fetching profile details', err);
                toast.error('Unable to fetch profile details.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            return;
        }
        fetchProfile();
    }, [userId, token]);

    const handleVerifyMember = async () => {
        if (!profile?.userId?._id) return;

        try {
            const response = await axios.post(`http://localhost:8000/api/auth/verify-member/${profile.userId._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile(prev => prev ? {
                ...prev,
                userId: {
                    ...prev.userId,
                    ...response.data.user,
                    _id: response.data.user._id
                }
            } : prev);
            toast.success(response.data.message || 'Member verified successfully.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to verify member.');
        }
    };

    // Handle Profile Image Upload
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file.');
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await axios.post('http://localhost:8000/api/profile/set-profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Profile picture updated!');
            setProfile(prev => ({ ...prev, profilePicture: response.data.profile?.profilePicture }));
        } catch (err) {
            toast.error('Failed to upload image.');
        }
    };

    // Save Basic Info
    const handleSaveBasic = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !city || !state) {
            toast.error('First Name, Last Name, City, and State are required.');
            return;
        }

        setIsUpdating(true);
        try {
            const response = await axios.put('http://localhost:8000/api/profile/update-profile', {
                firstName,
                lastName,
                proffesionalHeadLine: headline,
                location: { address, city, state, country, pincode }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile(response.data.profile);
            setIsEditingBasic(false);
            toast.success('Basic profile updated!');
        } catch (err) {
            toast.error('Failed to update basic profile.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Add Skill
    const handleAddSkill = async (e) => {
        e.preventDefault();
        const skill = skillInput.trim();
        if (!skill) return;

        try {
            const response = await axios.post('http://localhost:8000/api/profile/add-skill', { skill }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.profile);
            setSkillInput('');
            toast.success(`Skill '${skill}' added!`);
        } catch (err) {
            toast.error('Failed to add skill.');
        }
    };

    // Remove Skill
    const handleRemoveSkill = async (skill) => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/profile/remove-skill/${encodeURIComponent(skill)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.profile);
            toast.success(`Skill '${skill}' removed.`);
        } catch (err) {
            toast.error('Failed to remove skill.');
        }
    };

    // Add Education
    const handleAddEducation = async (e) => {
        e.preventDefault();
        if (!newEdu.institution || !newEdu.degree) {
            toast.error('Institution and Degree are required.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/profile/add-education', {
                ...newEdu,
                graduationYear: parseInt(newEdu.graduationYear) || undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.profile);
            setNewEdu({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
            setShowAddEdu(false);
            toast.success('Education record added!');
        } catch (err) {
            toast.error('Failed to add education.');
        }
    };

    const handleSaveEducation = async (e) => {
        e.preventDefault();
        if (!editEdu?.institution || !editEdu?.degree) {
            toast.error('Institution and Degree are required.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:8000/api/profile/update-education/${editEdu._id}`, {
                institution: editEdu.institution,
                degree: editEdu.degree,
                fieldOfStudy: editEdu.fieldOfStudy,
                graduationYear: parseInt(editEdu.graduationYear) || undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.profile);
            setEditEdu(null);
            toast.success('Education record updated!');
        } catch (err) {
            toast.error('Failed to update education.');
        }
    };

    // Remove Education
    const handleRemoveEducation = async (eduId) => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/profile/delete-education/${eduId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.profile);
            toast.success('Education record removed.');
        } catch (err) {
            toast.error('Failed to delete education.');
        }
    };

    // Add Experience
    const handleAddExperience = async (e) => {
        e.preventDefault();
        if (!newExp.company || !newExp.position) {
            toast.error('Company and Position are required.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/profile/add-experience', newExp, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.profile);
            setNewExp({ company: '', position: '', startDate: '', endDate: '', isCurrent: false });
            setShowAddExp(false);
            toast.success('Experience record added!');
        } catch (err) {
            toast.error('Failed to add experience.');
        }
    };

    const handleSaveExperience = async (e) => {
        e.preventDefault();
        if (!editExp?.company || !editExp?.position) {
            toast.error('Company and Position are required.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:8000/api/profile/update-experience/${editExp._id}`, editExp, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.profile);
            setEditExp(null);
            toast.success('Experience record updated!');
        } catch (err) {
            toast.error('Failed to update experience.');
        }
    };

    // Remove Experience
    const handleRemoveExperience = async (expId) => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/profile/delete-experience/${expId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.profile);
            toast.success('Experience record removed.');
        } catch (err) {
            toast.error('Failed to delete experience.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-[#004AC6] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-gray-500">Retrieving profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20 page-card rounded-3xl shadow-sm max-w-xl mx-auto mt-10">
                <User size={40} className="mx-auto text-gray-300" />
                <p className="text-sm font-semibold text-gray-500 mt-3">
                    {isOwnProfile ? 'Your profile is not created yet.' : 'Profile not found.'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    {isOwnProfile ? 'Finish onboarding so your profile can be viewed and shared.' : 'This member has not completed their profile yet.'}
                </p>
                {isOwnProfile ? (
                    <div className="mt-4 flex justify-center gap-3">
                        <Link to="/complete-profile" className="text-xs font-bold text-[#004AC6] hover:underline">
                            Complete Profile
                        </Link>
                        <Link to="/dashboard" className="text-xs font-bold text-gray-600 hover:underline">
                            Return to Dashboard
                        </Link>
                    </div>
                ) : (
                    <Link to="/dashboard" className="text-xs font-bold text-[#004AC6] hover:underline mt-3 inline-block">
                        Return to Dashboard
                    </Link>
                )}
            </div>
        );
    }

    const name = `${profile.firstName} ${profile.lastName}`;
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
            {/* Header Profile Cover Block */}
            <div className="page-card rounded-[28px] overflow-hidden">
                <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600 relative" />
                <div className="px-6 pb-6 relative flex flex-col md:flex-row items-center md:items-end md:justify-between gap-6 -mt-12">
                    {/* User Profile Picture & details */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
                        <div className="relative group">
                            {profile.profilePicture ? (
                                <img
                                    src={profile.profilePicture}
                                    alt={name}
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-blue-50 text-[#004AC6] flex items-center justify-center font-bold text-3xl border-4 border-white shadow-lg">
                                    {initials}
                                </div>
                            )}

                            {isOwnProfile && (
                                <label className="absolute bottom-1 right-1 p-2 bg-[#004AC6] text-white rounded-full cursor-pointer shadow-md hover:bg-[#0038A8] transition">
                                    <Camera size={14} />
                                    <input type="file" onChange={handleImageChange} accept="image/*" hidden />
                                </label>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <h1 className="text-2xl font-extrabold text-gray-900">{name}</h1>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${profile.userId?.role === 'alumni' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    {profile.userId?.role || 'Member'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 font-semibold">{profile.proffesionalHeadLine || 'No headline set'}</p>
                            <p className="text-[10px] text-gray-400 font-semibold flex items-center justify-center md:justify-start gap-1">
                                <MapPin size={12} /> {profile.location?.city}, {profile.location?.state}, {profile.location?.country}
                            </p>
                        </div>
                    </div>

                    {/* Contact Actions for Others */}
                    {!isOwnProfile && (
                        <div className="flex gap-2">
                            <Link
                                to={`/messages?chat=${profile.userId?._id || profile.userId}`}
                                className="h-10 px-4 bg-[#004AC6] hover:bg-[#0038A8] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                            >
                                <MessageSquare size={14} /> Send Message
                            </Link>
                            <Link
                                to={`/mentorship?request=${profile.userId?._id || profile.userId}`}
                                className="h-10 px-4 bg-blue-50 hover:bg-blue-100 text-[#004AC6] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                            >
                                <Handshake size={14} /> Request Mentorship
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Grid for Detailed Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Basic Info & Skills */}
                <div className="col-span-1 space-y-6">
                    {/* Basic Info Editor Card */}
                    <div className="page-card rounded-3xl shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <User size={16} className="text-[#004AC6]" /> About & Details
                            </h3>
                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsEditingBasic(!isEditingBasic)}
                                    className="text-[#004AC6] hover:underline text-xs font-semibold flex items-center gap-1"
                                >
                                    {isEditingBasic ? <X size={14} /> : <Edit2 size={12} />}
                                    {isEditingBasic ? 'Cancel' : 'Edit'}
                                </button>
                            )}
                        </div>

                        {isEditingBasic ? (
                            <form onSubmit={handleSaveBasic} className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="mt-1 w-full border rounded-lg h-9 px-3 text-xs outline-none focus:border-[#004AC6]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="mt-1 w-full border rounded-lg h-9 px-3 text-xs outline-none focus:border-[#004AC6]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Headline</label>
                                    <input
                                        type="text"
                                        value={headline}
                                        onChange={(e) => setHeadline(e.target.value)}
                                        className="mt-1 w-full border rounded-lg h-9 px-3 text-xs outline-none focus:border-[#004AC6]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">City</label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="mt-1 w-full border rounded-lg h-9 px-3 text-xs outline-none focus:border-[#004AC6]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">State</label>
                                        <input
                                            type="text"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="mt-1 w-full border rounded-lg h-9 px-3 text-xs outline-none focus:border-[#004AC6]"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="w-full h-9 bg-[#004AC6] hover:bg-[#0038A8] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-70"
                                >
                                    <Save size={14} /> {isUpdating ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-3.5 text-xs">
                                <div className="space-y-1">
                                    <span className="text-gray-400 font-medium">Email Address</span>
                                    <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                        <Mail size={14} className="text-gray-400" />
                                        {profile.userId?.email || currentUser.email || 'Private'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-400 font-medium">Address</span>
                                    <p className="font-bold text-gray-800">
                                        {profile.location?.address ? `${profile.location.address}, ` : ''}
                                        {profile.location?.city}, {profile.location?.state}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-400 font-medium">Verification Status</span>
                                    <div className="flex items-center gap-2">
                                        <p className={`font-bold flex items-center gap-1 capitalize ${profile.userId?.AccountStatus === 'verified' || profile.userId?.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            <Sparkles size={14} />
                                            {profile.userId?.AccountStatus || (profile.userId?.emailVerified ? 'Verified' : 'Pending Verification')}
                                        </p>
                                        {isAdmin && !profile.userId?.emailVerified && (
                                            <button
                                                type="button"
                                                onClick={handleVerifyMember}
                                                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#004AC6] text-white hover:bg-[#0038A8]"
                                            >
                                                Verify Member
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Skills Tag Management */}
                    <div className="page-card rounded-3xl shadow-sm p-6 space-y-4">
                        <div className="border-b pb-2 flex items-center gap-2">
                            <Code size={16} className="text-[#004AC6]" />
                            <h3 className="text-sm font-bold text-gray-900">Skills</h3>
                        </div>

                        {isOwnProfile && (
                            <form onSubmit={handleAddSkill} className="flex gap-2">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    placeholder="Add skill..."
                                    className="flex-1 border rounded-lg h-9 px-3 text-xs outline-none focus:border-[#004AC6]"
                                />
                                <button type="submit" className="px-3 bg-[#004AC6] text-white rounded-lg text-xs font-bold hover:bg-[#0038A8]">
                                    Add
                                </button>
                            </form>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                            {profile.skills && profile.skills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#004AC6] text-[10px] font-bold border border-blue-100"
                                >
                                    {skill}
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="text-blue-400 hover:text-red-500 font-bold"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </span>
                            ))}
                            {(!profile.skills || profile.skills.length === 0) && (
                                <p className="text-xs text-gray-400 italic">No skills listed.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Education & Work Experience */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    {/* Education Timeline */}
                    <div className="page-card rounded-3xl shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <GraduationCap size={18} className="text-[#004AC6]" /> Education
                            </h3>
                            {isOwnProfile && (
                                <button
                                    onClick={() => setShowAddEdu(!showAddEdu)}
                                    className="text-[#004AC6] hover:underline text-xs font-semibold flex items-center gap-1"
                                >
                                    {showAddEdu ? <X size={14} /> : <Plus size={14} />}
                                    {showAddEdu ? 'Close' : 'Add'}
                                </button>
                            )}
                        </div>

                        {/* Add Education Modal Form */}
                        {showAddEdu && (
                            <form onSubmit={handleAddEducation} className="p-4 border border-blue-100 bg-blue-50/20 rounded-xl space-y-3">
                                <h4 className="text-xs font-bold text-[#004AC6]">New Academic Record</h4>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Institution (e.g. Stanford University)"
                                        value={newEdu.institution}
                                        onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                                        className="w-full border rounded-lg h-9 px-3 text-xs bg-white outline-none focus:border-[#004AC6]"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Degree (B.S.)"
                                        value={newEdu.degree}
                                        onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                                        className="col-span-1 border rounded-lg h-9 px-3 text-xs bg-white outline-none focus:border-[#004AC6]"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Field (CS)"
                                        value={newEdu.fieldOfStudy}
                                        onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                                        className="col-span-1 border rounded-lg h-9 px-3 text-xs bg-white outline-none focus:border-[#004AC6]"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Graduation Year"
                                        value={newEdu.graduationYear}
                                        onChange={(e) => setNewEdu({ ...newEdu, graduationYear: e.target.value })}
                                        className="col-span-1 border rounded-lg h-9 px-3 text-xs bg-white outline-none focus:border-[#004AC6]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full h-8 bg-[#004AC6] text-white font-bold rounded-lg text-xs hover:bg-[#0038A8] transition shadow-sm"
                                >
                                    Save Record
                                </button>
                            </form>
                        )}

                        {/* List */}
                        <div className="space-y-4 relative pl-3 border-l-2 border-blue-100/60 ml-2">
                            {profile.education && profile.education.map((edu) => (
                                <div key={edu._id} className="relative group hover:bg-gray-50/50 p-2.5 rounded-lg transition border border-transparent hover:border-gray-100">
                                    <div className="absolute -left-4.75 top-4 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#004AC6]" />
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-0.5">
                                            <h4 className="text-xs font-bold text-gray-900">{edu.institution}</h4>
                                            <p className="text-xs text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                                            {edu.graduationYear && (
                                                <span className="text-[10px] text-gray-400 font-semibold">Class of {edu.graduationYear}</span>
                                            )}
                                        </div>
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => handleRemoveEducation(edu._id)}
                                                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!profile.education || profile.education.length === 0) && (
                                <p className="text-xs text-gray-400 italic pl-1">No education entries added yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Work Experience Timeline */}
                    <div className="page-card rounded-3xl shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase size={18} className="text-[#004AC6]" /> Work Experience
                            </h3>
                            {isOwnProfile && (
                                <button
                                    onClick={() => setShowAddExp(!showAddExp)}
                                    className="text-[#004AC6] hover:underline text-xs font-semibold flex items-center gap-1"
                                >
                                    {showAddExp ? <X size={14} /> : <Plus size={14} />}
                                    {showAddExp ? 'Close' : 'Add'}
                                </button>
                            )}
                        </div>

                        {/* Add Experience Modal Form */}
                        {showAddExp && (
                            <form onSubmit={handleAddExperience} className="p-4 border border-blue-100 bg-blue-50/20 rounded-xl space-y-3">
                                <h4 className="text-xs font-bold text-[#004AC6]">New Experience Record</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Company"
                                        value={newExp.company}
                                        onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                                        className="border rounded-lg h-9 px-3 text-xs bg-white outline-none focus:border-[#004AC6]"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Position (e.g. Designer)"
                                        value={newExp.position}
                                        onChange={(e) => setNewExp({ ...newExp, position: e.target.value })}
                                        className="border rounded-lg h-9 px-3 text-xs bg-white outline-none focus:border-[#004AC6]"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Start Date</label>
                                        <input
                                            type="date"
                                            value={newExp.startDate}
                                            onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                                            className="w-full border rounded-lg h-9 px-3 text-xs bg-white outline-none focus:border-[#004AC6]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase">End Date</label>
                                        <input
                                            type="date"
                                            value={newExp.endDate}
                                            disabled={newExp.isCurrent}
                                            onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                                            className="w-full border rounded-lg h-9 px-3 text-xs bg-white outline-none focus:border-[#004AC6] disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isCurrentExp"
                                        checked={newExp.isCurrent}
                                        onChange={(e) => setNewExp({ ...newExp, isCurrent: e.target.checked, endDate: e.target.checked ? '' : newExp.endDate })}
                                        className="h-3.5 w-3.5 rounded border-gray-300 text-[#004AC6] focus:ring-[#004AC6]"
                                    />
                                    <label htmlFor="isCurrentExp" className="text-[10px] font-medium text-gray-600">I currently work here</label>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full h-8 bg-[#004AC6] text-white font-bold rounded-lg text-xs hover:bg-[#0038A8] transition shadow-sm"
                                >
                                    Save Record
                                </button>
                            </form>
                        )}

                        {/* List */}
                        <div className="space-y-4 relative pl-3 border-l-2 border-blue-100/60 ml-2">
                            {profile.experience && profile.experience.map((item) => (
                                <div key={item._id} className="relative group hover:bg-gray-50/50 p-2.5 rounded-lg transition border border-transparent hover:border-gray-100">
                                    <div className="absolute -left-4.75 top-4 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#004AC6]" />
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-0.5">
                                            <h4 className="text-xs font-bold text-gray-900">{item.position}</h4>
                                            <p className="text-xs text-gray-600">{item.company}</p>
                                            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                                                <Calendar size={12} />
                                                {formatDate(item.startDate)} &mdash; {item.isCurrent ? 'Present' : formatDate(item.endDate)}
                                            </span>
                                        </div>
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => handleRemoveExperience(item._id)}
                                                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!profile.experience || profile.experience.length === 0) && (
                                <p className="text-xs text-gray-400 italic pl-1">No experience entries added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
