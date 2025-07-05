//=======Registration=====
import axios from "axios";
export const generateContentAPI = async ({userPrompt, token }) => {
  try {
    const response = await axios.post(
      "http://localhost:8090/api/v1/gemini/generate-content",
      { prompt: userPrompt },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Gemini generation failed:", error?.response?.data || error.message);
    throw error;
  }
  
  };