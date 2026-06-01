const testCompanyRegistration = async () => {
  const uniqueEmail = `company_${Date.now()}@example.com`;
  
  const payload = {
    name: 'Recruiter Contact',
    email: uniqueEmail,
    password: 'password123',
    role: 'company',
    companyName: `Corporate ${Date.now()}`,
    industry: 'Technology',
    website: 'https://company.com',
    description: 'A leading tech enterprise',
    contactEmail: uniqueEmail,
    contactPhone: '1234567890'
  };

  try {
    console.log('1. Attempting Recruiter registration for:', uniqueEmail);
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const registerData = await registerRes.json();
    console.log('Recruiter Registration Status:', registerRes.status);
    console.log('Recruiter Registration Response:', registerData);
    
    if (registerRes.status !== 201) {
      throw new Error('Recruiter Registration failed');
    }

    const token = registerData.token;
    console.log('Received Recruiter Token:', token);

    console.log('2. Attempting to fetch Recruiter profile using this token...');
    const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const profileData = await profileRes.json();
    console.log('Recruiter Profile Response Status:', profileRes.status);
    console.log('Recruiter Profile Response Body:', profileData);
  } catch (error) {
    console.error('Recruiter Test failed! Error:', error.message);
  }
};

testCompanyRegistration();
