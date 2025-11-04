import React from 'react';
import { PantryItem, ItemStatus, QuantityUnit } from '../types';
import { Button } from './Button';
import { Trash, Check } from './icons';
import { differenceInDays, parseJSON, format, isValid } from 'date-fns';

interface PantryItemCardProps {
    item: PantryItem;
    onClick: (item: PantryItem) => void;
    onStatusChange: (itemId: string, status: ItemStatus) => void;
    onDeleteItem: (item: PantryItem) => void;
    isSelectMode: boolean;
    isSelected: boolean;
    onSelectItem: (itemId: string) => void;
}

export const PantryItemCard: React.FC<PantryItemCardProps> = ({ item, onClick, onStatusChange, onDeleteItem, isSelectMode, isSelected, onSelectItem }) => {
    let daysLeft: number | null = null;
    let formattedExpiry = 'Invalid Date';
    
    try {
        const expiryDate = parseJSON(item.expiryDate);
        if (isValid(expiryDate)) {
            daysLeft = differenceInDays(expiryDate, new Date());
            formattedExpiry = format(expiryDate, 'MM/dd/yyyy');
        }
    } catch (error) {
        console.error("Error parsing date for pantry item:", item.productName, error);
    }

    const isExpired = daysLeft !== null && daysLeft < 0;

    const expiryStatusColor = isExpired
        ? 'text-red-400'
        : daysLeft !== null && daysLeft <= 3
        ? 'text-amber-400'
        : 'text-gray-400';

    const quantityUnitDisplay = (item.quantityUnit === QuantityUnit.pcs)
        ? (item.quantity === 1 ? 'pc' : 'pcs')
        : item.quantityUnit;


    return (
        <div 
            onClick={isSelectMode ? () => onSelectItem(item.id) : () => onClick(item)}
            className={`bg-[#161B22] border rounded-lg p-4 flex flex-col gap-3 relative overflow-hidden transition-all duration-200 group ${isSelectMode ? 'cursor-pointer' : 'cursor-pointer hover:-translate-y-1'} ${isExpired ? 'border-red-500/30' : 'border-gray-700/50'} ${isSelected ? 'border-sky-500 ring-2 ring-sky-500/50' : (isExpired ? 'hover:border-red-500/60' : 'hover:border-gray-600')}`}
        >
             {isSelectMode && (
                <div className="absolute top-2 right-2 z-10 pointer-events-none">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-sky-500 border-sky-400' : 'bg-gray-900/50 border-gray-500'}`}>
                        {isSelected && <Check className="text-white" size={16} />}
                    </div>
                </div>
            )}
            <div className={`absolute top-0 left-0 h-full w-1 transition-all ${isExpired ? 'bg-red-500 group-hover:bg-red-400' : 'bg-green-500 group-hover:bg-green-400'}`}></div>
            
            <div className="w-full h-40 bg-black/20 rounded-md flex items-center justify-center overflow-hidden pointer-events-none">
                <img 
                    src={item.imageURL} 
                    alt={item.productName} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // prevents looping
                        target.src = `https://picsum.photos/seed/${encodeURIComponent(item.productName)}/300/200`;
                    }}
                />
            </div>

            <div className="pl-2 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg text-white capitalize">{item.productName}</h3>
                        <p className="text-sm text-gray-400">{item.category}</p>
                    </div>
                     <span className="bg-green-900/70 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full border border-green-500/30">{item.status}</span>
                </div>

                <div className="text-sm space-y-1 text-gray-300 mb-4">
                    <p>Expires: <span className={expiryStatusColor}>{formattedExpiry}</span></p>
                    <p>Quantity: {item.quantity} {quantityUnitDisplay}</p>
                </div>
                
                {!isSelectMode && (
                    <div className="flex gap-2 mt-auto pt-2 border-t border-gray-700/50">
                        <Button 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                onStatusChange(item.id, ItemStatus.Used);
                            }} 
                            className="flex-1" 
                            size="small"
                        >
                            <Check size={16} className="mr-1.5" />
                            Mark as Used
                        </Button>
                        <Button 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                onDeleteItem(item);
                            }} 
                            variant="secondary" 
                            className="px-3" 
                            size="small"
                        >
                            <Trash size={16} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};