import React, { useState } from 'react';
import axios from 'axios';

const StylistUpload = () => {
  const [file, setFile] = useState(null);
  const [occasion, setOccasion] = useState("casual");
  const [recommendations, setRecommendations] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Create a preview of the selected image
    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
    }
  };

  const handleOccasionChange = (e) => {
    setOccasion(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('occasion', occasion);

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <h2>AI Personal Stylist</h2>
        <p>Upload an image to receive styling recommendations based on your body shape and skin tone.</p>
        
        <input type="file" onChange={handleFileChange} />
        <select value={occasion} onChange={handleOccasionChange}>
          <option value="casual">Casual</option>
          <option value="formal">Formal</option>
        </select>
        <button onClick={handleUpload}>Get Recommendations</button>

        {recommendations && (
          <div style={{ marginTop: '20px' }}>
            <h3>Styling Recommendations</h3>
            <p><strong>Skin Tone:</strong> {recommendations.skin_tone}</p>
            <p><strong>Body Shape:</strong> {recommendations.body_shape}</p>
            <ul>
              {recommendations.recommendations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Image Preview Section */}
      {imagePreview && (
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h3>Uploaded Image</h3>
          <img
            src={imagePreview}
            alt="Uploaded Preview"
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
          />
        </div>
      )}
    </div>
  );
};

export default StylistUpload;
