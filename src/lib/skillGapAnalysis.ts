import { industryBenchmarks, type RoleBenchmark, type SkillBenchmark } from '../data/industryBenchmarks';

export interface SkillGap {
  skill: string;
  importance: number;
  category: 'core' | 'important' | 'nice-to-have';
  hasSkill: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedLearningTime: string;
}

export interface SkillGapAnalysis {
  targetRole: string;
  overallReadiness: number; // 0-100
  missingCoreSkills: SkillGap[];
  missingImportantSkills: SkillGap[];
  missingNiceToHaveSkills: SkillGap[];
  presentSkills: string[];
  leetCodeGap: {
    current: number;
    required: number;
    gap: number;
    status: 'ahead' | 'on-track' | 'behind';
  };
  projectGap: {
    current: number;
    required: number;
    gap: number;
    status: 'ahead' | 'on-track' | 'behind';
  };
  internshipGap: {
    current: number;
    required: number;
    gap: number;
    status: 'ahead' | 'on-track' | 'behind';
  };
  cgpaStatus: {
    current: number;
    required: number;
    status: 'meets' | 'below';
  };
  recommendations: string[];
  estimatedTimeToReady: string;
  industryDemand: 'high' | 'medium' | 'low';
  avgSalary: string;
}

function normalizeSkillName(skill: string): string {
  return skill.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function hasSkill(userSkills: string[], requiredSkill: string): boolean {
  const normalizedRequired = normalizeSkillName(requiredSkill);
  return userSkills.some(userSkill => {
    const normalizedUser = normalizeSkillName(userSkill);
    return normalizedUser.includes(normalizedRequired) || normalizedRequired.includes(normalizedUser);
  });
}

function calculateGapStatus(current: number, required: number): 'ahead' | 'on-track' | 'behind' {
  if (current >= required) return 'ahead';
  if (current >= required * 0.7) return 'on-track';
  return 'behind';
}

export function analyzeSkillGap(
  userSkills: string[],
  targetRole: string,
  leetCodeSolved: number,
  projectCount: number,
  internshipCount: number,
  cgpa: number
): SkillGapAnalysis {
  const benchmark = industryBenchmarks[targetRole];
  
  if (!benchmark) {
    // Default analysis if role not found
    return {
      targetRole,
      overallReadiness: 50,
      missingCoreSkills: [],
      missingImportantSkills: [],
      missingNiceToHaveSkills: [],
      presentSkills: userSkills,
      leetCodeGap: { current: leetCodeSolved, required: 100, gap: 100 - leetCodeSolved, status: 'on-track' },
      projectGap: { current: projectCount, required: 3, gap: 3 - projectCount, status: 'on-track' },
      internshipGap: { current: internshipCount, required: 1, gap: 1 - internshipCount, status: 'on-track' },
      cgpaStatus: { current: cgpa, required: 7.5, status: cgpa >= 7.5 ? 'meets' : 'below' },
      recommendations: ['Complete your profile to get personalized recommendations'],
      estimatedTimeToReady: '6-12 months',
      industryDemand: 'medium',
      avgSalary: '₹6-10 LPA'
    };
  }

  // Analyze skills
  const missingCoreSkills: SkillGap[] = [];
  const missingImportantSkills: SkillGap[] = [];
  const missingNiceToHaveSkills: SkillGap[] = [];
  const presentSkills: string[] = [];

  benchmark.requiredSkills.forEach(reqSkill => {
    const userHasSkill = hasSkill(userSkills, reqSkill.skill);
    
    if (userHasSkill) {
      presentSkills.push(reqSkill.skill);
    } else {
      const gap: SkillGap = {
        skill: reqSkill.skill,
        importance: reqSkill.importance,
        category: reqSkill.category,
        hasSkill: false,
        priority: reqSkill.category === 'core' ? 'critical' : reqSkill.category === 'important' ? 'high' : 'medium',
        estimatedLearningTime: reqSkill.avgYearsToMaster >= 1 
          ? `${reqSkill.avgYearsToMaster} year${reqSkill.avgYearsToMaster > 1 ? 's' : ''}`
          : `${Math.round(reqSkill.avgYearsToMaster * 12)} months`
      };

      if (reqSkill.category === 'core') {
        missingCoreSkills.push(gap);
      } else if (reqSkill.category === 'important') {
        missingImportantSkills.push(gap);
      } else {
        missingNiceToHaveSkills.push(gap);
      }
    }
  });

  // Calculate overall readiness
  const totalSkills = benchmark.requiredSkills.length;
  const coreSkills = benchmark.requiredSkills.filter(s => s.category === 'core').length;
  const importantSkills = benchmark.requiredSkills.filter(s => s.category === 'important').length;
  
  const coreScore = ((coreSkills - missingCoreSkills.length) / coreSkills) * 40;
  const importantScore = ((importantSkills - missingImportantSkills.length) / importantSkills) * 30;
  const niceToHaveScore = ((totalSkills - coreSkills - importantSkills - missingNiceToHaveSkills.length) / (totalSkills - coreSkills - importantSkills)) * 10;
  
  const leetCodeScore = Math.min((leetCodeSolved / benchmark.avgLeetCodeProblems) * 10, 10);
  const projectScore = Math.min((projectCount / benchmark.avgProjects) * 5, 5);
  const internshipScore = Math.min((internshipCount / benchmark.avgInternships) * 5, 5);

  const overallReadiness = Math.round(coreScore + importantScore + niceToHaveScore + leetCodeScore + projectScore + internshipScore);

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (missingCoreSkills.length > 0) {
    recommendations.push(`🎯 Priority: Learn ${missingCoreSkills.slice(0, 2).map(s => s.skill).join(' and ')} - these are core skills for ${targetRole}`);
  }
  
  if (leetCodeSolved < benchmark.avgLeetCodeProblems) {
    const gap = benchmark.avgLeetCodeProblems - leetCodeSolved;
    recommendations.push(`💻 Solve ${gap} more LeetCode problems to match industry standard (${benchmark.avgLeetCodeProblems} problems)`);
  }
  
  if (projectCount < benchmark.avgProjects) {
    const gap = benchmark.avgProjects - projectCount;
    recommendations.push(`🚀 Build ${gap} more project${gap > 1 ? 's' : ''} showcasing ${missingCoreSkills[0]?.skill || 'your skills'}`);
  }
  
  if (internshipCount < benchmark.avgInternships) {
    recommendations.push(`💼 Gain ${benchmark.avgInternships - internshipCount} internship${benchmark.avgInternships - internshipCount > 1 ? 's' : ''} for industry experience`);
  }

  if (cgpa < benchmark.minCGPA) {
    recommendations.push(`📚 Focus on academics - aim for ${benchmark.minCGPA}+ CGPA (current: ${cgpa})`);
  }

  if (missingImportantSkills.length > 0) {
    recommendations.push(`📖 Learn ${missingImportantSkills[0].skill} to strengthen your profile`);
  }

  // Estimate time to ready
  const criticalGaps = missingCoreSkills.length;
  const estimatedMonths = criticalGaps * 3 + missingImportantSkills.length * 2;
  const estimatedTimeToReady = estimatedMonths >= 12 
    ? `${Math.round(estimatedMonths / 12)} year${estimatedMonths >= 24 ? 's' : ''}`
    : `${estimatedMonths} months`;

  return {
    targetRole,
    overallReadiness,
    missingCoreSkills,
    missingImportantSkills,
    missingNiceToHaveSkills,
    presentSkills,
    leetCodeGap: {
      current: leetCodeSolved,
      required: benchmark.avgLeetCodeProblems,
      gap: Math.max(0, benchmark.avgLeetCodeProblems - leetCodeSolved),
      status: calculateGapStatus(leetCodeSolved, benchmark.avgLeetCodeProblems)
    },
    projectGap: {
      current: projectCount,
      required: benchmark.avgProjects,
      gap: Math.max(0, benchmark.avgProjects - projectCount),
      status: calculateGapStatus(projectCount, benchmark.avgProjects)
    },
    internshipGap: {
      current: internshipCount,
      required: benchmark.avgInternships,
      gap: Math.max(0, benchmark.avgInternships - internshipCount),
      status: calculateGapStatus(internshipCount, benchmark.avgInternships)
    },
    cgpaStatus: {
      current: cgpa,
      required: benchmark.minCGPA,
      status: cgpa >= benchmark.minCGPA ? 'meets' : 'below'
    },
    recommendations,
    estimatedTimeToReady,
    industryDemand: benchmark.industryDemand,
    avgSalary: benchmark.avgSalary
  };
}
