import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Database, CheckCircle, AlertCircle, Loader, Trash2 } from 'lucide-react';
import { seedDemoAccounts, checkDemoAccountsExist, deleteDemoAccounts } from '../../utils/seedDemoAccounts';

export default function SeedDemoData() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: any; results?: any[] } | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);

  const handleCheckExists = async () => {
    const doesExist = await checkDemoAccountsExist();
    setExists(doesExist);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setResult(null);
    const res = await seedDemoAccounts();
    setResult(res);
    setIsSeeding(false);
    if (res.success) {
      setExists(true);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete all demo accounts? This cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    await deleteDemoAccounts();
    setIsDeleting(false);
    setExists(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Demo Data Seeder</h1>
          <p className="text-muted-foreground">Seed Firebase with demo student accounts for presentation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Demo Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Accounts to be created:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• DEMO1001 - Aarav Sharma (1st Year CSE) - aarav.sharma@nmims.edu</li>
                <li>• DEMO2002 - Priya Patel (2nd Year CSDS) - priya.patel@nmims.edu</li>
                <li>• DEMO3003 - Rohan Mehta (3rd Year CSE) - rohan.mehta@nmims.edu</li>
                <li>• DEMO4004 - Ananya Singh (4th Year CSDS) - ananya.singh@nmims.edu</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Password for all accounts: <code className="bg-gray-100 px-2 py-1 rounded">demo123</code>
              </p>
              <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded mt-2">
                ⚠️ Login using SAP ID (e.g., DEMO1001) not email
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={handleCheckExists}
                variant="outline"
                className="flex items-center gap-2"
              >
                Check if Exists
              </Button>
              <Button
                onClick={handleSeed}
                disabled={isSeeding}
                className="flex items-center gap-2"
              >
                {isSeeding ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Seed Demo Accounts
                  </>
                )}
              </Button>
              {exists && (
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete All
                    </>
                  )}
                </Button>
              )}
            </div>

            {exists !== null && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${exists ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                {exists ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Demo accounts already exist in Firebase</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Demo accounts not found. Click "Seed Demo Accounts" to create them.</span>
                  </>
                )}
              </div>
            )}

            {result && (
              <div className={`p-3 rounded-lg ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {result.success ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Successfully seeded {result.count} demo accounts!
                      </span>
                    </div>
                    {result.results && (
                      <div className="text-xs space-y-1 ml-6">
                        {result.results.map((r: any, i: number) => (
                          <div key={i}>
                            {r.success ? '✅' : '❌'} {r.account}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Error seeding accounts. Check console for details.
                      </span>
                    </div>
                    {result.error && (
                      <div className="text-xs mt-2 ml-6">
                        {result.error.message || String(result.error)}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Click "Check if Exists" to verify if demo accounts are already in Firebase</p>
            <p>2. If they don't exist, click "Seed Demo Accounts" to create them</p>
            <p>3. Go to <a href="/login" className="text-primary hover:underline">/login</a> and use SAP ID (e.g., DEMO1001) with password: demo123</p>
            <p>4. Each account has progressively more data (1st year → 4th year)</p>
            <p className="text-yellow-700 bg-yellow-50 p-2 rounded mt-2">
              ⚠️ <strong>Important:</strong> Login with SAP ID (DEMO1001), NOT email address
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
