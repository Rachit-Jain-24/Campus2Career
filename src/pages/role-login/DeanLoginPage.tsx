import { Landmark } from 'lucide-react';
import { RoleLoginPage } from '../../components/role/RoleLoginPage';

export default function DeanLoginPage() {
    return (
        <RoleLoginPage
            role="dean"
            roleLabel="Dean"
            dashboardPath="/dean/dashboard"
            accentColor="from-purple-600 to-purple-800"
            accentBg="bg-purple-500/10"
            accentBorder="border-purple-500/30"
            accentText="text-purple-400"
            icon={Landmark}
            demoEmail="dean@nmims.edu"
            demoPassword="dean2026"
            description="Strategic oversight — reports, analytics, policy"
        />
    );
}
