import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recipe, ScannedProductDetails, PantryItem, QuantityUnit } from '../types';

// Lazily initialize the AI client to prevent crashing if the API key is not set.
// This allows the app to run in "simulation mode" gracefully.
const getAiClient = (): GoogleGenAI | null => {
    // FIX: Per coding guidelines, the API key must be obtained from process.env.API_KEY.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return null;
    }
    return new GoogleGenAI({ apiKey });
};


/**
 * Generates recipe suggestions from the Gemini API based on a list of ingredients.
 * This acts as the "backend" logic for the recipe feature.
 * @param ingredients - An array of ingredient names (e.g., ['Tomatoes', 'Spinach']).
 * @returns A promise that resolves to an array of Recipe objects.
 */
export const generateRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  const fallbackRecipes = [
    {
        title: "Fallback: Quick Spinach & Tomato Omelette",
        ingredients: ["2 Eggs", "Handful of Spinach", "5 Cherry Tomatoes", "Splash of Milk", "Salt & Pepper"],
        steps: ["Whisk eggs, milk, salt, and pepper.", "Pour into a hot, oiled pan.", "Add spinach and halved tomatoes.", "Cook until set, then fold and serve."],
        estimatedTime: "10 mins",
        sustainabilityTip: "Using fresh produce before it wilts saves nutrients and reduces your carbon footprint.",
        usedIngredients: ingredients.filter(i => /spinach|tomato|egg/i.test(i)),
    },
    {
        title: "Fallback: Creamy Yogurt & Berry Smoothie",
        ingredients: ["1 cup Greek Yogurt", "1/2 cup Milk", "Handful of berries (frozen or fresh)", "1 tsp Honey (optional)"],
        steps: ["Combine all ingredients in a blender.", "Blend until smooth.", "Pour into a glass and enjoy immediately."],
        estimatedTime: "5 mins",
        sustainabilityTip: "Rescued dairy items that are near their expiry date are perfect for smoothies, preventing waste.",
        usedIngredients: ingredients.filter(i => /yogurt|milk|berry/i.test(i)),
    }
  ];

  const ai = getAiClient();
  // Simulation Mode: If no API key is present (local development), return fallback recipes.
  if (!ai) {
      console.log("SIMULATION: No API key. Returning fallback recipes.");
      return new Promise(resolve => setTimeout(() => resolve(fallbackRecipes), 1000));
  }
  
  // Combine the ingredients into a comma-separated string for the prompt.
  const ingredientList = ingredients.join(', ');
  
  // The user's direct request to the model.
  const userPrompt = `Suggest between 3 and 5 quick, low-waste recipes using these ingredients: ${ingredientList}. Prioritize the ingredients that might be expiring soon. For each recipe, provide a title, a list of ingredients for the user to follow, numbered steps for preparation, an estimated cooking time as a string (e.g., '15 mins'), a unique sustainability tip, and a 'usedIngredients' array. The 'usedIngredients' array must contain the exact product names from my original list (${ingredientList}) that are used in this recipe. Return the response as a clean JSON array.`;
  
  // The system instruction sets the persona and overall goal for the AI.
  const systemInstruction = "You are a creative and sustainable cooking assistant named 'Chef Sage'. Your goal is to help users reduce food waste by creating delicious, easy-to-follow recipes from the ingredients they have on hand. Always be encouraging and focus on practical, low-waste cooking techniques.";

  try {
    // Call the Gemini API to generate content.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // A fast and capable model suitable for this task.
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        // Define the expected JSON schema to ensure the model returns structured, predictable data.
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'The creative title of the recipe.' },
              ingredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of ingredients required for the recipe.'
              },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'The numbered, step-by-step instructions for preparing the dish.'
              },
              estimatedTime: { type: Type.STRING, description: "The estimated time to prepare and cook, like '20 mins'." },
              sustainabilityTip: { type: Type.STRING, description: 'A practical tip related to reducing food waste or sustainable cooking.' },
              usedIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of the exact product names from the user's original list that were used in this recipe."
              },
            },
            // Ensure all properties are included in the response.
            required: ['title', 'ingredients', 'steps', 'estimatedTime', 'sustainabilityTip', 'usedIngredients'],
          },
        },
      },
    });

    // Extract and parse the JSON response from the model.
    const jsonString = response.text;
    const recipes: Recipe[] = JSON.parse(jsonString);
    return recipes;

  } catch (error) {
    // If the API call fails, log the error and return a set of sample recipes.
    // This makes the app more resilient and provides a fallback user experience.
    console.error("Error generating recipes from Gemini API:", error);
    return fallbackRecipes;
  }
};

