import axios from "axios";
import axiosInstance from "./axiosInstance";

export const createSession = async () => {
  const res = await axiosInstance.post<{ sessionId: string }>("/api/sessions");
  return res.data.sessionId;
};

export const submitInquiryApi = async (sessionId: string, question: string) => {
  try {
    const res = await axiosInstance.post<{ inquiryId: string }>(
      `/api/sessions/${sessionId}/inquiries`,
      { question }
    );
    return res.data.inquiryId;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Session not found, retry after creating new session
      const newSessionId = await createSession();
      localStorage.setItem("sessionId", newSessionId);

      const retry = await axiosInstance.post<{ inquiryId: string }>(
        `/api/sessions/${newSessionId}/inquiries`,
        { question }
      );
      return retry.data.inquiryId;
    }

    throw error;
  }
};

export const streamInquiry = async (
  inquiryId: string,
  onChunk: (chunk: string) => void
) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/inquiries/${inquiryId}/stream`,
    {
      method: "GET",
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Streaming failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No readable stream available");

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    onChunk(chunk);
  }
};

export const validateSession = async (sessionId: string) => {
  try {
    await axiosInstance.get(`/api/sessions/${sessionId}/validate`);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false;
    }
    throw error;
  }
};
