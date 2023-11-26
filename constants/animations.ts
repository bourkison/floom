export type ActionType = 'idle' | 'save' | 'delete' | 'buy';

export const ACTION_THRESHOLD = 250; // Pixels required to swipe for a swipe action to go live.
export const MAX_ROTATION = 10; // Rotation amount of product when at full ACTION_THRESHOLD.
