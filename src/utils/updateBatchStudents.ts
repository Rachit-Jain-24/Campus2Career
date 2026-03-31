import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Updated batch students data with correct information
const updatedStudentsData = [
    {
        srNo: 1,
        sapId: "70572200001",
        fullName: "Kapperi Divya Sri",
        email: "divya.sri010@nmims.edu.in",
        leetcodeUsername: "Divya_sri_Kapperi",
        leetcodeSolved: 28,
        githubUrl: "https://github.com/DivyaReddy0561",
        githubProjects: 2,
        projects: [
            { id: 1, title: "Healthcare Data Analysis System", tech: "Python, Pandas, Scikit-learn", description: "ML-based healthcare analytics platform", link: "https://github.com/DivyaReddy0561", year: "2024" },
            { id: 2, title: "Student Performance Predictor", tech: "Python, TensorFlow, Flask", description: "Predictive model for student outcomes", link: "https://github.com/DivyaReddy0561", year: "2024" }
        ]
    },
    {
        srNo: 2,
        sapId: "70572200002",
        fullName: "Pavithra Sevakula",
        email: "pavithra.sevakula011@nmims.edu.in",
        leetcodeUsername: "pavithrasevakula011",
        leetcodeSolved: 23,
        githubUrl: "https://github.com/Pavithrasevakula",
        githubProjects: 5,
        projects: [
            { id: 1, title: "E-commerce Recommendation Engine", tech: "Python, Collaborative Filtering, Flask", description: "Product recommendation system", link: "https://github.com/Pavithrasevakula", year: "2024" },
            { id: 2, title: "Sentiment Analysis Dashboard", tech: "Python, NLP, Streamlit", description: "Real-time sentiment analysis tool", link: "https://github.com/Pavithrasevakula", year: "2024" },
            { id: 3, title: "Image Classification CNN", tech: "Python, TensorFlow, Keras", description: "Deep learning image classifier", link: "https://github.com/Pavithrasevakula", year: "2024" },
            { id: 4, title: "Sales Forecasting Model", tech: "Python, ARIMA, Prophet", description: "Time series forecasting system", link: "https://github.com/Pavithrasevakula", year: "2024" },
            { id: 5, title: "Customer Churn Prediction", tech: "Python, XGBoost, Pandas", description: "ML model for churn prediction", link: "https://github.com/Pavithrasevakula", year: "2024" }
        ]
    },
    {
        srNo: 3,
        sapId: "70572200003",
        fullName: "M.Vaishnavi",
        email: "vaishnavi.m012@nmims.edu.in",
        leetcodeUsername: "Maddi_Vaishnavi",
        leetcodeSolved: 34,
        githubUrl: "https://github.com/Maddi-vaishnavi",
        githubProjects: 2,
        projects: [
            { id: 1, title: "Fraud Detection System", tech: "Python, Random Forest, Scikit-learn", description: "ML-based fraud detection", link: "https://github.com/Maddi-vaishnavi", year: "2024" },
            { id: 2, title: "Weather Prediction Model", tech: "Python, LSTM, TensorFlow", description: "Deep learning weather forecasting", link: "https://github.com/Maddi-vaishnavi", year: "2024" }
        ]
    },
    {
        srNo: 4,
        sapId: "70572200004",
        fullName: "Akula Srinithya",
        email: "sri.nithya013@nmims.edu.in",
        leetcodeUsername: "Akula_Srinithya",
        leetcodeSolved: 38,
        githubUrl: "https://github.com/AkulaSrinithya24/GITHUB",
        githubProjects: 5,
        projects: [
            { id: 1, title: "Traffic Flow Prediction", tech: "Python, LSTM, Keras", description: "Urban traffic prediction system", link: "https://github.com/AkulaSrinithya24", year: "2024" },
            { id: 2, title: "Medical Diagnosis Assistant", tech: "Python, Decision Trees, Flask", description: "AI-powered diagnosis tool", link: "https://github.com/AkulaSrinithya24", year: "2024" },
            { id: 3, title: "Stock Price Analyzer", tech: "Python, ARIMA, Plotly", description: "Financial data analysis tool", link: "https://github.com/AkulaSrinithya24", year: "2024" },
            { id: 4, title: "Spam Email Classifier", tech: "Python, Naive Bayes, NLP", description: "Email spam detection system", link: "https://github.com/AkulaSrinithya24", year: "2024" },
            { id: 5, title: "Face Recognition System", tech: "Python, OpenCV, Deep Learning", description: "Real-time face recognition", link: "https://github.com/AkulaSrinithya24", year: "2024" }
        ]
    },
    {
        srNo: 5,
        sapId: "70572200005",
        fullName: "K.Manishankar Goud",
        email: "manishankar.goud014@nmims.edu.in",
        leetcodeUsername: "Kistaram_Manishankar_Goud",
        leetcodeSolved: 23,
        githubUrl: "https://github.com/Kistaram-Manishankar-Goud",
        githubProjects: 2,
        projects: [
            { id: 1, title: "Crop Yield Prediction", tech: "Python, Regression Models, Pandas", description: "Agricultural yield forecasting", link: "https://github.com/Kistaram-Manishankar-Goud", year: "2024" },
            { id: 2, title: "Energy Consumption Optimizer", tech: "Python, ML, Streamlit", description: "Smart energy management system", link: "https://github.com/Kistaram-Manishankar-Goud", year: "2024" }
        ]
    },
    {
        srNo: 6,
        sapId: "70572200006",
        fullName: "Jahnavi Maddi",
        email: "jahnavi.m015@nmims.edu.in",
        leetcodeUsername: "Maddi_Jahnavi",
        leetcodeSolved: 37,
        githubUrl: "https://github.com/Maddi-Jahnavi-goud",
        githubProjects: 4,
        projects: [
            { id: 1, title: "Hotel Booking Prediction", tech: "Python, Logistic Regression, Flask", description: "Booking cancellation predictor", link: "https://github.com/Maddi-Jahnavi-goud", year: "2024" },
            { id: 2, title: "Text Summarization Tool", tech: "Python, NLP, Transformers", description: "Automatic text summarizer", link: "https://github.com/Maddi-Jahnavi-goud", year: "2024" },
            { id: 3, title: "Movie Recommendation System", tech: "Python, Content-Based Filtering", description: "Personalized movie recommender", link: "https://github.com/Maddi-Jahnavi-goud", year: "2024" },
            { id: 4, title: "Air Quality Predictor", tech: "Python, Time Series, Plotly", description: "Environmental data analysis", link: "https://github.com/Maddi-Jahnavi-goud", year: "2024" }
        ]
    },
    {
        srNo: 8,
        sapId: "70572200008",
        fullName: "Charala Pujitha",
        email: "pujitha.ch017@nmims.edu.in",
        leetcodeUsername: "CharalaPujitha",
        leetcodeSolved: 30,
        githubUrl: "https://github.com/Charalapujitha",
        githubProjects: 3,
        projects: [
            { id: 1, title: "Rupee-Gram Calculator App", tech: "Android, Java, SQLite", description: "Currency conversion mobile app", link: "https://github.com/Charalapujitha", year: "2024" },
            { id: 2, title: "Disease Outbreak Predictor", tech: "Python, ML, Pandas", description: "Epidemiological forecasting tool", link: "https://github.com/Charalapujitha", year: "2024" },
            { id: 3, title: "Smart Attendance System", tech: "Python, Face Recognition, Flask", description: "Automated attendance tracker", link: "https://github.com/Charalapujitha", year: "2024" }
        ]
    },
    {
        srNo: 9,
        sapId: "70572200009",
        fullName: "J. Thrisha Reddy",
        email: "thrisha.reddy026@nmims.edu.in",
        leetcodeUsername: "Thrisha_1203",
        leetcodeSolved: 25,
        githubUrl: "https://github.com/thrisha1217",
        githubProjects: 6,
        projects: [
            { id: 1, title: "Smart Lighting IoT System", tech: "Python, IoT, Arduino", description: "Automated lighting control", link: "https://github.com/thrisha1217", year: "2024" },
            { id: 2, title: "Sleep Apnea Detection", tech: "Python, CNN, ECG Analysis", description: "Medical diagnosis using deep learning", link: "https://github.com/thrisha1217", year: "2024" },
            { id: 3, title: "Credit Risk Assessment", tech: "Python, Ensemble Methods, Pandas", description: "Financial risk prediction model", link: "https://github.com/thrisha1217", year: "2024" },
            { id: 4, title: "Voice Assistant Bot", tech: "Python, Speech Recognition, NLP", description: "AI-powered voice assistant", link: "https://github.com/thrisha1217", year: "2024" },
            { id: 5, title: "Handwriting Recognition", tech: "Python, CNN, TensorFlow", description: "OCR for handwritten text", link: "https://github.com/thrisha1217", year: "2024" },
            { id: 6, title: "News Article Classifier", tech: "Python, NLP, Scikit-learn", description: "Automated news categorization", link: "https://github.com/thrisha1217", year: "2024" }
        ]
    },
    {
        srNo: 10,
        sapId: "70572200010",
        fullName: "Harsh Bang",
        email: "harsh.bang027@nmims.edu.in",
        leetcodeUsername: "Harsh_Bang",
        leetcodeSolved: 90,
        githubUrl: "https://github.com/HarshBang",
        githubProjects: 6,
        projects: [
            { id: 1, title: "PyGPA Analyzer", tech: "Python, Tkinter, SQLite", description: "Student GPA management system (300+ users)", link: "https://github.com/HarshBang", year: "2023" },
            { id: 2, title: "Real Estate Price Predictor", tech: "Python, Regression, Flask", description: "Property price estimation tool", link: "https://github.com/HarshBang", year: "2024" },
            { id: 3, title: "Chatbot with NLP", tech: "Python, NLTK, Deep Learning", description: "Conversational AI assistant", link: "https://github.com/HarshBang", year: "2024" },
            { id: 4, title: "Loan Approval System", tech: "Python, Classification, Streamlit", description: "Automated loan decision tool", link: "https://github.com/HarshBang", year: "2024" },
            { id: 5, title: "Object Detection App", tech: "Python, YOLO, OpenCV", description: "Real-time object detection", link: "https://github.com/HarshBang", year: "2024" },
            { id: 6, title: "Music Genre Classifier", tech: "Python, Audio Processing, ML", description: "Audio classification system", link: "https://github.com/HarshBang", year: "2024" }
        ]
    }
];

