import Log from "../models/log.model.js";

export const createLog = async (data) => {
  const createdLog = await Log.create(data);
  if (!createdLog) return false;
  return true;
};
