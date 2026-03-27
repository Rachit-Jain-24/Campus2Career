import { UserCheck } from 'lucide-react';
import { RoleLoginPage } from '../../components/role/RoleLoginPage';

export default function FacultyLoginPage() {
    return (
        <RoleLoginPage
            role="faculty"
            roleLabel="Faculty"
            dashboardPath="/faculty/dashboard"
            accentColor="from-emerald-600 to-emerald-800"
            accentBg="bg-emerald-500/10"
            accentBorder="border-emerald-500/30"
            accentText="text-emerald-400"
            icon={UserCheck}
            demoEmail="faculty@c2c.com"
            demoPassword="faculty123"
            description="Student mentorship — profiles, interviews, batch data"
        />
    );
}
