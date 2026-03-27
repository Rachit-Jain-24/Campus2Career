import { BookOpen } from 'lucide-react';
import { RoleLoginPage } from '../../components/role/RoleLoginPage';

export default function ProgramChairLoginPage() {
    return (
        <RoleLoginPage
            role="program_chair"
            roleLabel="Program Chair"
            dashboardPath="/program-chair/dashboard"
            accentColor="from-amber-600 to-amber-800"
            accentBg="bg-amber-500/10"
            accentBorder="border-amber-500/30"
            accentText="text-amber-400"
            icon={BookOpen}
            demoEmail="program@c2c.com"
            demoPassword="program123"
            description="Department management — eligibility, students, analytics"
        />
    );
}
