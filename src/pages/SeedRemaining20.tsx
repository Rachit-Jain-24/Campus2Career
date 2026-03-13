import { useState } from 'react';
import { seedRemaining20Students } from '../utils/seedRemaining20Students';

export default function SeedRemaining20() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<{ success: string[]; failed: any[]; total: number } | null>(null);

  const handleSeed = async () => {
    if (!confirm('Seed the remaining 20 students? This will create their accounts with default data.')) {
      return;
    }

    setSeeding(true);
    setResult(null);

    try {
      const res = await seedRemaining20Students();
      setResult(res);
    } catch (error) {
      console.error('Seeding failed:', error);
      alert('Seeding failed. Check console for details.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Seed Remaining 20 Students
          </h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">What will be created:</h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Firebase Auth accounts (password: nmims2026)</li>
              <li>Firestore user profiles</li>
              <li>Basic student data (will be updated with projects later)</li>
              <li>20 students (Sr. No. 11-32)</li>
            </ul>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h2>
            <ul className="list-disc list-inside text-yellow-800 space-y-1">
              <li>This creates accounts with minimal data</li>
              <li>After seeding, run the update script to add unique projects</li>
              <li>Process takes about 20-30 seconds</li>
            </ul>
          </div>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              seeding
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {seeding ? 'Seeding...' : 'Seed Remaining 20 Students'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="font-semibold text-green-900 mb-2">✅ Seeding Complete!</h2>
              <div className="text-green-800 space-y-1">
                <p>✓ Successfully seeded: {result.success.length} students</p>
                {result.failed.length > 0 && (
                  <p className="text-red-600">✗ Failed: {result.failed.length} students</p>
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800 font-semibold">Next Step:</p>
                <p className="text-sm text-blue-700">
                  Go to <a href="/update-batch-data" className="underline">/update-batch-data</a> to add unique projects for all students
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Students to be seeded (20):</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <p>11. Ruthvik Akula</p>
            <p>13. Anmagandla Snehil</p>
            <p>14. Narahari Abhinav</p>
            <p>15. Md Sohail</p>
            <p>16. Malde Saicharan</p>
            <p>17. Prasad Sham Kannawar</p>
            <p>18. Venkatesh M</p>
            <p>19. Rachit Jain</p>
            <p>20. Khushal Baldava</p>
            <p>21. Sidra Fatima</p>
            <p>22. Sai Vijaya Laxmi</p>
            <p>23. Vadla Vaishnavi</p>
            <p>24. B Vaishnavi</p>
            <p>25. G. Sainath Goud</p>
            <p>26. Kurumidde John Austin</p>
            <p>27. Chetan H</p>
            <p>28. Ananya P</p>
            <p>29. M Sowmya</p>
            <p>30. G Pragnya Reddy</p>
            <p>31. V Abhiram Reddy</p>
            <p>32. Rudramoni Ananth Yadav</p>
          </div>
        </div>
      </div>
    </div>
  );
}
