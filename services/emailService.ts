

import { PantryItem } from '../types';

/**
 * Creates the HTML content for the welcome email.
 * @param name The user's name.
 * @param email The user's email address.
 * @returns An HTML string for the email body.
 */
const createWelcomeEmailHtml = (name: string, email: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Welcome to EcoEats!</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hi ${name},</p>
        <p>Thank you for joining the EcoEats community! We're thrilled to have you on board to help reduce food waste and make a positive impact.</p>
        <p>Your account has been successfully created with the following email address:</p>
        <p style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">${email}</p>
        <p>You can now log in to the app and start tracking your pantry, discovering recipes, and donating surplus food.</p>
        <p>Happy saving!</p>
        <p><strong>The EcoEats Team</strong></p>
      </div>
      <div style="background-color: #f9f9f9; color: #777; padding: 10px; text-align: center; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} EcoEats. All rights reserved.</p>
      </div>
    </div>
  `;
};


/**
 * Creates the HTML content for the daily expiry notification email.
 * @param name The user's name.
 * @param expiredItems An array of expired pantry items.
 * @param expiringSoonItems An array of pantry items that are expiring soon.
 * @returns An HTML string for the email body.
 */
const createExpiryNotificationEmailHtml = (name: string, expiredItems: PantryItem[], expiringSoonItems: PantryItem[]): string => {
  const renderItemList = (items: PantryItem[]) => {
    if (items.length === 0) return '<li>None</li>';
    return items.map(item => `<li>${item.productName}</li>`).join('');
  };

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #F59E0B; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Your Daily Pantry Reminder</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hi ${name},</p>
        <p>Here's a quick update from your pantry to help you plan your meals and reduce food waste.</p>
        
        ${expiredItems.length > 0 ? `
        <h2 style="color: #DC2626;">Expired Items</h2>
        <p>These items have expired. Please check them.</p>
        <ul style="background-color: #fef2f2; padding: 15px; border-radius: 5px; list-style-type: disc; list-style-position: inside;">
          ${renderItemList(expiredItems)}
        </ul>
        ` : ''}

        ${expiringSoonItems.length > 0 ? `
        <h2 style="color: #D97706;">Expiring Soon</h2>
        <p>These items are expiring soon. Consider using them in your next meal!</p>
        <ul style="background-color: #fffbeb; padding: 15px; border-radius: 5px; list-style-type: disc; list-style-position: inside;">
          ${renderItemList(expiringSoonItems)}
        </ul>
        ` : ''}

        <p>Log in to EcoEats to find recipes or donate these items.</p>
        <p><strong>The EcoEats Team</strong></p>
      </div>
      <div style="background-color: #f9f9f9; color: #777; padding: 10px; text-align: center; font-size: 12px;">
        <p>You are receiving this email as a daily reminder from your EcoEats account.</p>
      </div>
    </div>
  `;
};


/**
 * Sends a welcome email to a new user using the Resend API.
 * This is a "backend" service that should be handled securely.
 * The API key is sourced from an environment variable for security.
 * @param name The name of the new user.
 * @param email The email address of the new user.
 */
export const sendWelcomeEmail = async (name: string, email: string): Promise<void> => {
  console.log(`[SIMULATION] Sending welcome email to ${name} at ${email}.`);
  // In a real production environment with an API key, the fetch call would be here.
  // For this sandboxed environment, we simulate a successful send.
  return Promise.resolve();
};


/**
 * Sends a daily expiry notification email to the user.
 * This is a "backend" service that runs as a daily check.
 * @param name The user's name.
 * @param email The user's email address.
 * @param expiredItems An array of expired pantry items.
 * @param expiringSoonItems An array of pantry items expiring soon.
 */
export const sendExpiryNotificationEmail = async (name: string, email: string, expiredItems: PantryItem[], expiringSoonItems: PantryItem[]): Promise<void> => {
    console.log(`[SIMULATION] Sending expiry notification email to ${name} at ${email}.`);
    // Simulate success for the daily notification as well.
    return Promise.resolve();
};