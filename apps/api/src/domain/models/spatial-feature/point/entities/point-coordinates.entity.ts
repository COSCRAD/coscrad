import { FiniteNumber } from '@coscrad/data-types';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { CoscradDataExample } from '../../../../../test-data/utilities';

/**
 * Note that the domain models do not follow GEOJson. We opt to use domain
 * classes for coordinates to make validation more idiomatic. However, we still
 * convert to the GEOJson standard in the view layer.This ensures data exports
 * are compliant with GEOJson so that they can be auto-ingested into other
 * systems.
 */
@CoscradDataExample<PointCoordinates>({
    example: {
        lattitude: 50,
        longitude: 120.5,
    },
})
export class PointCoordinates {
    // -90,90 inclusive
    @FiniteNumber({
        label: 'lattitude',
        description: 'the lattitude coordinate for this point',
    })
    lattitude: number;

    // -180, 180 inclusive
    longitude: number;

    constructor({ lattitude, longitude }: { lattitude: number; longitude: number }) {
        this.lattitude = lattitude;
        this.longitude = longitude;
    }

    /**
     * This is used in views to ensure that we adhere to the GEOJson standard.
     */
    toTuple(): [number, number] {
        return [this.lattitude, this.longitude];
    }

    validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        if (this.lattitude < -90 || this.lattitude > 90) {
            allErrors.push(
                new InternalError(
                    `Lattitude must be between -90 and 90 incluseive. Received: ${this.lattitude}.`
                )
            );
        }

        if (this.longitude < -180 || this.longitude > 180) {
            allErrors.push(
                new InternalError(
                    `Longitude must be between -180 and 180 inclusive. Received: ${this.longitude}`
                )
            );
        }

        return allErrors;
    }

    static fromTuple([lattitude, longitude]: [number, number]): PointCoordinates {
        return new PointCoordinates({ lattitude, longitude });
    }

    static fromDto({
        lattitude,
        longitude,
    }: {
        lattitude: number;
        longitude: number;
    }): PointCoordinates {
        return new PointCoordinates({ lattitude, longitude });
    }
}
