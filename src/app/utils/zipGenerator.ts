import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileNode, prepareFilesForZip } from './contextManager';

/**
 * Generate a ZIP file from the project files and trigger download
 * @param files Array of file nodes
 * @param projectName Optional project name for the ZIP file
 */
export const generateZipFromFiles = async (files: FileNode[], projectName?: string): Promise<void> => {
  try {
    // Create a new zip instance
    const zip = new JSZip();
    
    // Get flat list of files for the zip
    const zipFiles = prepareFilesForZip(files);
    
    // Add each file to the zip
    zipFiles.forEach(file => {
      zip.file(file.name, file.content);
    });
    
    // Generate the zip file content
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create a name for the zip file
    const zipName = `${projectName || 'website-project'}-${new Date().toISOString().slice(0, 10)}.zip`;
    
    // Trigger download
    saveAs(content, zipName);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to generate ZIP file:', error);
    return Promise.reject(error);
  }
}; 