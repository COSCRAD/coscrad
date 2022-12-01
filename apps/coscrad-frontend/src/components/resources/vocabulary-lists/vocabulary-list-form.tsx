import { FormFieldType, IFormData } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader } from '@mui/material';
import {} from './';
import { VocabularyListCheckbox } from './vocabulary-list-checkbox';

export const VocabularyListForm = ({ fields }: IFormData): JSX.Element => (
    <Card>
        <CardHeader title="Filter the Vocabulary List" />
        <CardContent>
            {fields.map(({ type, name, label, description, options }) => {
                if (type === FormFieldType.switch) {
                    return (
                        <div>
                            label: {label}
                            {description}
                            <VocabularyListCheckbox
                                type={type}
                                name={name}
                                options={options}
                                isChecked={true}
                                label={label}
                                description={description}
                            />
                        </div>
                    );
                }

                if (type === FormFieldType.staticSelect) {
                    return (
                        <div>
                            TODO: Render select with options
                            <br />
                            {JSON.stringify(options)}
                        </div>
                    );
                }

                return <div>Failed to build a form element for unsupporeted type: {type}</div>;
            })}
        </CardContent>
    </Card>
);
