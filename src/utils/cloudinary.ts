/**
 * Client-side Cloudinary upload utility
 * Uses the Cloudinary upload API directly without requiring the Node.js SDK
 */

/**
 * Uploads an image to Cloudinary using client-side direct upload
 * This uses an unsigned upload preset which must be created in the Cloudinary dashboard
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  // Make sure you have created this upload preset in your Cloudinary dashboard
  // Go to Settings > Upload > Upload presets > Add upload preset
  // Set signing mode to 'unsigned'
  const uploadPreset = 'devsquare-club'; // Use underscores instead of hyphens
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured');
  }
  
  try {
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    // Don't include the folder in the form data - specify it in the preset instead
    
    console.log(`Uploading to Cloudinary with cloud name: ${cloudName}`);
    
    // Send the upload request to Cloudinary API
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    // Log the response status
    console.log(`Cloudinary API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cloudinary error response:', errorData);
      throw new Error(`Upload failed: ${response.statusText}. Details: ${errorData}`);
    }
    
    const data = await response.json();
    console.log('Cloudinary upload success:', data);
    
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Failed to upload image: No URL returned');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}; 