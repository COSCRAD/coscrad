import { IMultilingualText } from '@coscrad/api-interfaces';
import { PayloadAction } from '@reduxjs/toolkit';
import { isUpdateItemRoleAction } from './update-item-role';
import { isUpdateItemTextAction } from './update-item-text';

export const multiLingualTextReducerWithNotification =
    (notify: (propertyValue: unknown) => void) =>
    (state: IMultilingualText, fsa: PayloadAction<unknown>): IMultilingualText => {
        const newState = multilingualTextFormReducer(state, fsa);

        notify(newState);

        return newState;
    };

// TODO do these really need to be tsx files?
export const multilingualTextFormReducer = (
    state: IMultilingualText,
    fsa: PayloadAction<unknown>
): IMultilingualText => {
    if (isUpdateItemRoleAction(fsa)) {
        const {
            payload: { languageCode, newRole },
        } = fsa;

        if (!state.items.some((item) => languageCode === item.languageCode))
            return {
                items: state.items.concat(
                    state.items.concat({
                        languageCode: languageCode,
                        defaultLanguageCode: languageCode,
                        text: null,
                        role: newRole,
                    })
                ),
            };

        return {
            items: state.items.map((item) =>
                item.languageCode === languageCode
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
            items: state.items.some((item) => item.languageCode === languageCode)
                ? state.items.map((item) =>
                      item.languageCode === languageCode
                          ? {
                                ...item,
                                text: newText,
                            }
                          : item
                  )
                : state.items.concat({
                      languageCode: languageCode,
                      defaultLanguageCode: languageCode,
                      text: newText,
                      role: null,
                  }),
        };
    }

    return state;
};
