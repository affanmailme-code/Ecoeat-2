import React, { useState, useMemo } from 'react';
import { PantryItem, Recipe, ItemStatus } from '../types';
import { generateRecipes } from '../services/geminiService';
import { RecipeCard } from '../components/RecipeCard';
import { Button } from '../components/Button';
import { ChefHat } from '../components/icons';
import { differenceInDays, parseJSON, isValid, isBefore, startOfToday } from 'date-fns';

interface RecipesScreenProps {
    pantryItems: PantryItem[];
    addPoints: (points: number, reasonMessage?: string) => void;
    updateItemStatus: (itemId: string, status: ItemStatus) => void;
}

const RecipesScreen: React.FC<RecipesScreenProps> = ({ pantryItems, addPoints, updateItemStatus }) => {
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableIngredients = useMemo(() => {
        const today = startOfToday();
        return pantryItems
            .filter(item => {
                if (item.status !== ItemStatus.Active) {
                    return false; // Must be active
                }
                try {
                    const expiryDate = parseJSON(item.expiryDate);
                    // It's expired if the date is valid and before today
                    if (isValid(expiryDate) && isBefore(expiryDate, today)) {
                        return false; 
                    }
                } catch (e) {
                    // Treat parsing errors as "not expired" to be consistent with PantryScreen
                }
                return true; // It's fresh
            })
            .sort((a, b) => {
                try {
                    const dateA = parseJSON(a.expiryDate);
                    const dateB = parseJSON(b.expiryDate);
                    if (!isValid(dateA)) return 1; // Invalid dates go to the end
                    if (!isValid(dateB)) return -1;
                    return differenceInDays(dateA, new Date()) - differenceInDays(dateB, new Date());
                } catch (e) { return 0; }
            });
    }, [pantryItems]);

    const handleToggleIngredient = (productName: string) => {
        setSelectedIngredients(prev =>
            prev.includes(productName)
                ? prev.filter(ing => ing !== productName)
                : [...prev, productName]
        );
    };

    const handleGenerateRecipes = async () => {
        if (selectedIngredients.length === 0) {
            setError('Please select at least one ingredient.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setGeneratedRecipes([]);
        try {
            const recipes = await generateRecipes(selectedIngredients);
            setGeneratedRecipes(recipes);
        } catch (err) {
            setError('Failed to generate recipes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    /**
     * Handles the user action of cooking a recipe.
     * This function uses the reliable `usedIngredients` list from the AI to mark items as used.
     * @param recipe - The recipe that was cooked.
     */
    const handleMarkAsCooked = (recipe: Recipe) => {
        addPoints(10, 'Recipe cooked');
    
        // Create a set of available item IDs for efficient lookup and to prevent double-marking
        const availableItemIds = new Set(
            pantryItems.filter(p => p.status === ItemStatus.Active).map(p => p.id)
        );
    
        // Use the reliable list of used ingredients from the API
        recipe.usedIngredients.forEach(usedIngredientName => {
            // Find the first available pantry item that matches the ingredient name (case-insensitive)
            const pantryItem = pantryItems.find(p => 
                availableItemIds.has(p.id) &&
                p.productName.toLowerCase() === usedIngredientName.toLowerCase()
            );
            
            if (pantryItem) {
                updateItemStatus(pantryItem.id, ItemStatus.Used);
                // Remove from our available set so it can't be marked as used again in this same operation
                availableItemIds.delete(pantryItem.id);
            }
        });
    };

    return (
        <div className="py-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-100">AI-powered recipe suggestions</h1>
                <p className="text-gray-400 mt-1">Generate recipes to use up your ingredients and prevent waste.</p>
            </header>

            <div className="bg-[#161B22] border border-gray-700/50 p-6 rounded-xl mb-8">
                <h2 className="text-xl font-semibold text-gray-200 mb-4">Select Ingredients</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                    {availableIngredients.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleToggleIngredient(item.productName)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all transform active:scale-95 ${selectedIngredients.includes(item.productName) ? 'bg-green-500 text-white border-green-500 scale-105 shadow-md shadow-green-500/20' : 'bg-gray-800/80 text-gray-200 border-gray-700 hover:border-green-500'}`}
                        >
                            {item.productName}
                        </button>
                    ))}
                     {availableIngredients.length === 0 && (
                        <p className="text-gray-400">Your pantry is empty. Add items to get recipe suggestions.</p>
                    )}
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <Button onClick={handleGenerateRecipes} disabled={isLoading || availableIngredients.length === 0} size="large">
                    {isLoading ? 'Generating...' : <> <ChefHat className="mr-2" /> Generate Recipes ({selectedIngredients.length} Ingredients)</>}
                </Button>
            </div>
            
            {isLoading && (
                 <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                 </div>
            )}

            {generatedRecipes.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-100">Your Recipes</h2>
                        <div className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-lg border border-gray-700">
                            Recipes generated! Found {generatedRecipes.length} delicious recipes.
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {generatedRecipes.map((recipe, index) => (
                           <div key={index} className="animate-card-fade-in" style={{ animationDelay: `${index * 100}ms`}}>
                               <RecipeCard recipe={recipe} onCook={handleMarkAsCooked} />
                           </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipesScreen;