import React, { useMemo, useState, useEffect } from 'react';
import { User, UserLevel, UserType, RedemptionHistory } from '../types';
import { Award, Sprout, Leaf, Tree, Users, Gift, History, Sparkles } from '../components/icons';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

interface RewardsScreenProps {
    user: User;
    users: User[];
    redemptionHistory: RedemptionHistory[];
    redeemReward: (option: 'discount' | 'cashback') => { success: boolean, message: string };
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

const REWARD_TIERS = [
    { tier: 4, minPoints: 1000, pointsDeducted: 600, discount: 15, cashback: 100, name: 'Planet Protector Reward' },
    { tier: 3, minPoints: 500, pointsDeducted: 400, discount: 10, cashback: 60, name: 'EcoHero Reward' },
    { tier: 2, minPoints: 200, pointsDeducted: 200, discount: 5, cashback: 25, name: 'EcoWarrior Reward' },
    { tier: 1, minPoints: 100, pointsDeducted: 100, discount: 2, cashback: 10, name: 'EcoSaver Reward' }
];

const CelebrationAnimation = () => (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
            <div
                key={i}
                className="confetti"
                style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ['#34D399', '#FBBF24', '#60A5FA', '#F472B6'][Math.floor(Math.random() * 4)],
                }}
            />
        ))}
        <style>{`
            @keyframes confetti-fall {
                0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
            .confetti {
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                animation: confetti-fall 3s linear forwards;
            }
        `}</style>
    </div>
);

const RewardsScreen: React.FC<RewardsScreenProps> = ({ user, users, redemptionHistory, redeemReward }) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);


    const leaderboard = useMemo(() => {
        return users
            .filter(u => u.userType === UserType.Consumer) // Only show consumers on leaderboard
            .sort((a, b) => b.ecoPoints - a.ecoPoints);
    }, [users]);

    const { progress, nextLevelPoints, levelName } = getLevelData(user.level, user.ecoPoints);
    const pointsToNextLevel = nextLevelPoints ? nextLevelPoints - user.ecoPoints : 0;

    const eligibleTier = useMemo(() => {
        return REWARD_TIERS.find(tier => user.ecoPoints >= tier.minPoints);
    }, [user.ecoPoints]);
    
    const nextTier = useMemo(() => {
        return [...REWARD_TIERS].reverse().find(tier => user.ecoPoints < tier.minPoints);
    }, [user.ecoPoints]);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedProgress(progress), 100);
        return () => clearTimeout(timer);
    }, [progress]);

    const handleRedeem = (option: 'discount' | 'cashback') => {
        const result = redeemReward(option);
        if (result.success) {
            setIsRedeemModalOpen(false);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 4000); // Celebration lasts 4 seconds
        }
    };

    return (
        <div className="py-8 relative">
            {showCelebration && <CelebrationAnimation />}
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
                        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                            {user.name}
                            {user.hasEcoBadge && (
                                <span title="Eco Badge Earned!" className="text-yellow-400 animate-pulse">
                                    <Sparkles size={24} />
                                </span>
                            )}
                        </h2>
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

            {/* Redemption Section */}
            <div className="bg-[#161B22] border border-gray-700/50 p-6 rounded-xl mb-8 animate-card-fade-in" style={{ animationDelay: '100ms' }}>
                <h3 className="text-xl font-semibold text-gray-200 mb-4">Redeem Your Points</h3>
                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                    <div>
                        <p className="text-gray-400 text-sm">Wallet Balance</p>
                        <p className="text-2xl font-bold text-white">₹{user.walletBalance.toFixed(2)}</p>
                    </div>
                    <Button onClick={() => setIsRedeemModalOpen(true)} disabled={!eligibleTier}>
                        <Gift className="mr-2" /> Redeem Now
                    </Button>
                </div>
                <div className="text-center mt-3 text-sm text-gray-400">
                    {eligibleTier 
                        ? `You can redeem the ${eligibleTier.name}!` 
                        : nextTier 
                            ? `Earn ${nextTier.minPoints - user.ecoPoints} more points to unlock the next reward!` 
                            : "You've unlocked all rewards!"
                    }
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

             {/* Redemption History */}
             <div className="bg-[#161B22] border border-gray-700/50 p-0 rounded-xl mt-8 animate-card-fade-in" style={{animationDelay: '250ms'}}>
                <h3 className="text-xl font-semibold text-gray-200 p-4 flex items-center border-b border-gray-700/50"><History className="mr-2 text-green-500" /> Redemption History</h3>
                <div className="space-y-1 p-2 max-h-60 overflow-y-auto">
                    {redemptionHistory.length > 0 ? redemptionHistory.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-800/50">
                            <div>
                                <p className="font-semibold text-gray-200">{item.rewardType}: {item.rewardValue}</p>
                                <p className="text-sm text-gray-400">{new Date(item.dateRedeemed).toLocaleString()}</p>
                            </div>
                            <p className="font-semibold text-amber-400">-{item.pointsSpent} points</p>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 p-4">No redemptions yet.</p>
                    )}
                </div>
            </div>

            {/* Redemption Modal */}
            {eligibleTier && (
                <Modal isOpen={isRedeemModalOpen} onClose={() => setIsRedeemModalOpen(false)} title="Redeem Your Reward">
                    <div className="text-center">
                        <p className="text-gray-400">You have <strong className="text-green-400">{user.ecoPoints}</strong> EcoPoints.</p>
                        <p className="font-semibold text-lg text-white mt-1">You've unlocked the <span className="text-green-400">{eligibleTier.name}!</span></p>
                        <p className="text-sm text-gray-500 mb-6">Redeeming will cost {eligibleTier.pointsDeducted} points.</p>
                        
                        <div className="space-y-4">
                            <button onClick={() => handleRedeem('discount')} className="w-full text-left p-4 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
                                <p className="font-bold text-xl text-green-400">{eligibleTier.discount}% Discount</p>
                                <p className="text-gray-300">Apply a discount to your next affiliated purchase.</p>
                            </button>
                            <button onClick={() => handleRedeem('cashback')} className="w-full text-left p-4 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
                                <p className="font-bold text-xl text-green-400">₹{eligibleTier.cashback} Cashback</p>
                                <p className="text-gray-300">Add cashback directly to your EcoEats wallet.</p>
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default RewardsScreen;