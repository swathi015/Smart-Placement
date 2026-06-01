const testUploadFlow = async () => {
  const uniqueEmail = `student_${Date.now()}@example.com`;
  
  const payload = {
    name: 'Sathwika Thungathurthi',
    email: uniqueEmail,
    password: 'password123',
    role: 'student',
    rollNumber: `ROLL-${Date.now()}`,
    department: 'Computer Science',
    cgpa: 8.9,
    backlogs: 0,
    skills: ['Python', 'SQL'],
    graduationYear: 2026
  };

  try {
    console.log('1. Registering student...');
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const registerData = await registerRes.json();
    if (registerRes.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(registerData)}`);
    }

    const token = registerData.token;
    console.log('Registered successfully! Token:', token);

    console.log('2. Simulating Resume Upload...');
    
    // Create form data with a virtual text/pdf file
    const formData = new FormData();
    const mockFile = new Blob(['Mock PDF Resume Content'], { type: 'application/pdf' });
    formData.append('resume', mockFile, 'resume.pdf');

    const uploadRes = await fetch('http://localhost:5000/api/students/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const uploadData = await uploadRes.json();
    console.log('Upload Response Status:', uploadRes.status);
    console.log('Upload Response Body:', uploadData);
  } catch (error) {
    console.error('Upload test failed! Error:', error.message);
  }
};

testUploadFlow();
