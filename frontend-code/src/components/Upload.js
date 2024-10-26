import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Upload = ({ handleLogout }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [message, setMessage] = useState('');

  // Retrieve token from localStorage on component mount
  const [token] = useState(localStorage.getItem('token') || '');
  console.log('Current token:', token); 
  
  useEffect(() => {
    if (!token) {
      setMessage("No token found, please login again.");
      return;
    }

    // Fetch uploaded image if it exists
    const fetchImage = async () => {
      try {
        const response = await axios.get('http://localhost:5000/upload/image', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.imageData) {
          setUploadedImage(response.data.imageData);
        }
      } catch (error) {
        console.error('Failed to retrieve image');
      }
    };

    fetchImage();
  }, [token]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage('Please select an image to upload');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/upload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(response.data.message);
      setUploadedImage(URL.createObjectURL(selectedFile));
    } catch (error) {
      setMessage('Image upload failed');
      console.error('Upload error', error);
    }
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <button onClick={handleLogout}>Logout</button>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
      {uploadedImage && (
        <div>
          <h3>Your Uploaded Image</h3>
          <img src={`data:image/jpeg;base64,${uploadedImage}`} alt="Uploaded" style={{ width: '200px', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default Upload;
