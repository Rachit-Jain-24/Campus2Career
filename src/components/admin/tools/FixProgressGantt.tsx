import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface GanttTask {
    id: string;
    name: string;
    duration: string;
    status: 'pending' | 'in-progress' | 'completed';
    dependencies?: string[];
    description: string;
}

interface FixProgressGanttProps {
    currentStep?: string;
}

export const FixProgressGantt: React.FC<FixProgressGanttProps> = ({ currentStep = 'pending' }) => {
    const tasks: GanttTask[] = [
        {
            id: 'step1',
            name: 'Fetch All Student Records',
            duration: '5-10s',
            status: currentStep === 'step1' ? 'in-progress' : 
                    ['step2', 'step3', 'step4', 'step5'].includes(currentStep) ? 'completed' : 'pending',
            description: 'Retrieve all student entries from Firestore database'
        },
        {
            id: 'step2',
            name: 'Identify & Remove Duplicates',
            duration: '10-15s',
            status: currentStep === 'step2' ? 'in-progress' : 
                    ['step3', 'step4', 'step5'].includes(currentStep) ? 'completed' : 'pending',
            dependencies: ['step1'],
            description: 'Group by email/sapId, keep latest, delete ~22 duplicates'
        },
        {
            id: 'step3',
            name: 'Fix Missing Data',
            duration: '30-45s',
            status: currentStep === 'step3' ? 'in-progress' : 
                    ['step4', 'step5'].includes(currentStep) ? 'completed' : 'pending',
            dependencies: ['step2'],
            description: 'Add certifications, internships, achievements, projects for 32 students'
        },
        {
            id: 'step4',
            name: 'Create Auth Accounts',
            duration: '60-90s',
            status: currentStep === 'step4' ? 'in-progress' : 
                    currentStep === 'step5' ? 'completed' : 'pending',
            dependencies: ['step3'],
            description: 'Create Firebase Auth accounts with rate limiting (1s delay)'
        },
        {
            id: 'step5',
            name: 'Verification & Summary',
            duration: '5s',
            status: currentStep === 'step5' ? 'completed' : 'pending',
            dependencies: ['step4'],
            description: 'Generate final report and verify all operations'
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'in-progress':
                return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
            default:
                return <Circle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'in-progress':
                return 'bg-blue-500';
            default:
                return 'bg-gray-300';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 border-green-200';
            case 'in-progress':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Fix Process Timeline</h3>
                    <p className="text-sm text-gray-600">Total estimated time: 2-3 minutes</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">Completed</span>
                    </div>
                </div>
            </div>

            {/* Gantt Chart */}
            <div className="space-y-3">
                {tasks.map((task, index) => (
                    <div key={task.id} className="space-y-2">
                        {/* Task Info */}
                        <div className={`border-2 rounded-lg p-4 transition-all ${getStatusBg(task.status)}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    {getStatusIcon(task.status)}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">
                                                {index + 1}. {task.name}
                                            </h4>
                                            <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-600 border">
                                                {task.duration}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {task.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(task.status)}`}
                                        style={{
                                            width: task.status === 'completed' ? '100%' :
                                                   task.status === 'in-progress' ? '50%' : '0%'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < tasks.length - 1 && (
                            <div className="flex justify-center">
                                <div className={`w-0.5 h-4 ${
                                    task.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                        {tasks.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {tasks.filter(t => t.status === 'in-progress').length}
                    </div>
                    <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">
                        {tasks.filter(t => t.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                </div>
            </div>
        </div>
    );
};
