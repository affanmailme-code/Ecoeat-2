
import { useState, useCallback, useEffect, useMemo } from 'react';
import { User, PantryItem, Donation, ItemStatus, UserLevel, UserType } from '../types';
import { SAMPLE_USERS } from '../constants';
import { generateProductImage, getNutritionInfo, validatePantryItem } from '../services/geminiService';
import { sendWelcomeEmail, sendExpiryNotificationEmail } from '../services/emailService';
import { differenceInDays, isBefore, parseJSON, startOfToday, isValid } from 'date-fns';

/**
 * Helper function to safely read a JSON value from localStorage.
 * @param key The localStorage key.
 * @param defaultValue The default value to return if the key doesn't exist or is invalid.
 * @returns The parsed value from localStorage or the default value.
 */
const getStoredItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

/**
 * Helper function to safely write a JSON value to localStorage.
 * @param key The localStorage key.
 * @param value The value to store.
 */
const setStoredItem = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

interface EcoEatsDBProps {
  showToast?: (message: string, type: 'success' | 'error' | 'warning') => void;
}


/**
 * This custom hook acts as the central "backend" and data layer for the entire EcoEats application.
 * It manages all application state (users, pantry, donations) and contains the core business logic
 * for authentication, data manipulation, and the rewards system, with persistence via localStorage.
 */
