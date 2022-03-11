import { useContext, useState } from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import VocabularyListContext, { FormItemValue, MaybeSelected, NoSelection, VocabularyListFormState } from '../../context/VocabularyListContext';
import './VocabularyListForm.module.css';
import { ThemeProvider, createTheme } from '@mui/material';
import { Box } from '@mui/material';

export type LabelAndValue<T = any> = {
  display: string;
  value: T;
}

export type VocabularyListFormElementType = 'dropbox' | 'checkbox';

export type VocabularyListFormElement = {
  type: VocabularyListFormElementType;
  name: string;
  validValues: LabelAndValue[];
}

export interface VocabularyListFormProps {
  formItems: VocabularyListFormElement[];
}

const convertFormDataValuesIfApplicable = (input: MaybeSelected<FormItemValue>): string | boolean => {
  if (input === NoSelection) return NoSelection;

  if (typeof input !== 'string') return input;

  if (input.toLowerCase() === 'false') return false;

  if (input.toLowerCase() === 'true') return true;

  return input;
}

export const isFormReady = (formPropertyNames: string[], filters: Record<string, string | boolean>)
  : boolean => formPropertyNames.every(name => Object.keys(filters).includes(name));

export function VocabularyListForm({ formItems }: VocabularyListFormProps) {
  const getUpdatedFormState = ({ currentSelections: formState }: VocabularyListFormState, key: string, value: MaybeSelected<FormItemValue>): VocabularyListFormState => {
    console.log(`Time to update the form`)

    // TODO Deal with invalid input

    // TODO Clean up the data and remove this hack
    const fixedKey = key === 'aspect \\ mode' ? 'aspect' : key;

    const updatedState = {
      ...formState,
      [fixedKey]: convertFormDataValuesIfApplicable(value)
    }

    // TODO clean data and remove hack
    const formItemNames = formItems.map(({ name }) => name === 'aspect \\ mode' ? 'aspect' : name);

    console.log({
      formItemNames
    })

    return {
      currentSelections: updatedState,
      // isReady: isFormReady(formItemNames, updatedState)
    };
  }

  const [formState, setFormState] = useContext(VocabularyListContext);

  const buildSingleSelectElement = ({ name, validValues: labelsAndValues }: VocabularyListFormElement, currentState: MaybeSelected<FormItemValue>) => (
    <ThemeProvider theme={theme}>
      <Box>
        <FormControl variant='filled' style={form}>

          <InputLabel id={name} sx={{ color: 'rgb(159,2,2)', textTransform: 'capitalize' }}>{name}</InputLabel>

          <Select
            value={currentState}
            label={name}
            onChange={e => updateFormState(formState, name, e.target.value as MaybeSelected<FormItemValue>)}
            sx={{ backgroundColor: 'white' }}
          >
            {
              labelsAndValues.map(({ value, display: label }) => (
                <MenuItem value={value}>{label}</MenuItem>
              )).concat(<MenuItem value={NoSelection}>{`ANY`}</MenuItem>)
            }
          </Select>
        </FormControl>
      </Box>
    </ThemeProvider>
  )

  // TODO type the return value
  const buildSelectElementsForForm = (form: VocabularyListFormElement[], currentSelections: Record<string, MaybeSelected<FormItemValue>>) => (
    <div style={{ display: 'flex', boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px' }}>
      {form.filter(({ type }) => type === 'dropbox').map(formElement => buildSingleSelectElement(formElement, currentSelections[formElement.name]))}
    </div>
  )

  // TODO type return value
  const buildCheckboxesForForm = (form: VocabularyListFormElement[], currentSelections: Record<string, MaybeSelected<FormItemValue>>) => (
    <div style={{ display: 'flex', boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px' }}>
      {form.filter(({ type }) => type === 'checkbox').map(({ type, name, validValues }) => ({
        type,
        name,
        validValues: validValues.map(({ display, value }) => ({
          display,
          value: convertFormDataValuesIfApplicable(value) //: value === true ? 'True' : 'False'
        }))
      })
      )
        // Eventually we will replace this with a checkbox builder. For now render as a dropdown
        .map(formElement => buildSingleSelectElement(formElement, currentSelections[formElement.name]))
      }
    </div>
  )

  const updateFormState = (existingState: VocabularyListFormState, key: string, value: MaybeSelected<FormItemValue>): void => {
    const newState = getUpdatedFormState(existingState, key, value);

    console.log({
      newState
    })

    setFormState(newState);
  }

  return (
    <div>
      <div style={{ padding: '14px', margin: 'auto' }}>
        <FormControl>
          <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap', margin: 'auto' }}>
            {buildSelectElementsForForm(formItems, formState.currentSelections)}
            {buildCheckboxesForForm(formItems, formState.currentSelections)}
          </div>
        </FormControl>
      </div>
    </div>

  );
}

export default VocabularyListForm;

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(255,28,28)', // main color
    },
  },
});

const button = createTheme({
  palette: {
    primary: {
      main: 'rgb(255,255,255)'
    },
  }
})

const form = {
  m: 1,
  minWidth: 120,
  color: 'rgb(159,2,2)'
}

const submit = {
  color: 'rgb(159,2,2)',
  borderColor: 'white',
  textTransform: 'none',
  paddingBlock: '10px',
  margin: '2.5px',
  width: '150px',
} as const
