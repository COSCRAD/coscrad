import { CoscradDataSchema } from '../types/CoscradDataSchema';
import generateInvalidValuesForProperty from './generateInvalidValuesForProperty';

export class FuzzGenerator {
    constructor(private readonly schema: CoscradDataSchema) {}

    generateInvalidValues() {
        return generateInvalidValuesForProperty(this.schema);
    }
}
