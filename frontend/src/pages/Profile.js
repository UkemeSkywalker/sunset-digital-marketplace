import React, { useState, useEffect, useCallback } from 'react';
import { API, Storage } from 'aws-amplify';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ProfilePictureUploader from '../components/ProfilePictureUploader';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    username: user?.email ? user.email.split('@')[0] : '',
    organization: '',
    country: '',
    website: '',
    socialMedia: {
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    bio: '',
    profilePicture: null,
    productCount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API
      try {
        const response = await API.get('api', `/users/${user.sub}`);
        
        // Get product count
        let productCount = 0;
        try {
          const productsResponse = await API.get('api', '/products');
          if (Array.isArray(productsResponse)) {
            productCount = productsResponse.filter(p => p.sellerId === user.sub).length;
          }
        } catch (err) {
          console.log('Error fetching product count:', err);
        }
        
        if (response) {
          // User exists in database, use their data
          setProfile({
            firstName: response.firstName || '',
            lastName: response.lastName || '',
            email: user?.email || '',
            username: response.username || (user?.email ? user.email.split('@')[0] : ''),
            organization: response.organization || '',
            country: response.country || '',
            website: response.website || '',
            socialMedia: response.socialMedia || {
              twitter: '',
              instagram: '',
              linkedin: ''
            },
            bio: response.bio || '',
            profilePicture: response.profilePicture || null,
            productCount
          });
          
          // If there's a profile picture, get the URL
          if (response.profilePicture) {
            const imageUrl = `https://${process.env.REACT_APP_S3_BUCKET}.s3.us-east-1.amazonaws.com/public/${response.profilePicture.replace(/^public\//, '')}`;
            setImagePreview(imageUrl);
          } else {
            setImagePreview(null);
          }
        } else {
          // User doesn't exist in database yet, use default data
          setProfile({
            firstName: '',
            lastName: '',
            email: user?.email || '',
            organization: '',
            country: '',
            website: '',
            socialMedia: {
              twitter: '',
              instagram: '',
              linkedin: ''
            },
            bio: '',
            profilePicture: null,
            productCount: 0
          });
          setImagePreview(null);
        }
      } catch (apiError) {
        console.log('Using default profile data', apiError);
        // Set default profile if API fails
        setProfile({
          firstName: '',
          lastName: '',
          email: user?.email || '',
          username: user?.email ? user.email.split('@')[0] : '',
          organization: '',
          country: '',
          website: '',
          socialMedia: {
            twitter: '',
            instagram: '',
            linkedin: ''
          },
          bio: '',
          profilePicture: null,
          productCount: 0
        });
        setImagePreview(null);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile. Please try again later.');
      setLoading(false);
    }
  }, [user]);
  
  // Create or fetch user profile on component mount
  useEffect(() => {
    if (user) {
      // First create the user if they don't exist
      const createUserIfNeeded = async () => {
        try {
          await API.post('api', '/users', {
            body: {
              id: user.sub,
              email: user.email
            }
          });
          // Then fetch the user profile
          fetchUserProfile();
        } catch (err) {
          console.error('Error creating user:', err);
          // Still try to fetch profile even if creation fails
          fetchUserProfile();
        }
      };
      
      createUserIfNeeded();
    }
  }, [user, fetchUserProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested socialMedia fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value
        }
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture exceeds the 5MB size limit.');
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, GIF, or WEBP).');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setProfile({
        ...profile,
        profilePictureFile: file
      });
      
      // If not in edit mode, enter edit mode
      if (!isEditing) {
        setIsEditing(true);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      let profilePicturePath = profile.profilePicture;
      
      // Upload new profile picture if provided
      if (profile.profilePictureFile) {
        const fileName = `profile-pictures/${user.sub}-${Date.now()}-${profile.profilePictureFile.name.replace(/\\s+/g, '-')}`;
        
        await Storage.put(
          fileName,
          profile.profilePictureFile,
          {
            contentType: profile.profilePictureFile.type,
            progressCallback(progress) {
              const percentCompleted = Math.round((progress.loaded / progress.total) * 100);
              setUploadProgress(percentCompleted);
            }
          }
        );
        
        profilePicturePath = fileName;
      }
      
      // Update profile in database
      const updatedProfile = {
        id: user.sub,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        username: profile.username,
        organization: profile.organization,
        country: profile.country,
        website: profile.website,
        socialMedia: profile.socialMedia,
        bio: profile.bio,
        profilePicture: profilePicturePath
      };
      
      await API.put('api', `/users/${user.sub}`, {
        body: updatedProfile
      });
      
      // Update local state
      setProfile({
        ...profile,
        profilePicture: profilePicturePath,
        profilePictureFile: null
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setSaving(false);
      setUploadProgress(0);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setSaving(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-primary-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">User Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-sunset-orange text-white px-4 py-2 rounded-md hover:bg-sunset-dark transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <ProfilePictureUploader 
                    imagePreview={imagePreview}
                    onFileChange={handleFileChange}
                    uploadProgress={uploadProgress}
                    onCancel={() => {
                      setIsEditing(false);
                      setError(null);
                      setImagePreview(profile.profilePicture ? 
                        `https://${process.env.REACT_APP_S3_BUCKET}.s3.us-east-1.amazonaws.com/public/${profile.profilePicture.replace(/^public\//, '')}` : 
                        null);
                    }}
                  />
                </div>
                
                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                        placeholder="First Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                        placeholder="Last Name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sunset-orange"
                      placeholder="Username"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Organization</label>
                    <input
                      type="text"
                      name="organization"
                      value={profile.organization}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                      placeholder="Your organization or company"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Country *</label>
                    <select
                      name="country"
                      value={profile.country}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                      required
                    >
                      <option value="">Select a country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="JP">Japan</option>
                      <option value="IN">India</option>
                      <option value="BR">Brazil</option>
                      <option value="NG">Nigeria</option>
                      <option value="ZA">South Africa</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={profile.website}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Social Media</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="w-24 text-sm text-gray-500">Twitter</span>
                        <input
                          type="text"
                          name="socialMedia.twitter"
                          value={profile.socialMedia.twitter}
                          onChange={(e) => setProfile({
                            ...profile,
                            socialMedia: {
                              ...profile.socialMedia,
                              twitter: e.target.value
                            }
                          })}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                          placeholder="@username"
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 text-sm text-gray-500">Instagram</span>
                        <input
                          type="text"
                          name="socialMedia.instagram"
                          value={profile.socialMedia.instagram}
                          onChange={(e) => setProfile({
                            ...profile,
                            socialMedia: {
                              ...profile.socialMedia,
                              instagram: e.target.value
                            }
                          })}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                          placeholder="@username"
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 text-sm text-gray-500">LinkedIn</span>
                        <input
                          type="text"
                          name="socialMedia.linkedin"
                          value={profile.socialMedia.linkedin}
                          onChange={(e) => setProfile({
                            ...profile,
                            socialMedia: {
                              ...profile.socialMedia,
                              linkedin: e.target.value
                            }
                          })}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                      placeholder="Tell us about yourself..."
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Products Uploaded</label>
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
                      <span className="font-medium">{profile.productCount}</span> products
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                    setImagePreview(profile.profilePicture ? 
                      `https://${process.env.REACT_APP_S3_BUCKET}.s3.us-east-1.amazonaws.com/public/${profile.profilePicture.replace(/^public\//, '')}` : 
                      null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sunset-orange text-white px-6 py-2 rounded-md hover:bg-sunset-dark transition-colors disabled:bg-gray-400"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 flex flex-col items-center">
                <div 
                  className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 mb-4 relative group cursor-pointer"
                  onClick={() => setIsEditing(true)}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-semibold">
                  {profile.firstName && profile.lastName 
                    ? `${profile.firstName} ${profile.lastName}` 
                    : profile.username || 'User'}
                </h2>
                <p className="text-gray-500">@{profile.username}</p>
                <p className="text-gray-500 text-sm">{user?.email || ''}</p>
              </div>
              
              <div className="md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500">Username:</span>
                        <p className="text-gray-700">@{profile.username}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="text-gray-700">{profile.email}</p>
                      </div>
                      {profile.organization && (
                        <div>
                          <span className="text-gray-500">Organization:</span>
                          <p className="text-gray-700">{profile.organization}</p>
                        </div>
                      )}
                      {profile.country && (
                        <div>
                          <span className="text-gray-500">Country:</span>
                          <p className="text-gray-700">{profile.country}</p>
                        </div>
                      )}
                      {profile.website && (
                        <div>
                          <span className="text-gray-500">Website:</span>
                          <p className="text-gray-700">
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                              {profile.website}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Social Media</h3>
                    {(profile.socialMedia?.twitter || profile.socialMedia?.instagram || profile.socialMedia?.linkedin) ? (
                      <div className="space-y-2">
                        {profile.socialMedia?.twitter && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                            <a href={`https://twitter.com/${profile.socialMedia.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                              {profile.socialMedia.twitter}
                            </a>
                          </div>
                        )}
                        {profile.socialMedia?.instagram && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-pink-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                            </svg>
                            <a href={`https://instagram.com/${profile.socialMedia.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                              {profile.socialMedia.instagram}
                            </a>
                          </div>
                        )}
                        {profile.socialMedia?.linkedin && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-700 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            <a href={`https://linkedin.com/in/${profile.socialMedia.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                              {profile.socialMedia.linkedin}
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No social media profiles provided.</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Bio</h3>
                  {profile.bio ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No bio provided yet.</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Products</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="font-medium">{profile.productCount}</span>
                      <span className="ml-1 text-gray-500">products uploaded</span>
                    </div>
                    {profile.productCount > 0 && (
                      <Link to="/dashboard" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                        View in Creator Dashboard →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;