// Function to update a single student's data
async function updateStudentData(studentData: any) {
    try {
        const sapId = studentData.sapId;
        const userRef = doc(db, 'users', sapId);
        
        // Check if document exists
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
            console.log(`⚠ Student ${studentData.fullName} (${sapId}) not found in database`);
            return { success: false, reason: 'not_found' };
        }
        
        // Update only the fields that need correction
        await updateDoc(userRef, {
            leetcode: studentData.leetcodeUsername,
            leetcodeStats: null, // Reset stats to fetch fresh data
            projects: studentData.projects,
            githubUrl: studentData.githubUrl,
            updatedAt: Date.now()
        });
        
        console.log(`✓ Updated ${studentData.fullName} (${sapId})`);
        return { success: true };
        
    } catch (error: any) {
        console.error(`✗ Failed to update ${studentData.fullName}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Main update function
export async function updateAllBatchStudents() {
    const results = {
        success: [] as string[],
        notFound: [] as string[],
        failed: [] as { name: string; error: string }[],
        total: updatedStudentsData.length
    };
    
    console.log(`\n🔄 Starting to update ${updatedStudentsData.length} batch student records...\n`);
    
    for (const student of updatedStudentsData) {
        const result = await updateStudentData(student);
        
        if (result.success) {
            results.success.push(student.fullName);
        } else if (result.reason === 'not_found') {
            results.notFound.push(student.fullName);
        } else {
            results.failed.push({
                name: student.fullName,
                error: result.error || 'Unknown error'
            });
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${results.success.length}/${results.total}`);
    console.log(`⚠️  Not found: ${results.notFound.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log('='.repeat(60) + '\n');
    
    if (results.notFound.length > 0) {
        console.log('⚠️  Students not found in database:');
        results.notFound.forEach(name => console.log(`   - ${name}`));
        console.log('');
    }
    
    if (results.failed.length > 0) {
        console.log('❌ Failed updates:');
        results.failed.forEach(({ name, error }) => console.log(`   - ${name}: ${error}`));
        console.log('');
    }
    
    return results;
}

// Export individual student data for reference
export { updatedStudentsData };
