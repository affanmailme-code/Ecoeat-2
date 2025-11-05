import React from 'react';
import { PantryItem, ItemStatus } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, Calendar, ShoppingBasket, Check, Trash } from '../components/icons';
import { format, parseJSON, isValid } from 'date-fns';
import useLocalImage from '../hooks/useLocalImage';

interface ItemDetailScreenProps {
  item: PantryItem;
  onBack: () => void;
  onUpdateStatus: (itemId: string, status: ItemStatus) => void;
  onDelete: (item: PantryItem) => void;
}

const DetailRow: React.FC<{ icon: React.FC<any>, label: string, value: string, valueClassName?: string }> = ({ icon: Icon, label, value, valueClassName = '' }) => (
    <div className="flex items-center gap-3">
        <Icon size={20} className="text-gray-400 flex-shrink-0" />
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className={`font-semibold text-gray-100 ${valueClassName}`}>{value}</p>
        </div>
    </div>
);

const NutritionRow: React.FC<{ label: string, value: string, isBold?: boolean }> = ({ label, value, isBold = false }) => (
    <div className={`flex justify-between items-center py-1.5 border-b ${isBold ? 'border-gray-500' : 'border-gray-700/50'}`}>
        <p className={`${isBold ? 'font-bold text-gray-100' : 'text-gray-300'}`}>{label}</p>
        <p className={`${isBold ? 'font-bold text-gray-100' : 'text-gray-300'}`}>{value}</p>
    </div>
);

const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({ item, onBack, onUpdateStatus, onDelete }) => {
    
    const { imageSrc, isLoading } = useLocalImage(item);
    const formattedExpiry = isValid(parseJSON(item.expiryDate)) ? format(parseJSON(item.expiryDate), 'MMMM d, yyyy') : 'N/A';
    
    return (
        <div className="py-8 animate-card-fade-in">
             <header className="mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-green-400 font-semibold hover:text-green-300 transition-colors">
                    <ArrowLeft size={20} />
                    Back to Pantry
                </button>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Image and Details */}
                <div className="space-y-6">
                    <div className="w-full h-64 bg-black/20 rounded-xl shadow-lg border-2 border-gray-700/50 flex items-center justify-center overflow-hidden">
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
                        ) : (
                            <img 
                                src={imageSrc} 
                                alt={item.productName} 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = `https://picsum.photos/seed/${encodeURIComponent(item.productName)}/400/300`;
                                }}
                            />
                        )}
                    </div>
                     <div>
                        <p className="text-sm font-semibold text-green-400">{item.category}</p>
                        <h1 className="text-4xl font-bold text-white capitalize">{item.productName}</h1>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-[#161B22] border border-gray-700/50 p-4 rounded-lg">
                        <DetailRow icon={Calendar} label="Expires On" value={formattedExpiry} />
                        <DetailRow icon={ShoppingBasket} label="Quantity" value={`${item.quantity} ${item.quantityUnit}`} />
                        <DetailRow icon={Check} label="Status" value={item.status} valueClassName="text-green-400" />
                    </div>
                </div>

                {/* Right Side: Nutrition and Actions */}
                <div className="flex flex-col">
                    {item.nutrition ? (
                        <div className="bg-[#161B22] border border-gray-700/50 p-4 rounded-xl flex-grow flex flex-col">
                            <h2 className="text-2xl font-bold text-white border-b-4 border-gray-500 pb-1 mb-2">Nutrition Facts</h2>
                            <p className="text-sm text-gray-400">Amount per 100g</p>
                            <div className="space-y-1 mt-2 text-sm">
                                <NutritionRow label="Calories" value={item.nutrition.calories} isBold />
                                <NutritionRow label="Total Fat" value={item.nutrition.fat} />
                                <NutritionRow label="Total Carbohydrate" value={item.nutrition.carbs} />
                                <NutritionRow label="Dietary Fiber" value={item.nutrition.fiber} />
                                <NutritionRow label="Protein" value={item.nutrition.protein} />
                            </div>
                            <div className="mt-auto pt-6 space-y-3">
                                <Button onClick={() => onUpdateStatus(item.id, ItemStatus.Used)} className="w-full" size="large">
                                    <Check size={20} className="mr-2" /> Mark as Used
                                </Button>
                                <Button onClick={() => onDelete(item)} variant="secondary" className="w-full" size="large">
                                     <Trash size={20} className="mr-2" /> Delete Item
                                </Button>
                            </div>
                        </div>
                    ) : (
                         <div className="bg-[#161B22] border border-gray-700/50 p-6 rounded-xl flex-grow flex flex-col items-center justify-center text-center">
                            <h2 className="text-xl font-semibold text-gray-300">No Nutrition Data</h2>
                            <p className="text-gray-400 mt-2">Nutrition information for this item is not available.</p>
                             <div className="mt-auto pt-6 w-full space-y-3">
                                <Button onClick={() => onUpdateStatus(item.id, ItemStatus.Used)} className="w-full" size="large">
                                    <Check size={20} className="mr-2" /> Mark as Used
                                </Button>
                                <Button onClick={() => onDelete(item)} variant="secondary" className="w-full" size="large">
                                     <Trash size={20} className="mr-2" /> Delete Item
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemDetailScreen;