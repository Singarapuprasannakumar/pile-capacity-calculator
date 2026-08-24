import API from './pileApi';

export const getFoundationPreferences = async (projectUuid) => {
  try {
    const response = await API.get(`/projects/${projectUuid}/foundation-preferences`);
    return response.data; // returns null if no preferences exist
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateFoundationPreferences = async (projectUuid, preferences) => {
  const response = await API.put(`/projects/${projectUuid}/foundation-preferences`, preferences);
  return response.data;
};

export const setAdhesionFactor = async (projectUuid, value, source = 'foundation-analysis') => {
  return updateFoundationPreferences(projectUuid, {
    adhesion_factor: {
      value: value,
      active: true,
      source: source
    }
  });
};

export const clearAdhesionFactor = async (projectUuid) => {
  return updateFoundationPreferences(projectUuid, {
    adhesion_factor: {
      value: null,
      active: false,
      source: null
    }
  });
};
