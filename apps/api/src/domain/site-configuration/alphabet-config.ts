import { BooleanDataType, NonEmptyString, URL } from '@coscrad/data-types';
import { DTO } from '../../types/DTO';

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

    constructor(dto: DTO<AlphabetConfig>) {
        if (!dto) return;

        const { shouldEnableAlphabet, alphabetChartName, baseDigitalAssetUrl } = dto;

        this.shouldEnableAlphabet = shouldEnableAlphabet;

        this.alphabetChartName = alphabetChartName;

        this.baseDigitalAssetUrl = baseDigitalAssetUrl;
    }
}
