import { useState } from 'react';
import { updateAll30Students, totalStudentsToUpdate } from '../utils/updateAll30Students';

export default function UpdateBatchData() {
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<{ success: string[]; notFound: string[]; failed: any[]; total: number } | null>(null);

  const handleUpdate = async () => {
    if (!confirm(`Are you sure you want to update all ${totalStudentsToUpdate} batch student records? This will update LeetCode usernames and projects.`)) {
      return;
    }

    setUpdating(true);
    setResult(null);

    try {
      const res = await updateAll30Students();
      setResult(res);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed. Check console for details.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Update Batch Student Data
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">What will be updated:</h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Correct LeetCode usernames</li>
              <li>Unique project data for each student</li>
              <li>Reset LeetCode stats (will be fetched fresh)</li>
              <li>Update timestamp</li>
            </ul>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h2>
            <ul className="list-disc list-inside text-yellow-800 space-y-1">
              <li>This will update {totalStudentsToUpdate} student records</li>
              <li>Existing data will be preserved (except projects and LeetCode)</li>
              <li>Process takes about 15-20 seconds</li>
              <li>Each student gets unique projects based on their work</li>
            </ul>
          </div>

          <button
            onClick={handleUpdate}
            disabled={updating}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              updating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {updating ? 'Updating...' : 'Update Batch Data'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="font-semibold text-green-900 mb-2">✅ Update Complete!</h2>
              <div className="text-green-800 space-y-1">
                <p>✓ Successfully updated: {result.success.length} students</p>
                {result.notFound.length > 0 && (
                  <p className="text-yellow-600">⚠ Not found: {result.notFound.length} students (need seeding first)</p>
                )}
                {result.failed.length > 0 && (
                  <p className="text-red-600">✗ Failed: {result.failed.length} students</p>
                )}
              </div>
              {result.notFound.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-yellow-700 hover:text-yellow-900">
                    Show students not found ({result.notFound.length})
                  </summary>
                  <ul className="mt-2 text-sm text-yellow-600 list-disc list-inside">
                    {result.notFound.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            All {totalStudentsToUpdate} Students Will Be Updated
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 max-h-96 overflow-y-auto">
            <p>1. Kapperi Divya Sri</p>
            <p>2. Pavithra Sevakula</p>
            <p>3. M.Vaishnavi</p>
            <p>4. Akula Srinithya</p>
            <p>5. K.Manishankar Goud</p>
            <p>6. Jahnavi Maddi</p>
            <p>8. Charala Pujitha</p>
            <p>9. J. Thrisha Reddy</p>
            <p>10. Harsh Bang</p>
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
          <p className="text-gray-500 italic mt-4 text-sm">
            Each student will get unique projects based on their actual work and achievements
          </p>
        </div>
      </div>
    </div>
  );
}
