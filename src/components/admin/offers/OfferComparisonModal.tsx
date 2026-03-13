import React from 'react';
import { X, ArrowLeftRight, IndianRupee, MapPin, CalendarClock, Scale } from 'lucide-react';
import type { AdminOffer } from '../../../types/offerAdmin';

interface OfferComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    offers: AdminOffer[];
}

export const OfferComparisonModal: React.FC<OfferComparisonModalProps> = ({ isOpen, onClose, offers }) => {
    if (!isOpen || offers.length === 0) return null;

    const formatDate = (date: Date | null) => {
        if (!date) return 'TBA';
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(date);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">

                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Scale className="w-5 h-5 text-indigo-500" />
                        Offer Comparison ({offers.length}/3)
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/80">
                    <div className="flex gap-4 min-w-max">
                        {offers.map(offer => (
                            <div key={offer.id} className="w-80 border border-slate-700 bg-slate-800/30 rounded-xl overflow-hidden flex-shrink-0">

                                <div className="p-4 bg-slate-800/80 border-b border-slate-700">
                                    <div className="text-xl font-black text-emerald-400 flex items-center gap-1 mb-1">
                                        <IndianRupee className="w-5 h-5" /> {offer.ctc} LPA
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{offer.studentName}</h3>
                                    <p className="text-xs text-slate-400">{offer.studentDepartment}</p>
                                </div>

                                <div className="divide-y divide-slate-700/50">
                                    <div className="p-4">
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Company</div>
                                        <div className="font-medium text-white">{offer.companyName}</div>
                                        <div className="text-sm text-brand-400 mt-0.5">{offer.role}</div>
                                    </div>

                                    <div className="p-4">
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Drive Source</div>
                                        <div className="font-medium text-white">{offer.driveTitle}</div>
                                    </div>

                                    <div className="p-4">
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Location</div>
                                        <div className="font-medium text-white flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" /> {offer.location || 'Not Specified'}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Joining & Bond</div>
                                        <div className="font-medium text-white flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <CalendarClock className="w-4 h-4 text-slate-400" />
                                                <span>Start: {formatDate(offer.joiningDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <ArrowLeftRight className="w-4 h-4 text-slate-400" />
                                                <span>Bond: {offer.bondDuration || 'None'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-900/50">
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Current Status</div>
                                        <div className="inline-block px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold uppercase text-white">
                                            {offer.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center rounded-b-2xl">
                    <p className="text-xs text-slate-500">
                        Comparing {offers.length} selected items side-by-side. Focus on the core package versus commitment variables.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Close Comparison
                    </button>
                </div>
            </div>
        </div>
    );
};
