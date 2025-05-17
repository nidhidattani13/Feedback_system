export const fetchNotices = async (userType, { limit = 10, beforeDate = null } = {}) => {
  try {
    console.log(`Fetching notices for userType: ${userType}...`);

    // Use full URL with base URL
    const baseUrl = window?.env?.REACT_APP_API_URL || 'http://localhost:5000';
    let url = `${baseUrl}/api/notices?audience=${encodeURIComponent(userType)}&limit=${limit}`;
    
    if (beforeDate) {
      url += `&before_date=${encodeURIComponent(beforeDate)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Check if response is HTML error page
    if (response.headers.get('content-type')?.includes('text/html')) {
      throw new Error('Server returned HTML response instead of JSON');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch notices: ${errorText}`);
    }

    const data = await response.json();
    console.log("Fetched notices:", data);
    return data;
    
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
};
