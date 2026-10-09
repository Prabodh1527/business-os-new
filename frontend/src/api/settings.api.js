import API from "@/api/axios";

export const getBusinessProfile = async () => {
  const res = await API.get("/tenant/me");
  return res.data;
};

export const updateBusinessProfile = async (data) => {
  const res = await API.put("/tenant/me", data);
  return res.data;
};

export const getMasters = async (type) => {
  const url = type ? `/masters?type=${encodeURIComponent(type)}` : "/masters";
  const res = await API.get(url);
  return res.data;
};

export const createMaster = async (data) => {
  const res = await API.post("/masters", data);
  return res.data;
};

export const updateMaster = async (id, data) => {
  const res = await API.patch(`/masters/${id}`, data);
  return res.data;
};

export const deleteMaster = async (id) => {
  const res = await API.delete(`/masters/${id}`);
  return res.data;
};
