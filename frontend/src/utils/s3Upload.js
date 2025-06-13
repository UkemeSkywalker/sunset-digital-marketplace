import { Storage } from 'aws-amplify';

/**
 * Upload a file to S3 bucket
 * @param {File} file - The file to upload
 * @param {string} path - The path in S3 where the file should be stored
 * @param {string} contentType - The content type of the file
 * @returns {Promise<string>} - The S3 URL of the uploaded file
 */
export const uploadToS3 = async (file, path, contentType) => {
  try {
    const fileName = `${path}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    const result = await Storage.put(fileName, file, {
      contentType,
      metadata: {
        originalName: file.name
      }
    });
    
    // Return the S3 URL
    return result.key;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};