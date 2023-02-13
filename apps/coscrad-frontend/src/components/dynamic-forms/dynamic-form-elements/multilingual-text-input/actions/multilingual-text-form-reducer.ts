import { IMultiLingualText } from '@coscrad/api-interfaces';
import { PayloadAction } from '@reduxjs/toolkit';
import { isUpdateItemRoleAction } from './update-item-role';
import { isUpdateItemTextAction } from './update-item-text';

export const multiLingualTextReducerWtihNotification =
    (notify: (propertyValue: unknown) => void) =>
    (state: IMultiLingualText, fsa: PayloadAction<unknown>): IMultiLingualText => {
        const newState = multilingualTextFormReducer(state, fsa);

        notify(newState);

        return newState;
    };

// TODO do these really need to be tsx files?
export const multilingualTextFormReducer = (
    state: IMultiLingualText,
    fsa: PayloadAction<unknown>
): IMultiLingualText => {
    if (isUpdateItemRoleAction(fsa)) {
        const {
            payload: { languageCode, newRole },
        } = fsa;

        if (!state.items.some(({ languageId }) => languageId === languageCode))
            return {
                items: state.items.concat(
                    state.items.concat({
                        languageId: languageCode,
                        text: null,
                        role: newRole,
                    })
                ),
            };

        return {
            items: state.items.map((item) =>
                item.languageId === languageCode
                    ? {
                          ...item,
                          role: newRole,
                      }
                    : item
            ),
        };
    }

    if (isUpdateItemTextAction(fsa)) {
        const {
            payload: { languageCode, newText },
        } = fsa;

        return {
            items: state.items.some(({ languageId }) => languageId === languageCode)
                ? state.items.map((item) =>
                      item.languageId === languageCode
                          ? {
                                ...item,
                                text: newText,
                            }
                          : item
                  )
                : state.items.concat({
                      languageId: languageCode,
                      text: newText,
                      role: null,
                  }),
        };
    }

    return state;
};
