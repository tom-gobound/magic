import { readDataFiles, loadSelectedData } from '../utils/dataLoader.js';

export const availableDataFiles = await readDataFiles();

export const getSelectedData = async (selectedFiles) => {
  return await loadSelectedData(selectedFiles);
};