import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../store';

export enum DrawerOpenStateEnum {
    expandedSmall = 'expandedSmall',
    expandedMid = 'expandedMid',
    expandedLarge = 'expandedLarge',
    closed = 'closed',
}

interface ConnectionSliceState {
    drawerOpenStateFromSlice: DrawerOpenStateEnum;
    connectionMembers: {
        from: ResourceCompositeIdentifier;
        to: ResourceCompositeIdentifier;
    };
}

const initialState: ConnectionSliceState = {
    drawerOpenStateFromSlice: DrawerOpenStateEnum.closed,
    connectionMembers: {
        from: null,
        to: null,
    },
};

export const connectionSlice = createSlice({
    name: 'connection-drawer',
    initialState: initialState,
    reducers: {
        setFromResource: (state, action: PayloadAction<ResourceCompositeIdentifier>) => {
            if (isNullOrUndefined(state.connectionMembers?.to))
                state.connectionMembers.from = action.payload;
        },
        setToResource: (state, action: PayloadAction<ResourceCompositeIdentifier>) => {
            if (action.payload.id !== state.connectionMembers?.from?.id)
                state.connectionMembers.to = action.payload;
        },
        toggleBottomConnectionDrawer: (state, action: PayloadAction<DrawerOpenStateEnum>) => {
            console.log('toggleBottomConnectionDrawer');

            console.log({ drawerAction: action.payload });

            state.drawerOpenStateFromSlice = action.payload;

            if (state.drawerOpenStateFromSlice === DrawerOpenStateEnum.closed) {
                state.connectionMembers.from = null;

                state.connectionMembers.to = null;
            }
        },
    },
});

// export const { selectConnectionState } = connectionSlice.selectors;

export const selectIsConnectionOpen = (state: RootState): boolean => {
    if (!isNullOrUndefined(state.connectionSlice?.connectionMembers?.from)) {
        return true;
    } else {
        return false;
    }
};

export const selectedUserSelectedFromMemberId = (state: RootState): string =>
    state.connectionSlice?.connectionMembers?.from?.id;

export const { setFromResource, setToResource, toggleBottomConnectionDrawer } =
    connectionSlice.actions;
