import React, { useState } from 'react';
import tourService from '../../services/api/tourService';

const TourImages = ({ tourId }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('img', file);       // 'img' phải khớp với upload.single("img") bên BE
    formData.append('tour_id', tourId); // BE yêu cầu field này
    
    try {
        await tourService.uploadImage(formData);
        alert('Upload thành công');
        // Refresh lại list ảnh...
    } catch (error) {
        alert('Lỗi upload');
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Tải lên</button>
    </div>
  );
};

export default TourImages;