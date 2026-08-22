import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { axiosInstance } from '../../api/axios';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/auth/profile/');
        if (response.data.success) {
          setProfileData(response.data.data);
          setFormData({
            first_name: response.data.data.first_name || '',
            last_name: response.data.data.last_name || '',
            phone: response.data.data.phone || ''
          });
        }
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await axiosInstance.patch('/auth/profile/', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone
      });
      if (response.data.success) {
        setProfileData(response.data.data);
        setIsEditing(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!profileData) return <div className="p-8 text-center">No profile data found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary-600 px-8 py-10 text-white text-center relative">
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
          >
            {isEditing ? (isSaving ? 'Saving...' : 'Save Profile') : 'Edit Profile'}
          </button>
          {isEditing && (
            <button 
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  first_name: profileData.first_name || '',
                  last_name: profileData.last_name || '',
                  phone: profileData.phone || ''
                });
              }}
              className="absolute top-4 right-32 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
            >
              Cancel
            </button>
          )}

          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <User className="h-12 w-12 text-white" />
          </div>
          
          {isEditing ? (
            <div className="flex justify-center gap-4 max-w-sm mx-auto">
              <input 
                type="text" 
                value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="First Name"
              />
              <input 
                type="text" 
                value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Last Name"
              />
            </div>
          ) : (
            <h1 className="text-3xl font-bold">{profileData.first_name} {profileData.last_name}</h1>
          )}
          
          <p className="text-primary-100 mt-2 capitalize">{profileData.role.toLowerCase()}</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-gray-900 mt-1">{profileData.email} <span className="text-xs text-gray-400 ml-2">(Cannot be changed)</span></p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div className="w-full max-w-sm">
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">{profileData.phone || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <Shield className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Account Role</p>
                <p className="text-gray-900 mt-1 capitalize">{profileData.role}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="text-gray-900 mt-1">
                  {new Date(profileData.date_joined).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