/**
 * Generates a product image using the Gemini API based on a product name and its unit.
 * This acts as a backend service for fetching dynamic, context-aware product images.
 * @param productName - The name of the product (e.g., 'Organic Milk').
 * @param unit - The quantity unit (e.g., 'L', 'kg') to provide context to the AI.
 * @returns A promise that resolves to a base64 Data URL string of the image or a fallback URL.
 */
export const generateProductImage = async (productName: string, unit?: QuantityUnit): Promise<string> => {
  const fallbackUrl = `https://placehold.co/400x300/161B22/E5E7EB?text=${encodeURIComponent(productName)}`;

  const ai = getAiClient();
  // Simulation Mode: If no API key is present (local development), immediately return the fallback URL.
  if (!ai) {
    console.log("SIMULATION: No API key. Returning fallback image URL.");
    return fallbackUrl;
  }

  try {
    // Provide context to the AI based on the unit to get a more accurate image.
    let unitDescriptor = '';
    if (unit === 'L' || unit === 'ml') {
        unitDescriptor = ' typically sold in a bottle, carton, or liquid container';
    } else if (unit === 'kg' || unit === 'g') {
        unitDescriptor = ' as a solid item or in packaged form';
    }

    const prompt = `A single, photorealistic image of ${productName}${unitDescriptor}. The item should be centered on a clean, plain white background. The photo should be high-quality, well-lit, and look like a professional product shot for a grocery app.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE], // Must be an array with a single `Modality.IMAGE` element.
      },
    });

    // Safely access the image data from the response to prevent errors.
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            // Return the image as a Data URL.
            return `data:image/png;base64,${base64ImageBytes}`;
          }
        }
    }
    
    console.warn("Gemini API did not return an image. Using fallback.");
    return fallbackUrl;

  } catch (error) {
    console.error("Error generating product image from Gemini API:", error);
    return fallbackUrl;
  }
};

/**
 * Extracts product details by analyzing an image of a product label or barcode.
 * @param base64ImageData - A base64 encoded string of the image (without the data URL prefix).
 * @returns A promise that resolves to an object with the scanned product details, or null on failure.
 */
export const extractProductDetailsFromImage = async (base64ImageData: string): Promise<ScannedProductDetails | null> => {
    const ai = getAiClient();
    // Simulation Mode: If no API key is present, return null.
    if (!ai) {
      console.log("SIMULATION: No API key. Image extraction disabled.");
      return null;
    }
    
    const systemInstruction = `You are an AI assistant for the EcoEats mobile app. Your task is to analyze an image of a barcode label or packaged food product. Return accurate product details in JSON format.
    - If expiry date is not visible, respond with an empty string for expiry_date.
    - If the barcode number is visible, return it.
    - If the product name cannot be seen, output "Not clearly visible".
    - Never hallucinate — only answer from the image text.`;

    const userPrompt = "Here is the product image. Extract product name, expiry date, brand, barcode number, and any notes from the image and return in JSON format only.";

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64ImageData,
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, {text: userPrompt}] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        product_name: { type: Type.STRING },
                        expiry_date: { type: Type.STRING },
                        brand: { type: Type.STRING },
                        barcode_number: { type: Type.STRING },
                        notes: { type: Type.STRING },
                    },
                    required: ['product_name', 'expiry_date', 'brand', 'barcode_number', 'notes'],
                },
            },
        });

        const jsonString = response.text;
        const details: ScannedProductDetails = JSON.parse(jsonString);
        return details;

    } catch (error) {
        console.error("Error extracting product details from Gemini API:", error);
        return null;
    }
};

/**
 * Fetches nutrition information for a given product from the Gemini API.
 * @param productName - The name of the food item (e.g., 'Organic Milk').
 * @returns A promise that resolves to a nutrition object or null on failure.
 */
export const getNutritionInfo = async (productName: string): Promise<PantryItem['nutrition'] | null> => {
  const ai = getAiClient();
  // Simulation Mode: If no API key, return mock data for common items to ensure the app is testable.
  if (!ai) {
    console.log("SIMULATION: No API key. Returning mock nutrition data.");
    const mockDb: { [key: string]: PantryItem['nutrition'] } = {
      'apple': { calories: '52 kcal', protein: '0.3g', carbs: '14g', fat: '0.2g', fiber: '2.4g' },
      'banana': { calories: '89 kcal', protein: '1.1g', carbs: '23g', fat: '0.3g', fiber: '2.6g' },
      'orange': { calories: '47 kcal', protein: '0.9g', carbs: '12g', fat: '0.1g', fiber: '2.4g' },
      'milk': { calories: '42 kcal', protein: '3.4g', carbs: '5g', fat: '1g', fiber: '0g' },
      'bread': { calories: '265 kcal', protein: '9g', carbs: '49g', fat: '3.2g', fiber: '2.7g' },
    };
    const mockData = mockDb[productName.toLowerCase()] || null;
    return new Promise(resolve => setTimeout(() => resolve(mockData), 500));
  }
  
  const systemInstruction = "You are a helpful nutrition assistant. Given a food product name, provide its typical nutritional values per 100g serving. If you cannot find information, return null for all values. Provide values as strings, including units (e.g., '50 kcal').";
  const userPrompt = `Provide nutritional information for: ${productName}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.STRING, description: 'Calories per 100g, e.g., "150 kcal"' },
            protein: { type: Type.STRING, description: 'Protein per 100g, e.g., "10g"' },
            carbs: { type: Type.STRING, description: 'Carbohydrates per 100g, e.g., "20g"' },
            fat: { type: Type.STRING, description: 'Fat per 100g, e.g., "5g"' },
            fiber: { type: Type.STRING, description: 'Fiber per 100g, e.g., "3g"' },
          },
          required: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
        },
      },
    });

    const jsonString = response.text;
    const nutritionData = JSON.parse(jsonString);
    
    // Validate that we got meaningful, non-null, non-"N/A" data.
    // The presence of a calorie value that is not "0", "N/A", or "null" is a good indicator of success.
    if (nutritionData && nutritionData.calories && !/^(0|N\/A|null)/i.test(nutritionData.calories)) {
      return nutritionData;
    }
    return null;

  } catch (error) {
    console.error(`Error fetching nutrition info for "${productName}" from Gemini API:`, error);
    return null;
  }
};


