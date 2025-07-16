import api from "../api";

export const searchFamilies = async (searchData) => {
  try {
    const response = await api.post(`/families/searchFamilyMembers`, searchData);
    return response.data;
  } catch (error) {
    console.error("Error searching families:", error);
    throw error;
  }
};

// Delete family
export const deleteFamily = async (familyId) => {
  try {
    const response = await api.delete(`/families/${familyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting family:', error);
    throw error;
  }
};

// Create a new family
export const createFamily = async (familyData) => {
  try {
    const response = await api.post('/families', familyData);
    return response.data;
  } catch (error) {
    console.error('Error creating family:', error);
    throw error;
  }
};

// Upload family photo
export const uploadFamilyPhoto = async (familyId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/families/${familyId}/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading family photo:', error);
    throw error;
  }
};

// Get family by ID
export const getFamilyById = async (familyId) => {
  try {
    const response = await api.get(`/families/${familyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching family:', error);
    throw error;
  }
};

// Update family
export const updateFamily = async (familyId, familyData) => {
  try {
    const response = await api.put(`/families/${familyId}`, familyData);
    return response.data;
  } catch (error) {
    console.error('Error updating family:', error);
    throw error;
  }
};

// Add family members
export const addFamilyMembers = async (familyId, memberRequests) => {
  try {
    console.log('addFamilyMembers API call:');
    console.log('Family ID:', familyId);
    console.log('Member requests:', memberRequests);
    console.log('Request payload:', JSON.stringify(memberRequests, null, 2));
    
    const response = await api.post(`/families/${familyId}/members`, memberRequests);
    console.log('addFamilyMembers response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding family members:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

// Delete family photo
export const deleteFamilyPhoto = async (familyId) => {
  try {
    const response = await api.delete(`/families/${familyId}/delete-photo`);
    return response.data;
  } catch (error) {
    console.error('Error deleting family photo:', error);
    throw error;
  }
};
