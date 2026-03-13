import type { AdminEligibilityRule } from '../../types/eligibilityAdmin';
import type { AdminStudentProfile } from '../../types/studentAdmin';

export interface EvaluationFailure {
    student: AdminStudentProfile;
    reasons: string[];
}

export interface RuleEvaluationResult {
    eligible: AdminStudentProfile[];
    ineligible: EvaluationFailure[];
}

export const evaluateStudentEligibility = (
    student: AdminStudentProfile,
    rule: AdminEligibilityRule
): { isEligible: boolean; failureReasons: string[] } => {
    let passed = true;
    const failureReasons: string[] = [];

    // 1. Min CGPA Validation
    if (student.cgpa < rule.minCGPA) {
        passed = false;
        failureReasons.push(`CGPA ${student.cgpa} < ${rule.minCGPA}`);
    }

    // 2. Department Demographic Allowances
    if (rule.allowedDepartments.length > 0 && !rule.allowedDepartments.includes(student.department)) {
        passed = false;
        failureReasons.push(`Dept ${student.department} not allowed`);
    }

    // 3. Year Demographic Allowances
    if (rule.allowedYears.length > 0 && !rule.allowedYears.includes(student.currentYear)) {
        passed = false;
        failureReasons.push(`Year ${student.currentYear} not allowed`);
    }

    // 4. Backlog Triggers
    const activeBacklogs = student.activeBacklogs || 0;
    if (activeBacklogs > rule.maxActiveBacklogs) {
        passed = false;
        failureReasons.push(`Active backlogs > ${rule.maxActiveBacklogs}`);
    }

    const historyBacklogs = student.historyBacklogs || 0;
    if (historyBacklogs > rule.maxHistoryBacklogs) {
        passed = false;
        failureReasons.push(`History backlogs > ${rule.maxHistoryBacklogs}`);
    }

    // 5. Hard Meta Dependencies
    if (rule.requiresResumeApproval && student.resumeStatus !== 'approved') {
        passed = false;
        failureReasons.push(`Resume not approved`);
    }

    if (rule.mandatoryInternship && !student.internshipCompleted) {
        passed = false;
        failureReasons.push(`Prior internship required`);
    }

    return {
        isEligible: passed,
        failureReasons
    };
};

export const evaluateCohortEligibility = (
    students: AdminStudentProfile[],
    rule: AdminEligibilityRule
): RuleEvaluationResult => {
    const eligible: AdminStudentProfile[] = [];
    const ineligible: EvaluationFailure[] = [];

    for (const student of students) {
        const { isEligible, failureReasons } = evaluateStudentEligibility(student, rule);

        if (isEligible) {
            eligible.push(student);
        } else {
            ineligible.push({ student, reasons: failureReasons });
        }
    }

    return { eligible, ineligible };
};
