import { Handshake } from 'lucide-react';
import { RoleLoginPage } from '../../components/role/RoleLoginPage';

export default function PlacementLoginPage() {
    return (
        <RoleLoginPage
            role="placement_officer"
            roleLabel="Placement Officer"
            dashboardPath="/placement/dashboard"
            accentColor="from-cyan-600 to-cyan-800"
            accentBg="bg-cyan-500/10"
            accentBorder="border-cyan-500/30"
            accentText="text-cyan-400"
            icon={Handshake}
            demoEmail="placement@nmims.edu"
            demoPassword="placement2026"
            description="Placement operations — companies, drives, offers"
        />
    );
}
