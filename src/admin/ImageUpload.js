import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function ImageUpload({ onImageUploaded, currentImageUrl }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');

  const uploadImage = async (event) => {
    try {
      setUploading(true);
      
      const file = event.target.files[0];
      if (!file) return;

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('team-inspire-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('team-inspire-images')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);
      
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-preview">
        {previewUrl && (
          <img 
            src={previewUrl} 
            alt="Preview" 
            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
          />
        )}
      </div>
      
      <label className="image-upload-button">
        {uploading ? 'Uploading...' : 'Upload Image'}
        <input
          type="file"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}

export default ImageUpload;