import React from 'react';

// Defined a local IconProps type to remove the 'react-lucide' dependency
interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
}

interface StatCardProps {
    icon: React.ComponentType<IconProps>;
    title: string;
    value: string;
    color: 'emerald' | 'amber' | 'green' | 'sky';
}

const colorClasses = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    green: 'text-green-400',
    sky: 'text-sky-400',
};

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, color }) => {
    return (
        <div className="bg-[#161B22] border border-gray-700/50 p-4 rounded-lg flex items-center gap-4 transition-all duration-200 transform hover:-translate-y-1 hover:border-gray-600/80">
            <div className={`p-3 rounded-lg bg-gray-800 ${colorClasses[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-xl font-bold text-gray-100">{value}</p>
            </div>
        </div>
    );
};