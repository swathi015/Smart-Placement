const calculateEligibility = (student, job) => {
  const reasons = [];
  let eligible = true;

  // Check CGPA
  if (student.cgpa < job.minCGPA) {
    eligible = false;
    reasons.push(`CGPA is ${student.cgpa}, but minimum required is ${job.minCGPA}`);
  }

  // Check Backlogs
  if (student.backlogs > job.maxBacklogs) {
    eligible = false;
    reasons.push(`Student has ${student.backlogs} backlog(s), but maximum allowed is ${job.maxBacklogs}`);
  }

  // Check Skills (Optional checks: e.g. student should possess at least one or all required skills)
  if (job.skillsRequired && job.skillsRequired.length > 0) {
    const studentSkillsLower = student.skills.map((s) => s.toLowerCase());
    const missingSkills = job.skillsRequired.filter(
      (skill) => !studentSkillsLower.includes(skill.toLowerCase())
    );

    if (missingSkills.length > 0) {
      // We can make this advisory or strict. Let's make it strict or just document it.
      // Let's assume strict skills are required, or at least one is needed. Let's make it strict:
      eligible = false;
      reasons.push(`Missing required skills: ${missingSkills.join(', ')}`);
    }
  }

  return {
    eligible,
    reasons,
  };
};

export default calculateEligibility;