'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function UserRegistryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [company, setCompany] = useState('Emirates Reem Investments PJSC');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [locationsList, setLocationsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  
  const [newLocationName, setNewLocationName] = useState('');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [addingNode, setAddingNode] = useState(false);
  const [showNodeManager, setShowNodeManager] = useState(false);

  // Edit Form Fields
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editEmail, setEditEmail] = useState('');
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editCompany, setEditCompany] = useState('Emirates Reem Investments PJSC');
  const [editDepartment, setEditDepartment] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const fetchLocationsAndDepartments = async () => {
    try {
      const locRes = await fetch('/api/locations');
      if (locRes.ok) {
        const locData = await locRes.json();
        setLocationsList(locData);
        if (locData.length > 0 && !location) {
          setLocation(locData[0].name);
        }
      }
      const deptRes = await fetch('/api/departments');
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartmentsList(deptData);
        if (deptData.length > 0 && !department) {
          setDepartment(deptData[0].name);
        }
      }
    } catch (err) {
      console.error('Error fetching corporate nodes:', err);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;
    setAddingNode(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLocationName })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Location "${newLocationName}" created successfully!`);
        setNewLocationName('');
        await fetchLocationsAndDepartments();
      } else {
        setError(data.error || 'Failed to create location');
      }
    } catch (err) {
      setError('Failed to create location');
    } finally {
      setAddingNode(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;
    setAddingNode(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDepartmentName })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Department "${newDepartmentName}" created successfully!`);
        setNewDepartmentName('');
        await fetchLocationsAndDepartments();
      } else {
        setError(data.error || 'Failed to create department');
      }
    } catch (err) {
      setError('Failed to create department');
    } finally {
      setAddingNode(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const contentType = res.headers.get('content-type');
      
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setUsers(data);
      } else {
        let errMsg = 'Failed to fetch user list from server.';
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } else {
          const text = await res.text();
          console.error('Non-JSON server response:', text.slice(0, 300));
        }
        setError(errMsg);
      }
    } catch (err) {
      setError('Error connecting to the identity registry.');
      console.error('Fetch users exception:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLocationsAndDepartments();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          name,
          role,
          email,
          employeeId,
          company,
          department,
          location,
          avatar
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register identity account');
      }

      setSuccess(`Account for ${name} registered successfully!`);
      setShowForm(false);
      
      // Clear form
      setUsername('');
      setPassword('');
      setName('');
      setRole('user');
      setEmail('');
      setEmployeeId('');
      setDepartment(departmentsList.length > 0 ? departmentsList[0].name : '');
      setLocation(locationsList.length > 0 ? locationsList[0].name : '');
      setAvatar('');

      // Reload registry
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (u) => {
    setEditingUser(u);
    setEditUsername(u.username);
    setEditPassword('');
    setEditName(u.name);
    setEditRole(u.role);
    setEditEmail(u.email);
    setEditEmployeeId(u.employeeId || '');
    setEditCompany(u.company || 'Emirates Reem Investments PJSC');
    setEditDepartment(u.department || '');
    setEditLocation(u.location || '');
    setEditAvatar(u.avatar || '');
    setError('');
    setSuccess('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername,
          password: editPassword,
          name: editName,
          role: editRole,
          email: editEmail,
          employeeId: editEmployeeId,
          company: editCompany,
          department: editDepartment,
          location: editLocation,
          avatar: editAvatar
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user profile');
      }

      setSuccess(`Account for ${editName} updated successfully!`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to permanently delete the profile for "${userName}"? This will unassign any active tickets and remove their credentials.`)) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      setSuccess(`Account for "${userName}" deleted successfully.`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Identity Registry Console
            </h1>
            <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase mt-1">
              Enterprise Access Management &amp; Role Provisioning
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setError('');
              setSuccess('');
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            {showForm ? 'Cancel Creation' : '➕ Provision New Account'}
          </button>
        </div>

        {/* Success / Error Banners */}
        {success && (
          <div className="text-emerald-400 text-xs font-semibold bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 shadow">
            🎉 {success}
          </div>
        )}
        {error && (
          <div className="text-rose-400 text-xs font-semibold bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5 shadow">
            ⚠️ {error}
          </div>
        )}

        {/* Provision Form Drawer */}
        {showForm && (
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card shadow-2xl max-w-2xl mx-auto">
            <div className="border-b border-white/5 pb-3 mb-5">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Register New Corporate Profile</h2>
              <p className="text-[10px] text-slate-400">Specify employee credentials and access control authorization levels</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Liam Sterling"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="e.g. l.sterling@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. user.liam"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Console Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Role dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Access Authorization Level</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  >
                    <option value="user">Standard User (Employee)</option>
                    <option value="technician">IT Support Technician</option>
                    <option value="admin">IT Security Administrator</option>
                  </select>
                </div>

                {/* Employee ID */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-1009"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  />
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Company Node</label>
                  <input
                    type="text"
                    placeholder="Emirates Reem Investments PJSC"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  />
                </div>

                {/* Department dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  >
                    {departmentsList.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Location dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Corporate Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  >
                    {locationsList.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar Url */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Avatar Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                  disabled={submitting}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 text-xs font-bold hover:bg-white/5 transition cursor-pointer"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 disabled:text-slate-400 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Deploying Credentials...</span>
                    </>
                  ) : (
                    <span>Register Access Profile</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Corporate Node Manager Collapsible Block */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl glass-card overflow-hidden shadow-xl">
          <button
            onClick={() => setShowNodeManager(!showNodeManager)}
            className="w-full p-6 flex items-center justify-between text-left cursor-pointer hover:bg-white/1 transition duration-200"
          >
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                🏢 Corporate Infrastructure Node Manager
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Dynamically provision corporate Locations &amp; Departments for the enterprise</p>
            </div>
            <span className="text-slate-400 text-xs font-bold font-mono">
              {showNodeManager ? '▲ Collapse' : '▼ Expand'}
            </span>
          </button>

          {showNodeManager && (
            <div className="p-6 border-t border-white/5 bg-slate-950/20 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Add Location Form */}
                <form onSubmit={handleAddLocation} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Add New Location</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Fujairah Office"
                        value={newLocationName}
                        onChange={(e) => setNewLocationName(e.target.value)}
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                        required
                        disabled={addingNode}
                      />
                      <button
                        type="submit"
                        disabled={addingNode || !newLocationName.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        Add Site
                      </button>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Existing Locations ({locationsList.length}): {locationsList.map(l => l.name).join(', ')}
                  </div>
                </form>

                {/* Add Department Form */}
                <form onSubmit={handleAddDepartment} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Add New Department</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Operations & Supply Chain"
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-655 focus:outline-none focus:border-indigo-500 transition"
                        required
                        disabled={addingNode}
                      />
                      <button
                        type="submit"
                        disabled={addingNode || !newDepartmentName.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        Add Dept
                      </button>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Existing Departments ({departmentsList.length}): {departmentsList.map(d => d.name).join(', ')}
                  </div>
                </form>

              </div>
            </div>
          )}
        </div>

        {/* User Roster Table */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl glass-card overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Identity Registry &amp; Roster</h2>
            <p className="text-[10px] text-slate-400">Authenticated user accounts provisioned in Active Directory SQLite Node</p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Synchronizing Roster...</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-white/5 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                    <th className="p-4 pl-6">Profile</th>
                    <th className="p-4">Username</th>
                    <th className="p-4">Authorization</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Node / Department</th>
                    <th className="p-4">Employee ID</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-slate-950/20">
                  {users.map(u => {
                    const roleBadges = {
                      'admin': 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                      'technician': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                      'user': 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    };

                    return (
                      <tr key={u.id} className="hover:bg-white/2 transition">
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-lg object-cover border border-white/10"
                          />
                          <span className="font-bold text-slate-200">{u.name}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{u.username}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${roleBadges[u.role]}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300 font-mono">{u.email}</td>
                        <td className="p-4 space-y-0.5 text-slate-400">
                          <div className="font-semibold text-slate-350">{u.department || 'General'}</div>
                          <div className="text-[10px] text-slate-500">📍 {u.location || 'Abu Dhabi (HQ)'}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-300">{u.employeeId || 'N/A'}</td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleStartEdit(u)}
                              className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              ✏️ Edit / Reset PW
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="bg-rose-600/10 hover:bg-rose-600/20 text-rose-450 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 glass-card shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Edit Access Profile</h2>
                <p className="text-[10px] text-slate-400">Modify access permissions and credential structures</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white transition text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Corporate Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Password reset */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reset Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  />
                </div>

                {/* Role dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Access Authorization Level</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  >
                    <option value="user">Standard User (Employee)</option>
                    <option value="technician">IT Support Technician</option>
                    <option value="admin">IT Security Administrator</option>
                  </select>
                </div>

                {/* Employee ID */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Employee ID</label>
                  <input
                    type="text"
                    value={editEmployeeId}
                    onChange={(e) => setEditEmployeeId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  />
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Company Node</label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  />
                </div>

                {/* Department dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  >
                    {departmentsList.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Location dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Corporate Location</label>
                  <select
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                    disabled={submitting}
                  >
                    {locationsList.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar Url */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Avatar Image URL (Optional)</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                  disabled={submitting}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 text-xs font-bold hover:bg-white/5 transition cursor-pointer"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 disabled:text-slate-400 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating Credentials...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
