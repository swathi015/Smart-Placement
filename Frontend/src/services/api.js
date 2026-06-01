import axiosInstance from './axiosConfig.js';

// Authentication API Layer
export const authAPI = {
  login: async (credentials) => {
    const { data } = await axiosInstance.post('/auth/login', credentials);
    return data; // Returns { _id, name, email, role, isApproved, token }
  },
  
  register: async (userData) => {
    const { data } = await axiosInstance.post('/auth/register', userData);
    return data; // Returns base user info + token
  },
  
  getProfile: async () => {
    const { data } = await axiosInstance.get('/auth/profile');
    return data; // Returns user info + nested student/company profile details
  },
  
  getPendingApprovals: async () => {
    const { data } = await axiosInstance.get('/auth/pending');
    return data; // Returns array of detailed company objects pending approval
  },
  
  approveUser: async (id) => {
    const { data } = await axiosInstance.put(`/auth/approve/${id}`);
    return data; // Confirms approval status update
  }
};

// Student Actions Layer
export const studentAPI = {
  getProfile: async () => {
    const { data } = await axiosInstance.get('/students/profile');
    return data;
  },
  
  updateProfile: async (profileDetails) => {
    const { data } = await axiosInstance.put('/students/profile', profileDetails);
    return data;
  },
  
  getAllStudents: async (filters = {}) => {
    const { data } = await axiosInstance.get('/students', { params: filters });
    return data;
  },
  
  uploadResume: async (formData) => {
    const { data } = await axiosInstance.post('/students/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data; // Returns secure_url and success message
  },
  
  getEligibleJobs: async () => {
    const { data } = await axiosInstance.get('/students/eligible-jobs');
    return data;
  }
};

// Company Actions Layer
export const companyAPI = {
  getProfile: async () => {
    const { data } = await axiosInstance.get('/companies/profile');
    return data;
  },
  
  updateProfile: async (profileDetails) => {
    const { data } = await axiosInstance.put('/companies/profile', profileDetails);
    return data;
  },
  
  getAllCompanies: async () => {
    const { data } = await axiosInstance.get('/companies');
    return data;
  },
  
  postJob: async (jobData) => {
    const { data } = await axiosInstance.post('/companies/jobs', jobData);
    return data;
  },
  
  getPostedJobs: async () => {
    const { data } = await axiosInstance.get('/companies/jobs');
    return data;
  },
  
  updateJob: async (id, jobData) => {
    const { data } = await axiosInstance.put(`/companies/jobs/${id}`, jobData);
    return data;
  }
};

// Public/Private Job Board API Layer
export const jobAPI = {
  getAll: async (filters = {}) => {
    const { data } = await axiosInstance.get('/jobs', { params: filters });
    return data;
  },
  
  getById: async (id) => {
    const { data } = await axiosInstance.get(`/jobs/${id}`);
    return data;
  }
};

// Job Applications Layer
export const applicationAPI = {
  apply: async (jobId) => {
    const { data } = await axiosInstance.post(`/applications/apply/${jobId}`);
    return data;
  },
  
  getForJob: async (jobId) => {
    const { data } = await axiosInstance.get(`/applications/job/${jobId}`);
    return data;
  },
  
  getMyApplications: async () => {
    const { data } = await axiosInstance.get('/applications/my-applications');
    return data;
  },
  
  updateStatus: async (id, statusUpdate) => {
    const { data } = await axiosInstance.put(`/applications/${id}/status`, statusUpdate);
    return data; // statusUpdate: { status, feedback }
  }
};

// Interview Scheduler Layer
export const interviewAPI = {
  schedule: async (interviewData) => {
    const { data } = await axiosInstance.post('/interviews', interviewData);
    return data; // interviewData: { applicationId, date, mode, linkOrVenue, roundName }
  },
  
  getMyInterviews: async () => {
    const { data } = await axiosInstance.get('/interviews/my-interviews');
    return data;
  },
  
  getForJob: async (jobId) => {
    const { data } = await axiosInstance.get(`/interviews/job/${jobId}`);
    return data;
  },
  
  update: async (id, interviewData) => {
    const { data } = await axiosInstance.put(`/interviews/${id}`, interviewData);
    return data;
  }
};

// Placement Analytics Layer
export const analyticsAPI = {
  getAdminStats: async () => {
    const { data } = await axiosInstance.get('/analytics/dashboard');
    return data; // Returns overview, applications count, department breakdown
  },
  
  getCompanyStats: async () => {
    const { data } = await axiosInstance.get('/analytics/company');
    return data; // Returns job posts count, applications count, offered count
  }
};

// In-app Notifications Layer
export const notificationAPI = {
  getMyNotifications: async () => {
    const { data } = await axiosInstance.get('/notifications');
    return data;
  },
  
  markAsRead: async (id) => {
    const { data } = await axiosInstance.put(`/notifications/${id}/read`);
    return data;
  },
  
  markAllAsRead: async () => {
    const { data } = await axiosInstance.put('/notifications/read-all');
    return data;
  }
};

// Attendance Logging Layer
export const attendanceAPI = {
  record: async (attendanceData) => {
    const { data } = await axiosInstance.post('/attendance', attendanceData);
    return data; // attendanceData: { eventName, date, records: [{ studentId, status, remarks }] }
  },
  
  getByEvent: async (eventName) => {
    const { data } = await axiosInstance.get('/attendance/event', { params: { eventName } });
    return data;
  },
  
  getStudentAttendance: async (studentId) => {
    const { data } = await axiosInstance.get(`/attendance/student/${studentId}`);
    return data;
  }
};
