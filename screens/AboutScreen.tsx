import React from 'react';
import { ShoppingBasket, ChefHat, Heart, Sprout, Info, Leaf } from '../components/icons';

const AboutScreen: React.FC = () => {
    return (
        <div className="p-4 md:p-8 text-gray-300">
            <header className="text-center mb-10">
                 <div className="inline-flex items-center gap-4 mb-4 justify-center">
                    <div className="bg-green-500 p-4 rounded-lg">
                        <Leaf className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white">EcoEats</h1>
                </div>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                   An AI-powered sustainability platform helping you reduce food waste through smart tracking, recipe suggestions, and community donations.
                </p>
            </header>

            <div className="bg-[#161B22] border border-gray-700/50 p-6 md:p-8 rounded-xl mb-8">
                <h2 className="text-2xl font-bold text-white text-center mb-8">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800 text-green-400 flex items-center justify-center mb-3">
                            <ShoppingBasket size={32}/>
                        </div>
                        <h3 className="font-semibold text-lg text-white mb-1">1. Track</h3>
                        <p className="text-gray-400 text-sm">Scan and monitor your pantry items effortlessly. Know what you have and when it expires.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800 text-green-400 flex items-center justify-center mb-3">
                            <ChefHat size={32}/>
                        </div>
                        <h3 className="font-semibold text-lg text-white mb-1">2. Act</h3>
                        <p className="text-gray-400 text-sm">Get smart AI recipes to use up ingredients or donate surplus food to local NGOs.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800 text-green-400 flex items-center justify-center mb-3">
                            <Heart size={32}/>
                        </div>
                        <h3 className="font-semibold text-lg text-white mb-1">3. Impact</h3>
                        <p className="text-gray-400 text-sm">See your positive impact on the planet and earn rewards for your sustainable actions.</p>
                    </div>
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#161B22] border border-gray-700/50 p-6 rounded-xl">
                     <h2 className="text-2xl font-bold text-white mb-4">Our Values</h2>
                     <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start">
                            <Sprout className="text-green-500 mr-4 mt-1 flex-shrink-0" size={20} />
                            <div><strong className="block text-gray-200">Sustainability First:</strong> We are committed to creating solutions that benefit our planet.</div>
                        </li>
                         <li className="flex items-start">
                            <Heart className="text-amber-500 mr-4 mt-1 flex-shrink-0" size={20} />
                            <div><strong className="block text-gray-200">Community Impact:</strong> We believe in the power of community to create meaningful change.</div>
                        </li>
                         <li className="flex items-start">
                            <Info className="text-sky-500 mr-4 mt-1 flex-shrink-0" size={20} />
                            <div><strong className="block text-gray-200">Innovation for Good:</strong> We leverage technology like AI to tackle real-world problems.</div>
                        </li>
                     </ul>
                </div>
                 <div className="bg-[#161B22] border border-gray-700/50 p-6 rounded-xl">
                     <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                     <p className="text-gray-400">Have questions or feedback? We'd love to hear from you!</p>
                     <a href="mailto:hello@ecoeats.app" className="mt-4 inline-block bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition">
                        hello@ecoeats.app
                     </a>
                </div>
            </div>

        </div>
    );
};

export default AboutScreen;