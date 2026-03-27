import { ServerCog } from 'lucide-react';
import { RoleLoginPage } from '../../components/role/RoleLoginPage';

export default function AdminLoginPage() {
    return (
        <RoleLoginPage
            role="system_admin"
            roleLabel="System Admin"
            dashboardPath="/admin/dashboard"
            accentColor="from-rose-600 to-rose-800"
            accentBg="bg-rose-500/10"
            accentBorder="border-rose-500/30"
            accentText="text-rose-400"
            icon={ServerCog}
            demoEmail="admin@c2c.com"
            demoPassword="admin123"
            description="Full platform access — users, settings, audit logs"
        />
    );
}
