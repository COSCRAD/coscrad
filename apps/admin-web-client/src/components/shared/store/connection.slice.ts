import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../store';

interface ConnectionSliceState {
    open: boolean;
    connectionMembers: {
        from: ResourceCompositeIdentifier;
        to: ResourceCompositeIdentifier;
    };
}

const initialState: ConnectionSliceState = {
    open: false,
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
            if (isNullOrUndefined(state.connectionMembers.to))
                state.connectionMembers.from = action.payload;
        },
        setToResource: (state, action: PayloadAction<ResourceCompositeIdentifier>) => {
            console.log(`${action.payload} !== ${state.connectionMembers.from}`);

            if (action.payload.id !== state.connectionMembers.from.id)
                state.connectionMembers.to = action.payload;
        },
        toggleBottomConnectionDrawer: (state, action: PayloadAction<boolean>) => {
            console.log('toggle drawer');

            console.log({ drawerAction: action.payload });

            state.open = action.payload;

            if (!state.open) {
                state.connectionMembers.from = null;

                state.connectionMembers.to = null;
            }
        },
    },
    selectors: {
        selectConnectionState: (connectionSliceState) =>
            connectionSliceState.connectionMembers.from,
    },
});

// export const { selectConnectionState } = connectionSlice.selectors;

export const selectConnectionState = (state: RootState) =>
    state.connectionSlice.connectionMembers.from;

export const { setFromResource, setToResource, toggleBottomConnectionDrawer } =
    connectionSlice.actions;
