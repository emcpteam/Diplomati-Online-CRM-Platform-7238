// File upload utilities
export const uploadFile = async (file, type = 'general') => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('File size too large. Maximum 10MB allowed.'));
      return;
    }

    // Validate file types
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      general: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword']
    };

    if (!allowedTypes[type].includes(file.type)) {
      reject(new Error(`File type not allowed. Allowed types: ${allowedTypes[type].join(', ')}`));
      return;
    }

    // Simulate file upload
    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        resolve({
          url: event.target.result,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        });
      }, 1000);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const deleteFile = async (fileUrl) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

export const validateFile = (file, maxSize = 10 * 1024 * 1024, allowedTypes = []) => {
  const errors = [];

  if (!file) {
    errors.push('No file selected');
    return errors;
  }

  if (file.size > maxSize) {
    errors.push(`File size too large. Maximum ${(maxSize / 1024 / 1024).toFixed(1)}MB allowed.`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return errors;
};