import React, { useState } from 'react';
import { Recipe } from '../types';
import { Button } from './Button';
import { Clock, Leaf, ChefHat } from './icons';

interface RecipeCardProps {
    recipe: Recipe;
    onCook: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onCook }) => {
    const [isCooked, setIsCooked] = useState(false);
    
    const handleCookClick = () => {
        onCook(recipe);
        setIsCooked(true);
    };
    
    return (
        <div className="bg-[#161B22] border border-gray-700/50 rounded-xl p-5 flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:border-gray-600 hover:shadow-lg hover:shadow-black/20">
            <h3 className="text-xl font-bold text-gray-100 mb-2">{recipe.title}</h3>
            <div className="flex items-center text-sm text-gray-400 mb-4">
                <Clock size={16} className="mr-2" /> {recipe.estimatedTime}
            </div>

            <div className="mb-4">
                <h4 className="font-semibold text-gray-200 mb-1">Ingredients:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                    {recipe.ingredients.map((ing, i) => 
                        <li key={i} className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">&#8227;</span>
                            <span>{ing}</span>
                        </li>
                    )}
                </ul>
            </div>
            
            <div className="bg-gray-800/50 text-gray-300 p-3 rounded-lg text-sm flex items-start mb-4 border border-gray-700">
                 <Leaf size={20} className="mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                    <strong className="font-semibold text-gray-200">Sustainability Tip: </strong>
                    {recipe.sustainabilityTip}
                </div>
            </div>
            
            <div className="mt-auto">
                <Button 
                    onClick={handleCookClick} 
                    disabled={isCooked}
                    className="w-full"
                >
                    <ChefHat className="mr-2" /> {isCooked ? 'Cooked!' : 'Mark as Cooked'}
                </Button>
            </div>
        </div>
    );
};