import React, { useState, useMemo, useEffect } from 'react';
import { PantryItem, NGO, ItemStatus } from '../types';
import { Button } from '../components/Button';
import { Heart, MapPin, Check } from '../components/icons';
import { SAMPLE_NGOS } from '../constants';
import { differenceInDays, parseJSON, isValid, isBefore, startOfToday } from 'date-fns';

interface DonateScreenProps {
    pantryItems: PantryItem[];
    addDonation: (itemIds: string[], ngoName: string) => void;
}

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @returns The distance in kilometers.
 */
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};


const DonateScreen: React.FC<DonateScreenProps> = ({ pantryItems, addDonation }) => {
    const [step, setStep] = useState(1);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null);
    const [nearbyNgos, setNearbyNgos] = useState<NGO[]>([]);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        if (step === 2) {
            setIsLocationLoading(true);
            setLocationError(null);
            setSelectedNgo(null); // Reset selection when re-entering step

            if (!navigator.geolocation) {
                setLocationError("Geolocation is not supported by your browser.");
                setIsLocationLoading(false);
                setNearbyNgos([]); // Ensure list is empty
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const MAX_DISTANCE_KM = 100; // Define a reasonable radius for "nearby"

                    const ngosWithDistance = SAMPLE_NGOS.map(ngo => ({
                        ...ngo,
                        distance: getDistanceFromLatLonInKm(latitude, longitude, ngo.latitude, ngo.longitude)
                    }));

                    const trulyNearbyNgos = ngosWithDistance.filter(ngo => ngo.distance <= MAX_DISTANCE_KM);

                    trulyNearbyNgos.sort((a, b) => a.distance - b.distance);
                    
                    setNearbyNgos(trulyNearbyNgos);

                    if (trulyNearbyNgos.length === 0) {
                         setLocationError(`We couldn't find any partner NGOs within ${MAX_DISTANCE_KM}km of your location. We are actively expanding our network!`);
                    }

                    setIsLocationLoading(false);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationError("Could not get your location. Please ensure location services are enabled to find nearby NGOs.");
                    setIsLocationLoading(false);
                    setNearbyNgos([]); // Don't show any list if we can't get location
                }
            );
        }
    }, [step]);

    const donatableItems = useMemo(() => {
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
                return true; // It's fresh and donatable
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

    const handleToggleItem = (itemId: string) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };
    
    const handleConfirmDonation = () => {
        if(selectedNgo){
            addDonation(selectedItemIds, selectedNgo.name);
            setStep(3);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Donate Food</h1>
                <p className="text-gray-400 mt-1">Share your surplus food with those in need.</p>
            </header>
            
            {/* Step Indicator */}
            <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 sm:text-base mb-8">
                <li className={`flex md:w-full items-center ${step >= 1 ? 'text-green-500' : ''} after:content-[''] after:w-full after:h-1 after:border-b ${step >= 2 ? 'after:border-green-500' : 'after:border-gray-700'} after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
                    <span className={`flex items-center px-2 py-1 rounded-full ${step >=1 ? 'bg-green-500/10' : ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm ${step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-700'}`}>
                           {step > 1 ? <Check size={14}/> : '1'}
                        </span>
                        Select <span className="hidden sm:inline-flex sm:ml-1">Items</span>
                    </span>
                </li>
                <li className={`flex md:w-full items-center ${step >= 2 ? 'text-green-500' : ''} after:content-[''] after:w-full after:h-1 after:border-b ${step >= 3 ? 'after:border-green-500' : 'after:border-gray-700'} after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
                    <span className={`flex items-center px-2 py-1 rounded-full ${step >=2 ? 'bg-green-500/10' : ''}`}>
                         <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm ${step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-700'}`}>
                           {step > 2 ? <Check size={14}/> : '2'}
                        </span>
                        Find <span className="hidden sm:inline-flex sm:ml-1">NGO</span>
                    </span>
                </li>
                <li className={`flex items-center ${step >= 3 ? 'text-green-500' : ''}`}>
                    <span className={`flex items-center px-2 py-1 rounded-full ${step >=3 ? 'bg-green-500/10' : ''}`}>
                         <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm ${step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-700'}`}>
                           {step > 3 ? <Check size={14}/> : '3'}
                        </span>
                        Confirm
                    </span>
                </li>
            </ol>

            <div className="bg-[#161B22] border border-gray-700/50 p-6 rounded-xl">
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-200 mb-4">Step 1: Select Items to Donate</h2>
                        <div className="space-y-3">
                            {donatableItems.length > 0 ? donatableItems.map(item => (
                                <div key={item.id} onClick={() => handleToggleItem(item.id)} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border-2 ${selectedItemIds.includes(item.id) ? 'bg-green-900/50 border-green-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                                    <div>
                                        <p className="font-semibold text-gray-200">{item.productName}</p>
                                        <p className="text-sm text-gray-400">Qty: {item.quantity} - Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${selectedItemIds.includes(item.id) ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                                        {selectedItemIds.includes(item.id) && <Check className="text-white" size={16} />}
                                    </div>
                                </div>
                            )) : <p className="text-gray-400">You have no items in your pantry to donate.</p>}
                        </div>
                        <Button onClick={() => setStep(2)} disabled={selectedItemIds.length === 0} className="mt-6" size="large">Next: Find NGO</Button>
                    </div>
                )}
                
                {step === 2 && (
                    isLocationLoading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                            <p className="mt-4 text-gray-400">Finding NGOs near you...</p>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-200 mb-4">Step 2: Choose a Nearby NGO</h2>
                            {locationError && <p className="text-amber-500 bg-amber-900/50 p-3 rounded-lg mb-4">{locationError}</p>}
                            <div className="space-y-4">
                                {nearbyNgos.length > 0 ? (
                                    nearbyNgos.slice(0, 3).map(ngo => (
                                        <div key={ngo.id} onClick={() => setSelectedNgo(ngo)} className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${selectedNgo?.id === ngo.id ? 'bg-green-900/50 border-green-500' : 'bg-gray-800 border-gray-700 hover:border-green-600'}`}>
                                            <h3 className="font-bold text-lg text-gray-200">{ngo.name}</h3>
                                            <p className="text-gray-400">{ngo.address}</p>
                                            {ngo.distance !== undefined && (
                                                <p className="text-sm text-green-400 font-semibold flex items-center mt-1"><MapPin size={14} className="mr-1"/> {ngo.distance.toFixed(1)} km away</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    !isLocationLoading && (
                                        <div className="text-center text-gray-400 py-4">
                                            <p>No nearby NGOs found in our network.</p>
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="flex gap-4 mt-6">
                                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={handleConfirmDonation} disabled={!selectedNgo} size="large">Confirm Donation</Button>
                            </div>
                        </div>
                    )
                )}
                
                {step === 3 && (
                     <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-900/50 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-100">Thank You!</h2>
                        <p className="text-gray-400 mt-2">Your donation has been recorded. You've earned +{selectedItemIds.length * 15} EcoPoints!</p>
                        <Button onClick={() => { setStep(1); setSelectedItemIds([]); setSelectedNgo(null); }} className="mt-6">Make Another Donation</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonateScreen;