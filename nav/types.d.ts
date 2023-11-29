import {Database} from '@/types/schema';
import {NavigatorScreenParams} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';

export type RootStackParamList = {
    HomeAuth: undefined;
    GuestWelcome: undefined;
    SignUp: {
        startPageIndex: number;
    };
    Login: undefined;

    Filters: NavigatorScreenParams<FiltersStackParamList>;
    Home: {
        imageIndex?: number;
    };
    Options: NavigatorScreenParams<OptionsStackParamList>;
    ProductView: {
        product: Database['public']['Views']['v_products']['Row'] | number;
    };
    SavedProducts: NavigatorScreenParams<SavedStackParamList>;
};

export type SavedStackParamList = {
    SavedHome: undefined;
    CollectionView: {
        collectionId: number;
    };
    CollectionNew: undefined;
};

export type FiltersStackParamList = {
    FiltersHome: undefined;
    Brand: undefined;
    Color: undefined;
    Category: undefined;
    Gender: undefined;
    Price: undefined;
};

export type OptionsStackParamList = {
    OptionsHome: undefined;
    DeletedProducts: undefined;
    AppInfo: undefined;
    UpdateDetail: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
    StackScreenProps<RootStackParamList, T>;

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}
