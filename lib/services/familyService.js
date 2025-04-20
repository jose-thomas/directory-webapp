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

