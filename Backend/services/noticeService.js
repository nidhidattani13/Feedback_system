export const fetchNotices = async (userType, { limit = 10, beforeDate = null } = {}) => {
  try {
    console.log(`Fetching notices for userType: ${userType}...`);

    let url = `/api/notices?audience=${encodeURIComponent(userType)}&limit=${limit}`;
    
    if (beforeDate) {
      url += `&before_date=${encodeURIComponent(beforeDate)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch notices: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched notices:", data);
    return data;
    
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
};
