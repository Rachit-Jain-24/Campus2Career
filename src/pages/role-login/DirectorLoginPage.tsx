import { Target } from 'lucide-react';
import { RoleLoginPage } from '../../components/role/RoleLoginPage';

export default function DirectorLoginPage() {
    return (
        <RoleLoginPage
            role="director"
            roleLabel="Director"
            dashboardPath="/director/dashboard"
            accentColor="from-blue-600 to-blue-800"
            accentBg="bg-blue-500/10"
            accentBorder="border-blue-500/30"
            accentText="text-blue-400"
            icon={Target}
            demoEmail="director@nmims.edu"
            demoPassword="director2026"
            description="Operational oversight — drives, companies, reports"
        />
    );
}
