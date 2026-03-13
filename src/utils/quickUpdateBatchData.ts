import { db } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// Quick update function - updates LeetCode usernames and adds unique projects
export async function quickUpdateBatchData() {
    const updates = [
        { sapId: "70572200001", leetcode: "Divya_sri_Kapperi", projects: [
            { id: 1, title: "Healthcare Data Analysis", tech: "Python, ML", description: "Healthcare analytics platform", year: "2024" },
            { id: 2, title: "Student Performance Predictor", tech: "Python, TensorFlow", description: "Academic outcome prediction", year: "2024" }
        ]},
        { sapId: "70572200002", leetcode: "pavithrasevakula011", projects: [
            { id: 1, title: "E-commerce Recommender", tech: "Python, Flask", description: "Product recommendation system", year: "2024" },
            { id: 2, title: "Sentiment Analysis Tool", tech: "Python, NLP", description: "Text sentiment analyzer", year: "2024" },
            { id: 3, title: "Image Classifier CNN", tech: "TensorFlow, Keras", description: "Deep learning classifier", year: "2024" },
            { id: 4, title: "Sales Forecasting", tech: "Python, ARIMA", description: "Time series forecasting", year: "2024" },
            { id: 5, title: "Churn Prediction Model", tech: "XGBoost, Pandas", description: "Customer churn predictor", year: "2024" }
        ]},
        { sapId: "70572200003", leetcode: "Maddi_Vaishnavi", projects: [
            { id: 1, title: "Fraud Detection System", tech: "Python, Random Forest", description: "Financial fraud detection", year: "2024" },
            { id: 2, title: "Weather Predictor", tech: "LSTM, TensorFlow", description: "Weather forecasting model", year: "2024" }
        ]},
        { sapId: "70572200004", leetcode: "Akula_Srinithya", projects: [
            { id: 1, title: "Traffic Flow Prediction", tech: "Python, LSTM", description: "Urban traffic forecasting", year: "2024" },
            { id: 2, title: "Medical Diagnosis AI", tech: "Decision Trees, Flask", description: "AI diagnosis assistant", year: "2024" },
            { id: 3, title: "Stock Price Analyzer", tech: "Python, ARIMA", description: "Financial analysis tool", year: "2024" },
            { id: 4, title: "Spam Classifier", tech: "Naive Bayes, NLP", description: "Email spam detection", year: "2024" },
            { id: 5, title: "Face Recognition", tech: "OpenCV, Deep Learning", description: "Real-time face detection", year: "2024" }
        ]},
        { sapId: "70572200005", leetcode: "Kistaram_Manishankar_Goud", projects: [
            { id: 1, title: "Crop Yield Prediction", tech: "Python, Regression", description: "Agricultural forecasting", year: "2024" },
            { id: 2, title: "Energy Optimizer", tech: "Python, ML", description: "Smart energy management", year: "2024" }
        ]},
        { sapId: "70572200006", leetcode: "Maddi_Jahnavi", projects: [
            { id: 1, title: "Hotel Booking Predictor", tech: "Logistic Regression", description: "Booking cancellation predictor", year: "2024" },
            { id: 2, title: "Text Summarizer", tech: "NLP, Transformers", description: "Automatic summarization", year: "2024" },
            { id: 3, title: "Movie Recommender", tech: "Content-Based Filtering", description: "Personalized recommendations", year: "2024" },
            { id: 4, title: "Air Quality Predictor", tech: "Time Series, Plotly", description: "Environmental analysis", year: "2024" }
        ]},
        { sapId: "70572200008", leetcode: "CharalaPujitha", projects: [
            { id: 1, title: "Rupee-Gram Calculator", tech: "Android, Java", description: "Currency conversion app", year: "2024" },
            { id: 2, title: "Disease Outbreak Predictor", tech: "Python, ML", description: "Epidemiological forecasting", year: "2024" },
            { id: 3, title: "Smart Attendance System", tech: "Face Recognition, Flask", description: "Automated attendance", year: "2024" }
        ]},
        { sapId: "70572200009", leetcode: "Thrisha_1203", projects: [
            { id: 1, title: "Smart Lighting IoT", tech: "Python, IoT, Arduino", description: "Automated lighting control", year: "2024" },
            { id: 2, title: "Sleep Apnea Detection", tech: "CNN, ECG Analysis", description: "Medical diagnosis ML", year: "2024" },
            { id: 3, title: "Credit Risk Assessment", tech: "Ensemble Methods", description: "Financial risk prediction", year: "2024" },
            { id: 4, title: "Voice Assistant Bot", tech: "Speech Recognition, NLP", description: "AI voice assistant", year: "2024" },
            { id: 5, title: "Handwriting Recognition", tech: "CNN, TensorFlow", description: "OCR system", year: "2024" },
            { id: 6, title: "News Classifier", tech: "NLP, Scikit-learn", description: "Article categorization", year: "2024" }
        ]},
        { sapId: "70572200010", leetcode: "Harsh_Bang", projects: [
            { id: 1, title: "PyGPA Analyzer", tech: "Python, Tkinter", description: "GPA management (300+ users)", year: "2023" },
            { id: 2, title: "Real Estate Predictor", tech: "Regression, Flask", description: "Property price estimation", year: "2024" },
            { id: 3, title: "NLP Chatbot", tech: "NLTK, Deep Learning", description: "Conversational AI", year: "2024" },
            { id: 4, title: "Loan Approval System", tech: "Classification, Streamlit", description: "Automated loan decisions", year: "2024" },
            { id: 5, title: "Object Detection", tech: "YOLO, OpenCV", description: "Real-time detection", year: "2024" },
            { id: 6, title: "Music Genre Classifier", tech: "Audio Processing, ML", description: "Audio classification", year: "2024" }
        ]}
    ];

    console.log('🔄 Starting batch update...\n');
    let success = 0;
    let failed = 0;

    for (const update of updates) {
        try {
            const userRef = doc(db, 'users', update.sapId);
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
                await updateDoc(userRef, {
                    leetcode: update.leetcode,
                    leetcodeStats: null,
                    projects: update.projects,
                    updatedAt: Date.now()
                });
                console.log(`✓ Updated ${update.sapId}`);
                success++;
            } else {
                console.log(`⚠ ${update.sapId} not found`);
                failed++;
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error(`✗ Failed ${update.sapId}:`, error);
            failed++;
        }
    }

    console.log(`\n✅ Success: ${success}, ❌ Failed: ${failed}`);
    return { success, failed };
}
