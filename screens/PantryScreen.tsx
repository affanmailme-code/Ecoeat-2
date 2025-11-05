import React, { useState, useMemo, useRef } from 'react';
import { PantryItem, ItemStatus, QuantityUnit, ScannedProductDetails } from '../types';
import { PantryItemCard } from '../components/PantryItemCard';
import { Plus, X, Search, Calendar, Upload, Sparkles, Trash, Image as ImageIcon } from '../components/icons';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { CATEGORIES } from '../constants';
import { parseJSON, differenceInDays, isBefore, startOfToday, format, isValid } from 'date-fns';
import { generateProductImage, extractProductDetailsFromImage } from '../services/geminiService';
import ItemDetailScreen from './ItemDetailScreen';

interface PantryScreenProps {
    pantryItems: PantryItem[];
    updateItemStatus: (itemId: string, status: ItemStatus) => void;
    addItem: (item: Omit<PantryItem, 'id' | 'addedDate' | 'status' | 'nutrition'>) => Promise<void>;
    deleteItem: (itemId: string) => void;
    deleteMultipleItems: (itemIds: string[]) => void;
}

const AddItemForm: React.FC<{ onAddItem: (item: any) => Promise<void>, onCancel: () => void }> = ({ onAddItem, onCancel }) => {
    const [newItem, setNewItem] = useState({
        productName: '',
        category: CATEGORIES[0],
        expiryDate: '',
        quantity: 1,
        quantityUnit: QuantityUnit.pcs,
        imageURL: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [autofillError, setAutofillError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: name === 'quantity' ? parseFloat(value) : value }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const expiryDate = new Date(newItem.expiryDate);
        if (isNaN(expiryDate.getTime()) || !newItem.expiryDate) {
            setFormError('Please enter a valid expiry date.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onAddItem(newItem);
        } catch (error) {
            console.error("Failed to add item:", error);
            if (error instanceof Error) {
                setFormError(error.message);
            } else {
                setFormError("An error occurred while adding the item. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!newItem.productName.trim()) {
            setAutofillError("Please enter a product name first.");
            return;
        }
        setAutofillError(null);
        setIsGeneratingImage(true);
        try {
            const imageUrl = await generateProductImage(newItem.productName, newItem.quantityUnit);
            setNewItem(prev => ({ ...prev, imageURL: imageUrl }));
        } catch (error) {
            console.error("Error generating image:", error);
            setAutofillError("Failed to generate AI image. Please try again.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleScanComplete = (details: ScannedProductDetails) => {
        let formattedDate = '';
        if (details.expiry_date && details.expiry_date.toLowerCase() !== 'not visible on packaging' && details.expiry_date.trim() !== '') {
            try {
                // Attempt to parse various common date formats
                const dateString = details.expiry_date.replace(/[\.\/]/g, '-');
                const parts = dateString.split('-');
                let parsedDate;

                if (parts.length === 3) {
                     if (parts[0].length === 4) { // YYYY-MM-DD
                        parsedDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
                    } else if (parts[2].length === 4) { // DD-MM-YYYY
                        parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    }
                }
                
                if (!parsedDate) {
                    parsedDate = new Date(details.expiry_date);
                }
               
                if (isValid(parsedDate)) {
                    formattedDate = format(parsedDate, 'yyyy-MM-dd');
                }
            } catch (e) {
                console.warn("Could not parse date from scanner:", details.expiry_date);
            }
        }
        
        setNewItem(prev => ({
            ...prev,
            productName: details.product_name !== 'Not clearly visible' ? details.product_name : prev.productName,
            expiryDate: formattedDate || prev.expiryDate,
        }));
    };
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setAutofillError(null);

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64Image = (reader.result as string).split(',')[1];
                setNewItem(prev => ({...prev, imageURL: reader.result as string}));
                const details = await extractProductDetailsFromImage(base64Image);
                if (details) {
                    handleScanComplete(details);
                } else {
                    setAutofillError("Could not extract details. Please enter manually.");
                }
            } catch (err) {
                console.error("Error during image upload analysis:", err);
                setAutofillError("An error occurred. Please enter manually.");
            } finally {
                setIsUploading(false);
                if (e.target) e.target.value = ''; // Reset file input
            }
        };
        reader.readAsDataURL(file);
    };

    const openDatePicker = () => {
        const input = dateInputRef.current;
        if (input) {
            try {
                 input.showPicker();
            } catch (error) {
                 input.focus();
            }
        }
    };


    const formInputClasses = "block w-full bg-transparent border-0 border-b border-gray-600 focus:ring-0 focus:border-emerald-400 p-2 text-gray-200 placeholder-gray-500 transition-colors";
    
    const anyLoading = isSubmitting || isUploading || isGeneratingImage;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="w-full max-w-xs mx-auto aspect-[4/5] bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 overflow-hidden relative">
                {isGeneratingImage || isUploading ? (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-400"></div>
                        <p className="mt-3 text-sm font-semibold">{isGeneratingImage ? 'Generating Image...' : 'Scanning...'}</p>
                    </div>
                ) : newItem.imageURL ? (
                    <img src={newItem.imageURL} alt="Product preview" className="w-full h-full object-cover"/>
                ) : (
                    <div className="text-center text-gray-500">
                        <ImageIcon size={48} className="mx-auto" />
                        <p className="mt-2 text-sm">Image Preview</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="secondary" onClick={handleUploadClick} disabled={anyLoading}>
                    <Upload size={16} className="mr-2"/> Upload & Scan
                </Button>
                <Button type="button" variant="secondary" onClick={handleGenerateImage} disabled={anyLoading}>
                    <Sparkles size={16} className="mr-2"/> Generate AI Image
                </Button>
            </div>
            
            {autofillError && <p className="text-amber-500 text-center text-sm -mt-2">{autofillError}</p>}

            <div>
                <label className="block text-sm font-medium text-gray-400">Product Name *</label>
                <input type="text" name="productName" value={newItem.productName} onChange={handleChange} required className={formInputClasses} placeholder="e.g., Organic Milk" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400">Category *</label>
                <select name="category" value={newItem.category} onChange={handleChange} className={`${formInputClasses} mt-1`}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-gray-800 text-gray-200">{cat}</option>)}
                </select>
            </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Expiry Date *</label>
                    <div className="relative mt-1">
                        <input 
                            ref={dateInputRef}
                            type="text" 
                            name="expiryDate" 
                            value={newItem.expiryDate} 
                            onChange={handleChange} 
                            required 
                            placeholder="yyyy-mm-dd"
                            onFocus={(e) => e.target.type = 'date'}
                            onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                            className={`${formInputClasses} pr-10`}
                        />
                        <div 
                            onClick={openDatePicker}
                            className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-2"
                        >
                            <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-400">Quantity *</label>
                        <input type="number" name="quantity" step="0.01" min="0" value={newItem.quantity} onChange={handleChange} required className={`${formInputClasses} mt-1`}/>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-400">Unit *</label>
                        <select name="quantityUnit" value={newItem.quantityUnit} onChange={handleChange} className={`${formInputClasses} mt-1`}>
                            <option value={QuantityUnit.pcs} className="bg-gray-800 text-gray-200">pcs</option>
                            <option value={QuantityUnit.kg} className="bg-gray-800 text-gray-200">kg</option>
                            <option value={QuantityUnit.g} className="bg-gray-800 text-gray-200">g</option>
                            <option value={QuantityUnit.L} className="bg-gray-800 text-gray-200">L</option>
                            <option value={QuantityUnit.ml} className="bg-gray-800 text-gray-200">ml</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}

            <div className="pt-2">
                 <button type="submit" disabled={anyLoading} className="w-full inline-flex items-center justify-center font-bold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-px focus:ring-offset-gray-800 px-6 py-3 text-lg bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white focus:ring-cyan-500">
                    <Plus size={20} className="mr-1.5" />
                    {isSubmitting ? 'Adding to Pantry...' : 'Add to Pantry'}
                </button>
            </div>
        </form>
    )
}

const PantryGrid: React.FC<{
    items: PantryItem[], 
    onItemClick: (item: PantryItem) => void,
    onStatusChange: (itemId: string, status: ItemStatus) => void, 
    onDeleteItem: (item: PantryItem) => void,
    isSelectMode: boolean,
    selectedItemIds: string[],
    onSelectItem: (itemId: string) => void
}> = ({ items, onItemClick, onStatusChange, onDeleteItem, isSelectMode, selectedItemIds, onSelectItem }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {items.map((item, index) => (
            <div key={item.id} className="animate-card-fade-in" style={{ animationDelay: `${index * 50}ms`}}>
                <PantryItemCard 
                    item={item} 
                    onClick={onItemClick}
                    onStatusChange={onStatusChange} 
                    onDeleteItem={onDeleteItem} 
                    isSelectMode={isSelectMode}
                    isSelected={selectedItemIds.includes(item.id)}
                    onSelectItem={onSelectItem}
                />
            </div>
        ))}
    </div>
);


const PantryScreen: React.FC<PantryScreenProps> = ({ pantryItems, updateItemStatus, addItem, deleteItem, deleteMultipleItems }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PantryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    
    const { freshItems, expiredItems } = useMemo(() => {
        const today = startOfToday();
        const activeItems = pantryItems
            .filter(item => item.status === ItemStatus.Active)
            .filter(item =>
                item.productName.toLowerCase().includes(searchQuery.toLowerCase())
            );

        const fresh: PantryItem[] = [];
        const expired: PantryItem[] = [];

        for (const item of activeItems) {
            try {
                const expiryDate = parseJSON(item.expiryDate);
                // An item is expired if its expiry date is *before* today.
                if (isValid(expiryDate) && isBefore(expiryDate, today)) {
                    expired.push(item);
                } else {
                    // Items expiring today, in the future, or with invalid dates are considered fresh.
                    fresh.push(item);
                }
            } catch (e) {
                // If parsing fails, treat as fresh.
                fresh.push(item);
            }
        }
        
        const sortByExpiry = (a: PantryItem, b: PantryItem) => {
             try {
                const dateA = parseJSON(a.expiryDate);
                const dateB = parseJSON(b.expiryDate);
                if (!isValid(dateA)) return 1;
                if (!isValid(dateB)) return -1;
                return dateA.getTime() - dateB.getTime();
            } catch (e) { return 0; }
        };

        fresh.sort(sortByExpiry);
        expired.sort(sortByExpiry);

        return { freshItems: fresh, expiredItems: expired };
    }, [pantryItems, searchQuery]);

    const handleAddItem = async (item: any) => {
        const itemWithISO = { ...item, expiryDate: new Date(item.expiryDate).toISOString() };
        await addItem(itemWithISO);
        setIsAddModalOpen(false);
    };

    const handleOpenDeleteModal = (item: PantryItem) => {
        setItemToDelete(item);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            deleteItem(itemToDelete.id);
            // If we were on the detail screen for the item being deleted, go back
            if (selectedItem?.id === itemToDelete.id) {
                setSelectedItem(null);
            }
            setItemToDelete(null);
        }
    };

    const handleUpdateStatusFromDetail = (itemId: string, status: ItemStatus) => {
        updateItemStatus(itemId, status);
        setSelectedItem(null); // Go back to the list
    };

    const handleToggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedItemIds([]); // Clear selection when toggling mode
    };

    const handleSelectItem = (itemId: string) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleConfirmBulkDelete = () => {
        deleteMultipleItems(selectedItemIds);
        setIsBulkDeleteModalOpen(false);
        setIsSelectMode(false);
        setSelectedItemIds([]);
    };
    
    const totalActiveItems = pantryItems.filter(item => item.status === ItemStatus.Active).length;
    const searchResultsCount = freshItems.length + expiredItems.length;
    const noItemsInitially = totalActiveItems === 0;
    const noSearchResults = totalActiveItems > 0 && searchResultsCount === 0;

    if (selectedItem) {
        return (
            <ItemDetailScreen 
                item={selectedItem}
                onBack={() => setSelectedItem(null)}
                onUpdateStatus={handleUpdateStatusFromDetail}
                onDelete={handleOpenDeleteModal}
            />
        );
    }

    return (
        <div className="py-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">My Pantry</h1>
                    <p className="text-gray-400 mt-1">
                        {isSelectMode 
                            ? `${selectedItemIds.length} item(s) selected` 
                            : 'Track and manage your food items with AI'
                        }
                    </p>
                </div>
                 <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {isSelectMode ? (
                        <>
                            <Button
                                variant="danger"
                                onClick={() => setIsBulkDeleteModalOpen(true)}
                                disabled={selectedItemIds.length === 0}
                            >
                                <Trash size={16} className="mr-2" />
                                Delete ({selectedItemIds.length})
                            </Button>
                            <Button variant="secondary" onClick={handleToggleSelectMode}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            {totalActiveItems > 0 && (
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input 
                                        type="text"
                                        placeholder="Search items..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-gray-800 border border-gray-600/50 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 w-full sm:w-48 focus:sm:w-64 transition-all duration-300 focus:bg-gray-900"
                                    />
                                </div>
                            )}
                            <Button variant="secondary" onClick={handleToggleSelectMode} disabled={noItemsInitially}>
                                Select
                            </Button>
                            <Button onClick={() => setIsAddModalOpen(true)} className="flex-shrink-0">
                                <Plus size={20} className="mr-2" /> Add Item
                            </Button>
                        </>
                    )}
                </div>
            </header>
            
            {noItemsInitially ? (
                 <div className="text-center py-20 bg-[#161B22] border border-gray-700/50 rounded-xl animate-card-fade-in">
                    <h2 className="text-xl font-semibold text-gray-300">Your pantry is empty!</h2>
                    <p className="text-gray-400 mt-2">Click "Add Item" to start tracking your food.</p>
                </div>
            ) : noSearchResults ? (
                <div className="text-center py-20 bg-[#161B22] border border-gray-700/50 rounded-xl animate-card-fade-in">
                    <h2 className="text-xl font-semibold text-gray-300">No items found</h2>
                    <p className="text-gray-400 mt-2">Your search for "{searchQuery}" did not match any items.</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {expiredItems.length > 0 && (
                        <section>
                            <div className="border-b border-red-500/50 pb-2 mb-4">
                                <h2 className="text-lg font-semibold text-red-400">
                                    Expired Items ({expiredItems.length})
                                </h2>
                            </div>
                            <PantryGrid
                                items={expiredItems}
                                onItemClick={setSelectedItem}
                                onStatusChange={updateItemStatus}
                                onDeleteItem={handleOpenDeleteModal}
                                isSelectMode={isSelectMode}
                                selectedItemIds={selectedItemIds}
                                onSelectItem={handleSelectItem}
                            />
                        </section>
                    )}
                    
                    {freshItems.length > 0 && (
                        <section>
                            <div className="border-b border-gray-700/50 pb-2 mb-4">
                                <h2 className="text-lg font-semibold text-gray-300">
                                    Fresh Items ({freshItems.length})
                                </h2>
                            </div>
                            <PantryGrid
                                items={freshItems}
                                onItemClick={setSelectedItem}
                                onStatusChange={updateItemStatus}
                                onDeleteItem={handleOpenDeleteModal}
                                isSelectMode={isSelectMode}
                                selectedItemIds={selectedItemIds}
                                onSelectItem={handleSelectItem}
                            />
                        </section>
                    )}
                </div>
            )}
            
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Pantry Item">
                <AddItemForm onAddItem={handleAddItem} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Confirm Deletion">
                <p className="text-gray-300">Are you sure you want to delete <strong>{itemToDelete?.productName}</strong>? This action cannot be undone.</p>
                <div className="flex justify-end gap-3 pt-4 mt-4">
                    <Button variant="secondary" onClick={() => setItemToDelete(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
                </div>
            </Modal>

            <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Confirm Bulk Deletion">
                <p className="text-gray-300">Are you sure you want to delete <strong>{selectedItemIds.length} selected item(s)</strong>? This action cannot be undone.</p>
                <div className="flex justify-end gap-3 pt-4 mt-4">
                    <Button variant="secondary" onClick={() => setIsBulkDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmBulkDelete}>Delete Items</Button>
                </div>
            </Modal>
        </div>
    );
};

export default PantryScreen;