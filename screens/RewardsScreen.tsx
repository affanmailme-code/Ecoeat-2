import React, { useMemo, useState, useEffect } from 'react';
import { User, UserLevel, UserType } from '../types';
import { Award, Sprout, Leaf, Tree, Users } from '../components/icons';

interface RewardsScreenProps {
    user: User;
    users: User[];
}

const getLevelIcon = (level: UserLevel, size: number | string = 24) => {
    switch (level) {
        case UserLevel.EcoSaver: return <Sprout className="text-green-400" size={size} />;
        case UserLevel.EcoWarrior: return <Award className="text-green-400" size={size} />;
        case UserLevel.EcoHero: return <Leaf className="text-green-400" size={size} />;
        case UserLevel.PlanetProtector: return <Tree className="text-green-400" size={size} />;
        default: return <Sprout size={size}/>;
    }
};

const getLevelData = (level: UserLevel, points: number): { progress: number; nextLevelPoints: number | null; levelName: string } => {
    switch (level) {
        case UserLevel.EcoSaver: return { progress: (points / 101) * 100, nextLevelPoints: 101, levelName: 'EcoSaver' };
        case UserLevel.EcoWarrior: return { progress: ((points - 101) / (301-101)) * 100, nextLevelPoints: 301, levelName: 'EcoWarrior' };
        case UserLevel.EcoHero: return { progress: ((points - 301) / (501-301)) * 100, nextLevelPoints: 501, levelName: 'EcoHero' };
        case UserLevel.PlanetProtector: return { progress: 100, nextLevelPoints: null, levelName: 'Planet Protector' };
        default: return { progress: 0, nextLevelPoints: 101, levelName: 'EcoSaver' };
    }
}

const RewardsScreen: React.FC<RewardsScreenProps> = ({ user, users }) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    const leaderboard = useMemo(() => {
        return users
            .filter(u => u.userType === UserType.Consumer) // Only show consumers on leaderboard
            .sort((a, b) => b.ecoPoints - a.ecoPoints);
    }, [users]);

    const { progress, nextLevelPoints, levelName } = getLevelData(user.level, user.ecoPoints);
    const pointsToNextLevel = nextLevelPoints ? nextLevelPoints - user.ecoPoints : 0;

    useEffect(() => {
        // Animate the progress bar on component mount
        const timer = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 100); // Small delay to ensure the transition is visible
        return () => clearTimeout(timer);
    }, [progress]);

    return (
        <div className="py-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Rewards & Impact</h1>
                <p className="text-gray-400 mt-1">Track your progress and see how you rank!</p>
            </header>

            {/* User Stats Card */}
            <div className="bg-[#161B22] border border-gray-700/50 p-6 rounded-xl mb-8 animate-card-fade-in">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border-2 border-green-500">
                        {getLevelIcon(user.level, 32)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-100">{user.name}</h2>
                        <p className="font-semibold text-green-400">{levelName}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-300">Total EcoPoints</span>
                        <span className="text-sm font-bold text-green-400">{user.ecoPoints}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${animatedProgress}%` }}></div>
                    </div>
                    {pointsToNextLevel > 0 && (
                        <p className="text-xs text-right text-gray-400 mt-1">{pointsToNextLevel} points to next level</p>
                    )}
                </div>
            </div>

            {/* Leaderboard */}
             <div className="bg-[#161B22] border border-gray-700/50 p-0 rounded-xl animate-card-fade-in" style={{animationDelay: '150ms'}}>
                <h3 className="text-xl font-semibold text-gray-200 p-4 flex items-center border-b border-gray-700/50"><Users className="mr-2 text-green-500" /> Leaderboard</h3>
                <div className="space-y-1 p-2">
                    {leaderboard.map((leader, index) => (
                        <div key={leader.id} className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${leader.id === user.id ? 'bg-green-500/10' : 'hover:bg-gray-800/50'}`}>
                            <span className="font-bold text-lg w-8 text-center text-gray-400">{index + 1}</span>
                            <div className="flex-1 ml-4">
                                <p className="font-semibold text-gray-200">{leader.name} {leader.id === user.id && '(You)'}</p>
                                <p className="text-sm text-gray-400">{getLevelData(leader.level, leader.ecoPoints).levelName}</p>
                            </div>
                            <div className="font-bold text-green-400 flex items-center">
                                {leader.ecoPoints} points
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
    );
};

export default RewardsScreen;