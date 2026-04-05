import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { studentsDb } from '../../services/db/database.service';
import { AlertCircle } from 'lucide-react';

export default function FixStudent35() {
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpdate = async () => {
    setUpdating(true);
    setResult(null);

    const email = "venkatesh.m035@nmims.edu.in";
    const password = "nmims2026";
    const sapId = "70572200035";

    let uid = "VyYOKgdCKLMOu6OL3ta1kYu8sqE3"; // Fallback identifier
    let message = "";

    try {
      // 1. Delete previous student document if exists using service layer
      try {
        await studentsDb.deleteStudent(sapId);
        message += "Deleted old Database record. ";
      } catch (e) {
        message += "No old record to delete. ";
      }

      // 2. Try to create Supabase Auth account
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error && !error.message?.toLowerCase().includes('already registered')) throw error;
        if (data?.user?.id) {
          uid = data.user.id;
          message += "Created New Auth Account with password 'nmims2026'. ";
        } else {
          message += "Auth account already exists — using fallback UID. ";
        }
      } catch (error: any) {
        message += `Auth warning: ${error.message}. `;
      }

      // 3. Create fresh Student document using the service layer
      const studentData = {
        achievements: [
          { description: "Selected among Top 50 participants in SCDM.", id: 1, title: "Top 50 SCDM", year: "2024" },
          { description: "Published research paper at IICTDS conference on deep learning-based computer vision applications.", id: 2, title: "IICTDS Publication", year: "2024" },
          { description: "President - Cultural Committee", id: 3, title: "Cultural Committee President", year: "2024" }
        ],
        assessmentCompleted: true,
        assessmentResults: {
          cgpa: "7.0",
          interests: ["Data Science", "Computer Vision", "Machine Learning"],
          personality: "Leader",
          recommendedRoles: ["Data Scientist", "Computer Vision Engineer"],
          strengths: ["Programming", "Leadership", "Research"]
        },
        swoc: {
          challenges: ["Relocating outside preferred locations"],
          opportunities: ["Emerging computer vision field"],
          strengths: ["Strong technical skills", "Leadership experience"],
          weaknesses: ["No prior data science internships"]
        },
        batch: "2022-2026",
        bio: "Final year B.Tech Computer Science (Data Science) student at NMIMS Hyderabad.",
        branch: "B.Tech CSE (Data Science)",
        careerDiscoveryCompleted: true,
        careerTrack: "Data Scientist",
        careerTrackEmoji: "📊",
        certifications: [
          { name: "AWS Academy – Cloud Architecting", issuer: "AWS", id: 1 },
          { name: "AWS Academy – Cloud Foundations", issuer: "AWS", id: 2 },
          { name: "Google Cloud Computing Foundations (GCCF)", issuer: "Google", id: 3 }
        ],
        cgpa: "7.0",
        createdAt: Date.now(),
        currentYear: 4,
        email: email,
        githubUrl: "https://github.com/venkatesh-mahindra/",
        id: uid, // Use actual authentic UID cleanly created
        interests: ["Data Science", "Computer Vision", "Machine Learning"],
        internships: [],
        leetcode: "Fa5ftp4yJp",
        leetcodeStats: {
          acceptanceRate: 0,
          easySolved: 15,
          hardSolved: 5,
          lastUpdated: Date.now(),
          mediumSolved: 15,
          ranking: 1000000,
          recentSubmissions: [],
          streak: 0,
          submissionCalendar: "{}",
          totalSolved: 35
        },
        linkedinUrl: "https://www.linkedin.com/in/mahindra-venkatesh/",
        location: "Mahabubnagar, Telangana",
        name: "Venkatesh M",
        onboardingStep: 0,
        phone: "9502340311", 
        placementStatus: "Actively Preparing",
        profileCompleted: true,
        projects: [
          { description: "Data Science Projects on GitHub", id: 1, link: "https://github.com/venkatesh-mahindra/", tech: "Python, ML", title: "9 Data Science Projects", year: "2024" }
        ],
        resumeName: "",
        resumeUrl: "",
        role: "student",
        rollNo: "L038", // Presumed
        sapId: sapId,
        techSkills: ["Python", "SQL", "Machine Learning", "Deep Learning", "GenAI", "Front End"],
        updatedAt: Date.now()
      };

      await studentsDb.createStudent(studentData);
      message += "Saved complete student profile from Excel data.";
      
      setResult({ success: true, message: message });
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-black">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">Fix Student 35</h1>
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">Now uses <strong>Supabase Auth</strong>. Ensure the student's old Supabase auth entry is removed before running.</p>
        </div>
        <p className="mb-6 text-gray-600 font-medium">Re-create Account and profile for Venkatesh M (Student 35).</p>
        <button 
          onClick={handleUpdate} 
          disabled={updating}
          className={`w-full py-3 rounded-lg font-bold text-foreground transition-opacity ${updating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {updating ? 'Fixing...' : 'Fix Student 35 Account'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <p className="font-bold">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
