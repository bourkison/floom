export type ActionType = 'idle' | 'save' | 'delete' | 'buy';

export const ACTION_THRESHOLD = 250; // Pixels required to swipe for a swipe action to go live.
export const MAX_ROTATION = 5; // Rotation amount of product when at full ACTION_THRESHOLD.
export const OVERLAY_PERCENTAGE = 0.4; // Amount of image covered with gradient.
export const OPACITY_MINIMUM = 0.2; // Minimum opacity of the hint over product image.
