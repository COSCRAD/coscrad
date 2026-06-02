import { BooleanDataType, NonEmptyString, URL } from '@coscrad/data-types';

export class AlphabetConfig {
    @BooleanDataType({
        label: 'should enable alphabet',
        description: 'boolean flag for enabling the alphabet feature',
    })
    shouldEnableAlphabet: boolean;

    @NonEmptyString({
        label: 'alphabet chart name',
        description: 'alphabet chart name',
    })
    alphabetChartName: string;

    // TODO Do we really want this?
    @URL({
        label: 'base digital asset url',
        description: 'base digital asset url for COSCRAD instance',
    })
    baseDigitalAssetUrl: string;
}
