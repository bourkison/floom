import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {supabase} from '@/services/supabase';
import {useAppDispatch} from '@/store/hooks';
import {logout} from '@/store/slices/user';

export default function Home() {
    const dispatch = useAppDispatch();

    const supabaseLogout = async () => {
        await supabase.auth.signOut();
        dispatch(logout());
    };

    return (
        <TouchableOpacity onPress={supabaseLogout}>
            <Text>Logged in</Text>
        </TouchableOpacity>
    );
}
