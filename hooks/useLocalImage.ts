import { useState, useEffect } from 'react';
import { getImage } from '../services/imageDB';
import { PantryItem } from '../types';

const useLocalImage = (item: PantryItem) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        const loadImage = async () => {
            if (item.imageURL && item.imageURL.startsWith('indexeddb:')) {
                try {
                    const base64Image = await getImage(item.id);
                    if (isMounted) {
                        if (base64Image) {
                            setImageSrc(base64Image);
                        } else {
                            // Fallback if image is not found in DB
                            setImageSrc(`https://placehold.co/400x300/161B22/E5E7EB?text=${encodeURIComponent(item.productName)}`);
                        }
                    }
                } catch (error) {
                    console.error("Failed to load image from IndexedDB", error);
                    if (isMounted) {
                       setImageSrc(`https://placehold.co/400x300/161B22/E5E7EB?text=Error`);
                    }
                } finally {
                    if (isMounted) {
                       setIsLoading(false);
                    }
                }
            } else {
                if (isMounted) {
                    setImageSrc(item.imageURL);
                    setIsLoading(false);
                }
            }
        };

        loadImage();

        return () => {
            isMounted = false;
        };
    }, [item.id, item.imageURL, item.productName]);

    return { imageSrc, isLoading };
};

export default useLocalImage;
