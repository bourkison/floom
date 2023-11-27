import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {useMemo, useRef, useCallback, useState} from 'react';

import {AddToCollectionContext} from '@/context/bottomSheet';
import {Database} from '@/types/schema';

type AddToCollectionProviderProps = {
    children: React.JSX.Element;
};

const AddToCollectionProvider = ({children}: AddToCollectionProviderProps) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const [saves, setSaves] = useState<
        Database['public']['Views']['v_deletes']['Row'][]
    >([]);
    const snapPoints = useMemo(() => ['40%'], []);

    const openModal = useCallback(
        (s: Database['public']['Views']['v_deletes']['Row'][]) => {
            console.log('CALLED BOTTOM SHEET');

            if (!s || !s.length) {
                throw new Error('openModal must be called with saves');
            }

            if (!bottomSheetRef || !bottomSheetRef.current) {
                throw new Error('No bottomSheetRef');
            }

            console.log('SAVES SET');

            setSaves(s);
            bottomSheetRef.current.present(0);
            bottomSheetRef.current.snapToIndex(0);
        },
        [],
    );

    const closeModal = useCallback(() => {
        if (!bottomSheetRef || !bottomSheetRef.current) {
            throw new Error('No bottomSheetRef');
        }

        setSaves([]);
        bottomSheetRef.current.close();
    }, []);

    return (
        <AddToCollectionContext.Provider
            value={{openModal, bottomSheetRef, saves, closeModal, snapPoints}}>
            {children}
        </AddToCollectionContext.Provider>
    );
};

export default AddToCollectionProvider;
