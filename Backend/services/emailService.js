import { createTransport } from 'nodemailer';

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Create transporter
    const transporter = createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Smart Placement Server'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@smartplacement.com'}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    // Do not throw so that it doesn't break the application flow, but return null
    return null;
  }
};

const sendInterviewScheduleEmail = async (studentEmail, studentName, interviewDetails) => {
  const { jobTitle, companyName, date, mode, linkOrVenue, roundName } = interviewDetails;
  
  const subject = `Interview Scheduled for ${jobTitle} at ${companyName}`;
  const text = `Hi ${studentName},\n\nYour interview for the post of ${jobTitle} at ${companyName} has been scheduled.\nRound: ${roundName}\nDate: ${date}\nMode: ${mode}\nVenue/Link: ${linkOrVenue}\n\nGood luck!`;
  const html = `
    <h3>Hi ${studentName},</h3>
    <p>Your interview for the post of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been scheduled.</p>
    <ul>
      <li><strong>Round:</strong> ${roundName}</li>
      <li><strong>Date & Time:</strong> ${date}</li>
      <li><strong>Mode:</strong> ${mode}</li>
      <li><strong>Venue / Link:</strong> ${linkOrVenue}</li>
    </ul>
    <p>Good luck!</p>
    <br/>
    <p>Best regards,<br/>Smart Placement Team</p>
  `;

  return await sendEmail({ to: studentEmail, subject, text, html });
};

const sendJobAlertEmail = async (studentEmail, studentName, jobDetails) => {
  const { title, companyName, packageLPA, minCGPA, deadline } = jobDetails;

  const subject = `New Job Posting: ${title} at ${companyName}`;
  const text = `Hi ${studentName},\n\nA new job matching your profile has been posted.\nPosition: ${title}\nCompany: ${companyName}\nPackage: ${packageLPA} LPA\nMin CGPA: ${minCGPA}\nDeadline: ${deadline}\n\nPlease log in and apply if eligible.`;
  const html = `
    <h3>Hi ${studentName},</h3>
    <p>A new job posting is active on the Smart Placement Portal:</p>
    <ul>
      <li><strong>Position:</strong> ${title}</li>
      <li><strong>Company:</strong> ${companyName}</li>
      <li><strong>Package:</strong> ${packageLPA} LPA</li>
      <li><strong>Min CGPA Requirement:</strong> ${minCGPA}</li>
      <li><strong>Deadline to Apply:</strong> ${deadline}</li>
    </ul>
    <p>Log in to your dashboard to review full criteria and submit your application.</p>
    <br/>
    <p>Best regards,<br/>Smart Placement Team</p>
  `;

  return await sendEmail({ to: studentEmail, subject, text, html });
};

const sendApplicationStatusEmail = async (studentEmail, studentName, statusDetails) => {
  const { jobTitle, companyName, status, feedback } = statusDetails;

  const subject = `Application Status Updated: ${jobTitle} at ${companyName}`;
  const text = `Hi ${studentName},\n\nYour application status for ${jobTitle} at ${companyName} has been updated to: ${status.toUpperCase()}.\nFeedback: ${feedback || 'None'}\n\nPlease check the portal for details.`;
  const html = `
    <h3>Hi ${studentName},</h3>
    <p>Your application status for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to:</p>
    <h4 style="color: #2e7d32;">${status.toUpperCase()}</h4>
    ${feedback ? `<p><strong>Feedback from Recruiter:</strong> ${feedback}</p>` : ''}
    <p>Please check the portal for additional next steps.</p>
    <br/>
    <p>Best regards,<br/>Smart Placement Team</p>
  `;

  return await sendEmail({ to: studentEmail, subject, text, html });
};

export {
  sendEmail,
  sendInterviewScheduleEmail,
  sendJobAlertEmail,
  sendApplicationStatusEmail,
};