import React, { useState, useEffect } from 'react';
import { studentAPI, attendanceAPI } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  ClipboardCheck, 
  Search, 
  Save, 
  Calendar,
  User,
  Activity
} from 'lucide-react';

const AttendanceTracker = () => {
  const { user } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [records, setRecords] = useState({}); // studentId -> 'Present' or 'Absent'
  const [remarks, setRemarks] = useState({}); // studentId -> remark text
  
  // Search query state
  const [searchEventName, setSearchEventName] = useState('');
  const [searchResult, setSearchResult] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadStudents = async () => {
    try {
      const studentList = await studentAPI.getAllStudents();
      setStudents(studentList);
      
      // Initialize records to 'Present' for all students
      const initialRecords = {};
      const initialRemarks = {};
      studentList.forEach((s) => {
        initialRecords[s._id] = 'Present';
        initialRemarks[s._id] = '';
      });
      setRecords(initialRecords);
      setRemarks(initialRemarks);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch student database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleStatusChange = (studentId, status) => {
    setRecords({ ...records, [studentId]: status });
  };

  const handleRemarkChange = (studentId, text) => {
    setRemarks({ ...remarks, [studentId]: text });
  };

  const handleRecordAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!eventName || !eventDate) {
      setError('Please provide event name and event date.');
      return;
    }

    setActionLoading(true);
    
    // Format records payload
    const formattedRecords = students.map((s) => ({
      studentId: s._id,
      status: records[s._id] || 'Present',
      remarks: remarks[s._id] || '',
    }));

    const payload = {
      eventName,
      date: eventDate,
      records: formattedRecords,
    };

    try {
      await attendanceAPI.record(payload);
      setSuccess('Attendance logs recorded successfully in database!');
      setEventName('');
      setEventDate('');
    } catch (err) {
      console.error(err);
      setError('Failed to log attendance records.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearchAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!searchEventName) {
      setError('Please enter an event name to search.');
      return;
    }

    setLoading(true);
    try {
      const results = await attendanceAPI.getByEvent(searchEventName);
      setSearchResult(results);
      if (results.length === 0) {
        setSuccess('No attendance records found for this event name.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch logs for this event.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && students.length === 0) return <Loader message="Accessing database registers..." />;

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
      {/* Attendance Recorder Grid Section */}
      <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ClipboardCheck style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '18px', margin: 0 }}>Record Placement Drive Attendance</h2>
        </div>

        {error && <Alert type="danger" message={error} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleRecordAttendance}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="eventName">Event Name</label>
              <input
                id="eventName"
                type="text"
                className="form-control"
                placeholder="e.g. Google PPT, Stripe Test"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="eventDate">Event Date</label>
              <input
                id="eventDate"
                type="date"
                className="form-control"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
            <table className="custom-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Attendance</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td><strong>{student.user.name}</strong></td>
                    <td>{student.rollNumber}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className={`btn ${records[student._id] === 'Present' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => handleStatusChange(student._id, 'Present')}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          className={`btn ${records[student._id] === 'Absent' ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => handleStatusChange(student._id, 'Absent')}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        placeholder="Remarks (optional)"
                        value={remarks[student._id] || ''}
                        onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={actionLoading || students.length === 0}>
            <Save size={16} /> {actionLoading ? 'Recording Logs...' : 'Submit Attendance Records'}
          </button>
        </form>
      </section>

      {/* Attendance Query Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search style={{ color: 'var(--secondary)' }} />
            <h2 style={{ fontSize: '18px', margin: 0 }}>Search Event Records</h2>
          </div>

          <form onSubmit={handleSearchAttendance}>
            <div className="form-group">
              <label className="form-label" htmlFor="searchEventName">Event Name</label>
              <input
                id="searchEventName"
                type="text"
                className="form-control"
                placeholder="Enter exact event name"
                value={searchEventName}
                onChange={(e) => setSearchEventName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
              Fetch Records
            </button>
          </form>
        </div>

        {/* Display Search Results */}
        {searchResult.length > 0 && (
          <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', margin: 0 }}>Results for "{searchEventName}"</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {searchResult.map((record) => (
                <div key={record._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid var(--card-border)',
                  fontSize: '13px'
                }}>
                  <div>
                    <strong>{record.student?.user?.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roll: {record.student?.rollNumber}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className={`badge badge-${record.status === 'Present' ? 'success' : 'danger'}`}>
                      {record.status}
                    </span>
                    {record.remarks && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{record.remarks}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AttendanceTracker;
