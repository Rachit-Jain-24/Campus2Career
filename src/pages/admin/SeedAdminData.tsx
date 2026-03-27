import { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { seedAllAdminCollections, checkAdminCollectionsExist } from '../../utils/seedAdminCollections';

export default function SeedAdminData() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<{ success: boolean; results: Record<string, string>; error?: string } | null>(null);
    const [counts, setCounts] = useState<Record<string, number> | null>(null);

    const handleCheck = async () => {
        setIsChecking(true);
        const c = await checkAdminCollectionsExist();
        setCounts(c);
        setIsChecking(false);
    };

    const handleSeed = async () => {
        if (!confirm('This will add mock data to companies, drives, interviews, offers, auditLogs, and adminUsers collections. Continue?')) return;
        setIsSeeding(true);
        setResult(null);
        const res = await seedAllAdminCollections();
        setResult(res);
        setIsSeeding(false);
        if (res.success) handleCheck();
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Database className="w-6 h-6 text-primary" />
                    Admin Collections Seeder
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Seeds companies, drives, interviews, offers, audit logs, and admin users with realistic mock data derived from the students collection.
                </p>
            </div>

            <div className="card-nmims p-5 space-y-4">
                <h2 className="font-semibold text-foreground">Collections to seed</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                        ['companies', '10 companies (Infosys, TCS, Wipro...)'],
                        ['drives', '5 placement drives'],
                        ['interviews', '20 interviews'],
                        ['offers', '10 offers'],
                        ['auditLogs', '20 audit events'],
                        ['adminUsers', '5 admin accounts'],
                        ['eligibility_rules', '3 global rule templates'],
                        ['config', 'Platform platformSettings doc'],
                    ].map(([col, desc]) => (
                        <div key={col} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/50">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-foreground">{col}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 flex-wrap pt-2">
                    <button onClick={handleCheck} disabled={isChecking}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-secondary transition-all disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                        Check Status
                    </button>
                    <button onClick={handleSeed} disabled={isSeeding}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
                        {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                        {isSeeding ? 'Seeding...' : 'Seed All Collections'}
                    </button>
                </div>
            </div>

            {counts && (
                <div className="card-nmims p-5">
                    <h2 className="font-semibold text-foreground mb-3">Current Collection Counts</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(counts).map(([col, count]) => (
                            <div key={col} className={`p-3 rounded-xl text-center border ${count > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-secondary border-border'}`}>
                                <p className={`text-xl font-bold ${count > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>{count > 0 ? count + '+' : '0'}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{col}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {result && (
                <div className={`card-nmims p-5 border ${result.success ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        {result.success
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            : <AlertCircle className="w-5 h-5 text-rose-400" />}
                        <h2 className="font-semibold text-foreground">
                            {result.success ? 'Seeding Complete' : 'Seeding Failed'}
                        </h2>
                    </div>
                    <div className="space-y-1.5">
                        {Object.entries(result.results).map(([col, status]) => (
                            <div key={col} className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground w-24">{col}</span>
                                <span className="text-foreground">{status}</span>
                            </div>
                        ))}
                    </div>
                    {result.error && (
                        <p className="text-sm text-rose-400 mt-3 p-2 bg-rose-500/10 rounded-lg">{result.error}</p>
                    )}
                </div>
            )}
        </div>
    );
}
