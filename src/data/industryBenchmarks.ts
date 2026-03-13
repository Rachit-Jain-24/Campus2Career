// Industry Skill Benchmarks - Based on real job market data
export interface SkillBenchmark {
  skill: string;
  importance: number; // 1-5 scale
  category: 'core' | 'important' | 'nice-to-have';
  avgYearsToMaster: number;
}

export interface RoleBenchmark {
  role: string;
  requiredSkills: SkillBenchmark[];
  avgLeetCodeProblems: number;
  avgProjects: number;
  avgInternships: number;
  minCGPA: number;
  industryDemand: 'high' | 'medium' | 'low';
  avgSalary: string;
}

export const industryBenchmarks: Record<string, RoleBenchmark> = {
  'Full-Stack Developer': {
    role: 'Full-Stack Developer',
    requiredSkills: [
      { skill: 'JavaScript', importance: 5, category: 'core', avgYearsToMaster: 1.5 },
      { skill: 'React', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'Node.js', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'HTML', importance: 4, category: 'core', avgYearsToMaster: 0.5 },
      { skill: 'CSS', importance: 4, category: 'core', avgYearsToMaster: 0.5 },
      { skill: 'MongoDB', importance: 4, category: 'important', avgYearsToMaster: 0.5 },
      { skill: 'PostgreSQL', importance: 4, category: 'important', avgYearsToMaster: 0.5 },
      { skill: 'Git', importance: 5, category: 'core', avgYearsToMaster: 0.5 },
      { skill: 'REST API', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'TypeScript', importance: 3, category: 'nice-to-have', avgYearsToMaster: 0.5 },
      { skill: 'Docker', importance: 3, category: 'nice-to-have', avgYearsToMaster: 0.5 },
    ],
    avgLeetCodeProblems: 100,
    avgProjects: 3,
    avgInternships: 1,
    minCGPA: 7.5,
    industryDemand: 'high',
    avgSalary: '₹6-12 LPA'
  },
  'Data Scientist': {
    role: 'Data Scientist',
    requiredSkills: [
      { skill: 'Python', importance: 5, category: 'core', avgYearsToMaster: 1.5 },
      { skill: 'Machine Learning', importance: 5, category: 'core', avgYearsToMaster: 2 },
      { skill: 'Pandas', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'NumPy', importance: 4, category: 'core', avgYearsToMaster: 0.5 },
      { skill: 'Scikit-learn', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'SQL', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'Statistics', importance: 5, category: 'core', avgYearsToMaster: 2 },
      { skill: 'Data Visualization', importance: 4, category: 'important', avgYearsToMaster: 0.5 },
      { skill: 'TensorFlow', importance: 3, category: 'nice-to-have', avgYearsToMaster: 1 },
      { skill: 'PyTorch', importance: 3, category: 'nice-to-have', avgYearsToMaster: 1 },
    ],
    avgLeetCodeProblems: 80,
    avgProjects: 4,
    avgInternships: 1,
    minCGPA: 8.0,
    industryDemand: 'high',
    avgSalary: '₹8-15 LPA'
  },
  'Backend Engineer': {
    role: 'Backend Engineer',
    requiredSkills: [
      { skill: 'Java', importance: 5, category: 'core', avgYearsToMaster: 2 },
      { skill: 'Spring Boot', importance: 5, category: 'core', avgYearsToMaster: 1.5 },
      { skill: 'System Design', importance: 5, category: 'core', avgYearsToMaster: 2 },
      { skill: 'SQL', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'REST API', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'Microservices', importance: 4, category: 'important', avgYearsToMaster: 1.5 },
      { skill: 'Docker', importance: 4, category: 'important', avgYearsToMaster: 0.5 },
      { skill: 'Kubernetes', importance: 3, category: 'nice-to-have', avgYearsToMaster: 1 },
      { skill: 'AWS', importance: 4, category: 'important', avgYearsToMaster: 1 },
      { skill: 'Redis', importance: 3, category: 'nice-to-have', avgYearsToMaster: 0.5 },
    ],
    avgLeetCodeProblems: 150,
    avgProjects: 3,
    avgInternships: 2,
    minCGPA: 7.5,
    industryDemand: 'high',
    avgSalary: '₹7-14 LPA'
  },
  'AI/ML Engineer': {
    role: 'AI/ML Engineer',
    requiredSkills: [
      { skill: 'Python', importance: 5, category: 'core', avgYearsToMaster: 2 },
      { skill: 'Machine Learning', importance: 5, category: 'core', avgYearsToMaster: 2 },
      { skill: 'Deep Learning', importance: 5, category: 'core', avgYearsToMaster: 2 },
      { skill: 'TensorFlow', importance: 5, category: 'core', avgYearsToMaster: 1.5 },
      { skill: 'PyTorch', importance: 5, category: 'core', avgYearsToMaster: 1.5 },
      { skill: 'NLP', importance: 4, category: 'important', avgYearsToMaster: 1.5 },
      { skill: 'Computer Vision', importance: 4, category: 'important', avgYearsToMaster: 1.5 },
      { skill: 'Mathematics', importance: 5, category: 'core', avgYearsToMaster: 2 },
      { skill: 'MLOps', importance: 3, category: 'nice-to-have', avgYearsToMaster: 1 },
      { skill: 'Research', importance: 4, category: 'important', avgYearsToMaster: 2 },
    ],
    avgLeetCodeProblems: 120,
    avgProjects: 5,
    avgInternships: 2,
    minCGPA: 8.5,
    industryDemand: 'high',
    avgSalary: '₹10-20 LPA'
  },
  'Frontend Developer': {
    role: 'Frontend Developer',
    requiredSkills: [
      { skill: 'JavaScript', importance: 5, category: 'core', avgYearsToMaster: 1.5 },
      { skill: 'React', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'HTML', importance: 5, category: 'core', avgYearsToMaster: 0.5 },
      { skill: 'CSS', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'TypeScript', importance: 4, category: 'important', avgYearsToMaster: 0.5 },
      { skill: 'Responsive Design', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'Git', importance: 4, category: 'core', avgYearsToMaster: 0.5 },
      { skill: 'Webpack', importance: 3, category: 'nice-to-have', avgYearsToMaster: 0.5 },
      { skill: 'Testing', importance: 4, category: 'important', avgYearsToMaster: 1 },
    ],
    avgLeetCodeProblems: 80,
    avgProjects: 4,
    avgInternships: 1,
    minCGPA: 7.0,
    industryDemand: 'high',
    avgSalary: '₹5-10 LPA'
  },
  'DevOps Engineer': {
    role: 'DevOps Engineer',
    requiredSkills: [
      { skill: 'Linux', importance: 5, category: 'core', avgYearsToMaster: 1.5 },
      { skill: 'Docker', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'Kubernetes', importance: 5, category: 'core', avgYearsToMaster: 1.5 },
      { skill: 'CI/CD', importance: 5, category: 'core', avgYearsToMaster: 1 },
      { skill: 'AWS', importance: 5, category: 'core', avgYearsToMaster: 1.5 },
      { skill: 'Terraform', importance: 4, category: 'important', avgYearsToMaster: 1 },
      { skill: 'Monitoring', importance: 4, category: 'important', avgYearsToMaster: 1 },
      { skill: 'Scripting', importance: 5, category: 'core', avgYearsToMaster: 1 },
    ],
    avgLeetCodeProblems: 60,
    avgProjects: 3,
    avgInternships: 1,
    minCGPA: 7.5,
    industryDemand: 'high',
    avgSalary: '₹8-16 LPA'
  }
};

// Skill categories for analysis
export const skillCategories = {
  'Programming Languages': ['Python', 'Java', 'JavaScript', 'C++', 'TypeScript', 'Go'],
  'Frontend': ['React', 'Angular', 'Vue', 'HTML', 'CSS', 'Responsive Design'],
  'Backend': ['Node.js', 'Spring Boot', 'Django', 'Flask', 'Express', 'REST API'],
  'Database': ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQL'],
  'AI/ML': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'],
  'Data Science': ['Pandas', 'NumPy', 'Scikit-learn', 'Statistics', 'Data Visualization'],
  'DevOps': ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Terraform'],
  'Tools': ['Git', 'Testing', 'Monitoring', 'Scripting']
};
