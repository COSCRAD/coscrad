import { AggregateCompositeIdentifier } from '@coscrad/api-interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../store';

interface ConnectionSliceState {
    open: boolean;
    connectionMembers: {
        to: AggregateCompositeIdentifier;
        from: AggregateCompositeIdentifier;
    };
}

const initialState: ConnectionSliceState = {
    open: false,
    connectionMembers: {
        to: null,
        from: null,
    },
};

export const connectionSlice = createSlice({
    name: 'connection-maker',
    initialState: initialState,
    reducers: {
        setFromResource: (state, action: PayloadAction<AggregateCompositeIdentifier>) => {
            state.connectionMembers.from = action.payload;
        },
        setToResource: (state, action: PayloadAction<AggregateCompositeIdentifier>) => {
            // if (action.payload !== state.connectionMembers.from)
            state.connectionMembers.to = action.payload;
        },
        toggleBottomConnectionDrawer: (state, action: PayloadAction<boolean>) => {
            console.log('toggle drawer');

            console.log({ drawerAction: action.payload });

            state.open = action.payload;
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