const useEcoEatsDB = (props: EcoEatsDBProps = {}) => {
    const { showToast } = props;
    
    // --- STATE MANAGEMENT (Single Source of Truth) ---
    // The master list of all users is the single source of truth for user data.
    const [users, setUsers] = useState<User[]>(() => getStoredItem('eco_eats_users', SAMPLE_USERS));
    // We only store the ID of the currently logged-in user.
    const [currentUserId, setCurrentUserId] = useState<string | null>(() => getStoredItem('eco_eats_currentUserId', null));
    
    // The full currentUser object is derived from the master list. This prevents data inconsistency.
    const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || null, [users, currentUserId]);

    // Pantry and donation state are now loaded reactively based on the current user ID.
    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    
    // --- PERSISTENCE & DATA LOADING EFFECTS ---
    useEffect(() => {
        setStoredItem('eco_eats_users', users);
    }, [users]);

    useEffect(() => {
        setStoredItem('eco_eats_currentUserId', currentUserId);
    }, [currentUserId]);
    
    // This effect reactively loads or clears user-specific data whenever the logged-in user changes.
    useEffect(() => {
        if (currentUserId) {
            const userPantry = getStoredItem(`eco_eats_pantry_${currentUserId}`, []);
            const userDonations = getStoredItem(`eco_eats_donations_${currentUserId}`, []);
            setPantryItems(userPantry);
            setDonations(userDonations);
        } else {
            // If no user is logged in, clear their data.
            setPantryItems([]);
            setDonations([]);
        }
    }, [currentUserId]);
    
    useEffect(() => {
        if (currentUserId) {
            setStoredItem(`eco_eats_pantry_${currentUserId}`, pantryItems);
        }
    }, [pantryItems, currentUserId]);

    useEffect(() => {
        if (currentUserId) {
            setStoredItem(`eco_eats_donations_${currentUserId}`, donations);
        }
    }, [donations, currentUserId]);
    
    
    // --- AUTHENTICATION LOGIC (Simplified and more robust) ---
    const login = useCallback((email: string, password: string): User | null => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUserId(user.id);
            return user;
        }
        return null;
    }, [users]);

    const signUp = useCallback(async (name: string, email: string, password: string, userType: UserType): Promise<User | null> => {
        if (users.some(u => u.email === email)) {
            if (showToast) {
                showToast('An account with this email already exists.', 'error');
            }
            return null;
        }
        const newUser: User = {
            id: `user${Date.now()}`,
            name,
            email,
            password,
            userType,
            ecoPoints: 0,
            level: UserLevel.EcoSaver,
            profileImage: `https://i.pravatar.cc/150?u=${Date.now()}`
        };

        setUsers(prevUsers => [...prevUsers, newUser]);
        setCurrentUserId(newUser.id);

        sendWelcomeEmail(newUser.name, newUser.email).catch(err => {
            console.error("Background task to send welcome email failed:", err);
        });

        return newUser;
    }, [users, showToast]);

    const logout = useCallback(() => {
        setCurrentUserId(null);
    }, []);


    // --- BACKGROUND TASKS (Email notifications, initial image generation) ---

    useEffect(() => {
        if (currentUser) {
            const imagesGeneratedKey = `eco_eats_images_generated_${currentUser.id}`;
            const haveImagesBeenGenerated = getStoredItem(imagesGeneratedKey, false);

            if (!haveImagesBeenGenerated && pantryItems.length > 0) {
                const fetchInitialImages = async () => {
                    const updatedItems = await Promise.all(
                        pantryItems.map(async (item) => {
                            if (item.imageURL.includes('picsum.photos')) {
                                const newImageUrl = await generateProductImage(item.productName, item.quantityUnit);
                                return { ...item, imageURL: newImageUrl };
                            }
                            return item;
                        })
                    );
                    setPantryItems(updatedItems);
                    setStoredItem(imagesGeneratedKey, true);
                };
                fetchInitialImages();
            }
        }
    }, [currentUser, pantryItems]); 

    useEffect(() => {
        if (currentUser && pantryItems.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const lastEmailSentDate = localStorage.getItem('lastExpiryEmailDate');

            if (lastEmailSentDate !== today) {
                const todayStart = startOfToday();
                const activeItems = pantryItems.filter(item => item.status === ItemStatus.Active);
                
                const expired = activeItems.filter(item => {
                    try {
                        const expiryDate = parseJSON(item.expiryDate);
                        return isValid(expiryDate) && isBefore(expiryDate, todayStart);
                    } catch { return false; }
                });

                const expiringSoon = activeItems.filter(item => {
                    try {
                        const expiryDate = parseJSON(item.expiryDate);
                        if (!isValid(expiryDate)) return false;
                        const daysLeft = differenceInDays(expiryDate, todayStart);
                        return daysLeft >= 0 && daysLeft <= 3;
                    } catch { return false; }
                });

                if (expired.length > 0 || expiringSoon.length > 0) {
                    sendExpiryNotificationEmail(currentUser.name, currentUser.email, expired, expiringSoon)
                        .then(() => {
                            localStorage.setItem('lastExpiryEmailDate', today);
                        })
                        .catch(err => {
                            console.error("Background task to send daily expiry notification email failed:", err);
                        });
                }
            }
        }
    }, [currentUser, pantryItems]);


    // --- REWARDS & DONATIONS ---

    const addPoints = useCallback((points: number, reasonMessage?: string) => {
        if (!currentUserId) return;

        setUsers(prevUsers => {
            const newUsers = prevUsers.map(u => {
                if (u.id === currentUserId) {
                    const newPoints = u.ecoPoints + points;
                    
                    const determineUserLevel = (pts: number): UserLevel => {
                        if (pts >= 501) return UserLevel.PlanetProtector;
                        if (pts >= 301) return UserLevel.EcoHero;
                        if (pts >= 101) return UserLevel.EcoWarrior;
                        return UserLevel.EcoSaver;
                    };
                    
                    const newLevel = determineUserLevel(newPoints);
                    const updatedUser = { ...u, ecoPoints: newPoints, level: newLevel };
                    
                    if (showToast && points > 0) {
                        const message = reasonMessage 
                            ? `${reasonMessage}! (+${points} EcoPoints)` 
                            : `You earned +${points} EcoPoints!`;
                        showToast(message, 'success');
                    }

                    return updatedUser;
                }
                return u;
            });
            return newUsers;
        });
    }, [currentUserId, showToast]);
    
    // --- PANTRY & DATA MANAGEMENT ---
    
    const addItem = useCallback(async (item: Omit<PantryItem, 'id' | 'addedDate' | 'status' | 'nutrition'>) => {
        const trimmedProductName = item.productName.trim();

        if (!trimmedProductName) {
             throw new Error("Product name cannot be empty.");
        }

        const nutritionPromise = getNutritionInfo(trimmedProductName);
        const imagePromise = item.imageURL 
            ? Promise.resolve(item.imageURL)
            : generateProductImage(trimmedProductName, item.quantityUnit);
        
        const [nutrition, imageUrl] = await Promise.all([nutritionPromise, imagePromise]);
        
        // If nutrition info can't be found, it's a critical error. Block the item addition.
        if (!nutrition) {
            throw new Error(`Could not find nutrition info for "${trimmedProductName}". Please check the name for typos and try again.`);
        }

        const newItem: PantryItem = {
            ...item,
            productName: trimmedProductName,
            id: `item${Date.now()}`,
            addedDate: new Date().toISOString(),
            status: ItemStatus.Active,
            imageURL: imageUrl,
            nutrition: nutrition,
        };
        setPantryItems(prev => [...prev, newItem]);
    }, [showToast]);

    const updateItemStatus = useCallback((itemId: string, status: ItemStatus) => {
        setPantryItems(prev => {
            const itemToUpdate = prev.find(item => item.id === itemId);

            if (itemToUpdate && itemToUpdate.status === ItemStatus.Active && status === ItemStatus.Used) {
                addPoints(5, 'Item marked as used');
            }
            
            return prev.map(item => {
                if (item.id === itemId) {
                    const updatedItem = { ...item, status };
                    if (status === ItemStatus.Used || status === ItemStatus.Donated) {
                        updatedItem.dateCompleted = new Date().toISOString();
                    }
                    return updatedItem;
                }
                return item;
            });
        });
    }, [addPoints]);

    const deleteItem = useCallback((itemId: string) => {
        setPantryItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const deleteMultipleItems = useCallback((itemIds: string[]) => {
        setPantryItems(prev => prev.filter(item => !itemIds.includes(item.id)));
    }, []);

    const addDonation = useCallback((itemIds: string[], ngoName: string) => {
        if (!currentUser) return;

        const pointsToAdd = itemIds.length * 15;

        const newDonation: Donation = {
            id: `donation${Date.now()}`,
            userId: currentUser.id,
            itemIds,
            ngoName,
            dateDonated: new Date().toISOString(),
            pointsEarned: pointsToAdd,
        };
        setDonations(prev => [...prev, newDonation]);
        
        setPantryItems(prev => prev.filter(item => !itemIds.includes(item.id)));

        addPoints(pointsToAdd, 'Thank you for donating');
    }, [currentUser, addPoints]);

    return {
        currentUser,
        users,
        pantryItems,
        donations,
        login,
        signUp,
        logout,
        addItem,
        updateItemStatus,
        deleteItem,
        deleteMultipleItems,
        addDonation,
        addPoints,
    };
};

export default useEcoEatsDB;
