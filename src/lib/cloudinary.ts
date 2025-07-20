import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageFromUrl(imageUrl: string, publicId: string) {
  try {
    console.log('Uploading image from URL:', imageUrl);
    
    // Convert URL object to string if needed
    const urlString = imageUrl.toString();
    
    // Upload directly from URL to Cloudinary
    const result = await cloudinary.uploader.upload(urlString, {
      folder: 'cthai-images',
      public_id: publicId,
      resource_type: 'image',
      format: 'jpg',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export async function deleteImage(publicId: string) {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
} 

export async function uploadVideoFromUrl(videoUrl: string, publicId: string) {
  try {
    console.log('Uploading video from URL:', videoUrl);
    
    // Convert URL object to string if needed
    const urlString = videoUrl.toString();
    
    // Upload directly from URL to Cloudinary
    const result = await cloudinary.uploader.upload(urlString, {
      folder: 'cthai-videos',
      public_id: publicId,
      resource_type: 'video',
      format: 'mp4',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    console.log('Video upload successful:', result);
    return result;
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
}

export async function deleteVideo(publicId: string) {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (error) {
    console.error('Error deleting video from Cloudinary:', error);
    throw error;
  }
} 

export async function uploadAudioFromUrl(audioUrl: string, publicId: string) {
  try {
    console.log('Uploading audio from URL:', audioUrl);
    
    // Convert URL object to string if needed
    const urlString = audioUrl.toString();
    
    // Upload directly from URL to Cloudinary
    const result = await cloudinary.uploader.upload(urlString, {
      folder: 'cthai-audios',
      public_id: publicId,
      resource_type: 'video', // Cloudinary treats audio as video
      format: 'mp3',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    console.log('Audio upload successful:', result);
    return result;
  } catch (error) {
    console.error('Error uploading audio to Cloudinary:', error);
    throw error;
  }
}

export async function deleteAudio(publicId: string) {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (error) {
    console.error('Error deleting audio from Cloudinary:', error);
    throw error;
  }
} 