/**
 * Validates if a product name is a real food item using the Gemini API.
 * @param productName The name of the product to validate.
 * @returns A promise that resolves to an object indicating if it's a food item and a reason.
 */
export const validatePantryItem = async (productName: string): Promise<{ isFoodItem: boolean; reason: string; }> => {
  const ai = getAiClient();
  // Simulation Mode: If no API key, assume all items are valid food items.
  if (!ai) {
    console.log("SIMULATION: No API key. Skipping item validation.");
    return { isFoodItem: true, reason: 'API validation skipped in simulation mode.' };
  }

  const systemInstruction = "You are a food item validation assistant. Your task is to determine if a given product name is a common food, beverage, or grocery item. Please respond in JSON format.";
  const userPrompt = `Is "${productName}" a common food, beverage, or grocery item?`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFoodItem: { type: Type.BOOLEAN, description: 'True if the item is a food/grocery product, false otherwise.' },
            reason: { type: Type.STRING, description: "A brief explanation for your decision, especially if it's not a food item." },
          },
          required: ['isFoodItem', 'reason'],
        },
      },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`Error validating pantry item "${productName}" from Gemini API:`, error);
    // Fail open: if the API call fails, assume the item is valid to avoid blocking the user.
    return { isFoodItem: true, reason: 'API validation failed.' };
  }
};