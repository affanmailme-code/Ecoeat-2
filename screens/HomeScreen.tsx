import React, { useMemo } from 'react';
import { User, PantryItem, ItemStatus, Screen, Donation } from '../types';
import { StatCard } from '../components/StatCard';
import { Heart, Award, Leaf, TrendingUp, ChefHat } from '../components/icons';

interface HomeScreenProps {
    user: User;
    pantryItems: PantryItem[];
    donations: Donation[];
    setActiveScreen: (screen: Screen) => void;
}

const ActionCard: React.FC<{ icon: React.FC<any>, title: string, subtitle: string, onClick: () => void, userLevel?: string }> = ({ icon: Icon, title, subtitle, onClick, userLevel }) => (
    <button 
        onClick={onClick} 
        className="bg-[#161B22] border border-gray-700/50 p-5 rounded-lg flex items-center gap-4 text-left w-full transition-all duration-200 transform hover:-translate-y-1 hover:border-gray-600/80"
    >
        <div className="p-3 rounded-lg bg-gray-800 text-green-400">
            <Icon size={24} />
        </div>
        <div>
            <p className="font-bold text-gray-100">{title}</p>
            <p className="text-sm text-gray-400">{userLevel ? `Level ${userLevel}` : subtitle}</p>
        </div>
    </button>
);


const HomeScreen: React.FC<HomeScreenProps> = ({ user, pantryItems, donations, setActiveScreen }) => {

    const stats = useMemo(() => {
        const saved = pantryItems.filter(item => item.status === ItemStatus.Used).length;
        // Calculate donated items from the historical donations log for persistence.
        const donated = donations.reduce((acc, current) => acc + current.itemIds.length, 0);
        
        const foodSavedKg = ((saved + donated) * 0.3).toFixed(1); // Assuming avg item is 0.3kg
        const co2Saved = (parseFloat(foodSavedKg) * 0.3).toFixed(1); // 1kg food saved = 0.3kg CO2 saved
        return { saved, donated, foodSavedKg, co2Saved };
    }, [pantryItems, donations]);
    
    return (
        <div className="py-8 min-h-full space-y-6">
             {/* Hero Banner */}
            <div 
                className="relative bg-cover bg-center rounded-xl p-8 text-white overflow-hidden animate-card-fade-in"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop)' }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-teal-800/50 mix-blend-multiply"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold flex items-center">Hello, {user.name}! <span className="text-3xl ml-2">🌱</span></h1>
                    <p className="mt-2 text-lg text-green-100">Your sustainability journey at a glance</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-card-fade-in" style={{ animationDelay: '100ms' }}>
                <StatCard icon={Leaf} title="Items Saved" value={stats.saved.toString()} color="emerald" />
                <StatCard icon={Heart} title="Items Donated" value={stats.donated.toString()} color="amber" />
                <StatCard icon={TrendingUp} title="Food Saved (kg)" value={`${stats.foodSavedKg}`} color="green" />
                <StatCard icon={Award} title="EcoPoints" value={user.ecoPoints.toString()} color="sky" />
            </div>

            {/* Environmental Impact */}
            <div className="bg-[#161B22] border border-gray-700/50 p-6 rounded-xl animate-card-fade-in" style={{ animationDelay: '200ms' }}>
                <h2 className="text-lg font-bold text-gray-100 mb-2">Your Environmental Impact</h2>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-300">CO₂ Saved</p>
                        <p className="text-sm text-gray-400">Every kilogram of food saved prevents approximately 0.3 kg of CO₂ emissions!</p>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{stats.co2Saved} kg</p>
                </div>
            </div>
            
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-card-fade-in" style={{ animationDelay: '300ms' }}>
                <ActionCard 
                    icon={Leaf} 
                    title="My Pantry" 
                    subtitle="Track your items" 
                    onClick={() => setActiveScreen('Pantry')} 
                />
                <ActionCard 
                    icon={ChefHat} 
                    title="Get Recipes" 
                    subtitle="AI-powered ideas" 
                    onClick={() => setActiveScreen('Recipes')} 
                />
                <ActionCard 
                    icon={Award} 
                    title="My Rewards" 
                    subtitle={`Level ${user.level}`}
                    onClick={() => setActiveScreen('Rewards')} 
                />
            </div>
        </div>
    );
};

export default HomeScreen;