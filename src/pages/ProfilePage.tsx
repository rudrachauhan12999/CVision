import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/firebase';
import {
  User,
  Mail,
  Shield,
  Upload,
  Check,
  Loader2,
  KeyRound,
  AlertCircle,
  Database,
  Lock,
  Server
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, updateProfileData, resetPassword } = useAuth();

  const [fullName, setFullName] = useState(userProfile?.fullName || userProfile?.displayName || '');
  const [company, setCompany] = useState(userProfile?.company || '');
  const [role, setRole] = useState(userProfile?.role || 'recruiter');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Password reset message
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedMsg(null);
      await updateProfileData({
        fullName,
        displayName: fullName,
        company,
        role: role as any
      });
      setSavedMsg('Profile settings updated successfully!');
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser) return;
    const file = e.target.files[0];

    try {
      setUploadingAvatar(true);
      setAvatarError(null);

      const storagePath = `profile-images/${currentUser.uid}/${file.name}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await updateProfileData({ photoURL });
      setSavedMsg('Profile avatar updated!');
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
      setAvatarError(err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      await resetPassword(currentUser.email);
      setPasswordMsg('Password reset link sent to your registered email address.');
      setTimeout(() => setPasswordMsg(null), 4000);
    } catch (err: any) {
      console.error('Error sending reset email:', err);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Recruiter Profile & Settings</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Manage workspace settings, profile image, credentials, and system connection
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="sophisticated-card p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-3xl text-white overflow-hidden border-4 border-indigo-500/30">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'
              )}
            </div>

            <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full cursor-pointer shadow-lg transition">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>

          <h3 className="text-lg font-bold text-white">{userProfile?.fullName || userProfile?.displayName || 'Recruiter'}</h3>
          <p className="text-xs text-indigo-400 font-semibold mt-0.5 uppercase tracking-wider">
            {userProfile?.company ? `${userProfile.company} • ${userProfile.role ? userProfile.role.replace('_', ' ') : 'Recruiter'}` : (userProfile?.role ? userProfile.role.replace('_', ' ') : 'Technical Recruiter')}
          </p>
          <p className="text-xs text-slate-400 mt-2">{currentUser?.email}</p>

          <div className="w-full pt-4 mt-4 border-t border-[#1f2336] text-left space-y-2 text-xs text-slate-400">
            <p><strong className="text-slate-300">Account ID:</strong> {currentUser?.uid.substring(0, 10)}...</p>
            <p><strong className="text-slate-300">Company:</strong> {userProfile?.company || 'Not set'}</p>
            <p><strong className="text-slate-300">Member Since:</strong> {new Date(userProfile?.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="md:col-span-2 sophisticated-card p-6 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Profile Information</span>
          </h3>

          <form onSubmit={handleProfileSave} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address (Firebase Auth)
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Recruiter Role
              </label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="recruiter">Technical Recruiter</option>
                <option value="hiring_manager">Hiring Manager</option>
                <option value="admin">Talent Acquisition Lead</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>

          {/* Security & Password reset section */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Password & Security</span>
            </h4>

            {passwordMsg && (
              <p className="text-xs text-emerald-400 font-medium">{passwordMsg}</p>
            )}

            <button
              onClick={handleSendPasswordReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              Send Password Reset Email
            </button>
          </div>
        </div>
      </div>

      {/* Backend Infrastructure Status Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Server className="w-5 h-5 text-indigo-400" />
          <span>Firebase Backend Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div>
              <p className="font-bold text-white">Firebase Auth</p>
              <p className="text-slate-400 text-[11px]">Email & Password active</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div>
              <p className="font-bold text-white">Firestore DB</p>
              <p className="text-slate-400 text-[11px]">Real-time Collections synced</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div>
              <p className="font-bold text-white">Firebase Storage</p>
              <p className="text-slate-400 text-[11px]">/resumes /reports connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
