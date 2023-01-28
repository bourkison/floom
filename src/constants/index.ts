import {Color} from '@/types';
import {
    COLOR_PALETTE_AMBER,
    COLOR_PALETTE_BLUE,
    COLOR_PALETTE_CYAN,
    COLOR_PALETTE_EMERALD,
    COLOR_PALETTE_FUCHSIA,
    COLOR_PALETTE_GRAY,
    COLOR_PALETTE_GREEN,
    COLOR_PALETTE_INDIGO,
    COLOR_PALETTE_LIME,
    COLOR_PALETTE_NEUTRAL,
    COLOR_PALETTE_ORANGE,
    COLOR_PALETTE_PINK,
    COLOR_PALETTE_PURPLE,
    COLOR_PALETTE_RED,
    COLOR_PALETTE_ROSE,
    COLOR_PALETTE_SKY,
    COLOR_PALETTE_SLATE,
    COLOR_PALETTE_STONE,
    COLOR_PALETTE_TEAL,
    COLOR_PALETTE_VIOLET,
    COLOR_PALETTE_YELLOW,
    COLOR_PALETTE_ZINC,
} from '@/constants/colors';

// PRODUCT IMAGE CONSTANTS
export const IMAGE_RATIO = 0.7;
export const IMAGE_PADDING = 20;
export const IMAGE_GRADIENT_HEIGHT = 128;
export const FALLBACK_IMAGE =
    'https://preview.redd.it/ishxhuztqlo91.jpg?width=640&crop=smart&auto=webp&s=e148af80aea3ad1ac17b54f4626852165acd193e';
export const IMAGE_PREFETCH_AMOUNT = 3;
export const IMAGE_ANIMATED_AMOUNT = 2;

// PRODUCT FILTER CONSTANTS
export const GENDER_OPTIONS = ['Male', 'Female', 'Unisex'];
export const CATEGORY_OPTIONS = [
    'T-shirts',
    'Shirts',
    'Trousers',
    'Jackets',
    'Hats',
    'Socks',
    'Underwear',
];
export const COLOUR_OPTIONS = [
    'Black',
    'White',
    'Green',
    'Purple',
    'Gray',
    'Blue',
    'Red',
    'Yellow',
    'Brown',
    'Multicolour',
    'Beige',
];
export const BRAND_OPTIONS = ['H&M', 'Nike', 'Adidas', 'Aelfrice Eden'];

export const LOCAL_KEY_SAVED_PRODUCTS = '@savedProducts';
export const LOCAL_KEY_DELETED_PRODUCTS = '@deletedProducts';

export const ACTION_BUTTON_SIZE_ACTIVE = 50;
export const ACTION_BUTTON_SIZE_INACTIVE = 55;

export const DELETED_STORED_PRODUCTS_AMOUNT = 100;
export const SAVED_STORED_PRODUCTS_AMOUNT = 100;

export const FEATURED_PRODUCT_SIZE = 64;

export const REPORT_TYPES = [
    {
        id: 'inappropriate',
        name: 'Inappropriate content',
    },
    {
        id: 'broken',
        name: 'Something is broken',
    },
    {
        id: 'other',
        name: 'Other',
    },
] as const;

export const PALETTE = {
    amber: COLOR_PALETTE_AMBER,
    blue: COLOR_PALETTE_BLUE,
    cyan: COLOR_PALETTE_CYAN,
    emerald: COLOR_PALETTE_EMERALD,
    fuchsia: COLOR_PALETTE_FUCHSIA,
    gray: COLOR_PALETTE_GRAY,
    green: COLOR_PALETTE_GREEN,
    indigo: COLOR_PALETTE_INDIGO,
    lime: COLOR_PALETTE_LIME,
    neutral: COLOR_PALETTE_NEUTRAL,
    orange: COLOR_PALETTE_ORANGE,
    pink: COLOR_PALETTE_PINK,
    purple: COLOR_PALETTE_PURPLE,
    red: COLOR_PALETTE_RED,
    rose: COLOR_PALETTE_ROSE,
    sky: COLOR_PALETTE_SKY,
    slate: COLOR_PALETTE_SLATE,
    stone: COLOR_PALETTE_STONE,
    teal: COLOR_PALETTE_TEAL,
    violet: COLOR_PALETTE_VIOLET,
    yellow: COLOR_PALETTE_YELLOW,
    zinc: COLOR_PALETTE_ZINC,
};

export const DELETE_COLOR: Color = PALETTE.rose[6];
export const SAVE_COLOR: Color = PALETTE.lime[6];
export const BUY_COLOR: Color = PALETTE.blue[6];
