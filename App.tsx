import React, { useState, useMemo } from 'react';
import { Screen, User } from './types';
import HomeScreen from './screens/HomeScreen';
import PantryScreen from './screens/PantryScreen';
import RecipesScreen from './screens/RecipesScreen';
import DonateScreen from './screens/DonateScreen';
import RewardsScreen from './screens/RewardsScreen';
import AboutScreen from './screens/AboutScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import { Home, ShoppingBasket, ChefHat, Heart, Award, Info, LogOut, Leaf } from './components/icons';
import useEcoEatsDB from './hooks/useEcoEatsDB';
import Toast, { ToastProps } from './components/Toast';

const App: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>('Home');
    const [authScreen, setAuthScreen] = useState<'Login' | 'SignUp'>('Login');
    const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);
    
    const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setToast({ message, type });
    };

    const {
        currentUser,
        users,
        pantryItems,
        donations,
        redemptionHistory,
        login,
        signUp,
        logout,
        addItem,
        updateItemStatus,
        deleteItem,
        deleteMultipleItems,
        addDonation,
        addPoints,
        redeemReward,
    } = useEcoEatsDB({ showToast });

    const handleSignUpSuccess = () => {
        showToast('Account created! Welcome to EcoEats.', 'success');
    };

    const renderScreen = () => {
        switch (activeScreen) {
            case 'Home':
                return <HomeScreen user={currentUser as User} pantryItems={pantryItems} donations={donations} setActiveScreen={setActiveScreen} />;
            case 'Pantry':
                return <PantryScreen pantryItems={pantryItems} updateItemStatus={updateItemStatus} addItem={addItem} deleteItem={deleteItem} deleteMultipleItems={deleteMultipleItems} />;
            case 'Recipes':
                return <RecipesScreen pantryItems={pantryItems} addPoints={addPoints} updateItemStatus={updateItemStatus} />;
            case 'Donate':
                return <DonateScreen pantryItems={pantryItems} addDonation={addDonation} />;
            case 'Rewards':
                return <RewardsScreen 
                    user={currentUser as User} 
                    users={users} 
                    redemptionHistory={redemptionHistory} 
                    redeemReward={redeemReward} 
                />;
            case 'About':
                return <AboutScreen />;
            default:
                return <HomeScreen user={currentUser as User} pantryItems={pantryItems} donations={donations} setActiveScreen={setActiveScreen} />;
        }
    };

    const navItems = useMemo(() => [
        { name: 'Home', icon: Home },
        { name: 'Pantry', icon: ShoppingBasket },
        { name: 'Recipes', icon: ChefHat },
        { name: 'Donate', icon: Heart },
        { name: 'Rewards', icon: Award },
        { name: 'About', icon: Info },
    ], []);
    
    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0D1117]">
                 {toast && <Toast {...toast} onClose={() => setToast(null)} />}
                {authScreen === 'Login' 
                    ? <LoginScreen onLogin={login} showSignUp={() => setAuthScreen('SignUp')} />
                    : <SignUpScreen onSignUp={signUp} showLogin={() => setAuthScreen('Login')} onSignUpSuccess={handleSignUpSuccess} />
                }
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen w-full font-sans bg-[#0D1117]">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            
            {/* Top Header for desktop */}
            <header className="bg-[#161B22] border-b border-gray-700/50 px-6 h-16 flex items-center justify-between flex-shrink-0 z-10">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 p-2 rounded-lg">
                            <Leaf className="text-white" size={20} />
                        </div>
                        <h1 className="text-xl font-bold text-gray-200">
                            EcoEats
                        </h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => setActiveScreen(item.name as Screen)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    activeScreen === item.name
                                        ? 'bg-green-500 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                }`}
                            >
                                <item.icon size={16} />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                     <button
                        onClick={logout}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800 transition-colors"
                    >
                        <LogOut size={16} />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {renderScreen()}
                </div>
            </main>

            {/* Bottom nav for mobile */}
            <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161B22] border-t border-gray-700/50">
                <nav className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                         <button
                            key={item.name}
                            onClick={() => setActiveScreen(item.name as Screen)}
                            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200 relative ${
                                activeScreen === item.name
                                    ? 'text-green-500'
                                    : 'text-gray-400 hover:text-green-500'
                            }`}
                        >
                            {activeScreen === item.name && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-green-500 rounded-b-full"></span>
                            )}
                            <item.icon size={24} />
                            <span className="text-xs font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>
            </footer>
        </div>
    );
};

export default App;