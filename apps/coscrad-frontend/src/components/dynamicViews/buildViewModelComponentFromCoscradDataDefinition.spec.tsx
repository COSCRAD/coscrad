import { buildValidWidgetDto, getCoscradDataSchema, Widget } from '@coscrad/data-types';
import { render } from '@testing-library/react';
import { buildViewModelComponentFromCoscradDataDefinition } from './buildViewModelComponentFromCoscradDataDefinition';

describe('buildPresenterFromDataSchema', () => {
    it('should render successfully', () => {
        const dataSchema = getCoscradDataSchema(Widget);

        const dynamicComponent = buildViewModelComponentFromCoscradDataDefinition(dataSchema);

        const dummyData = buildValidWidgetDto();

        const { baseElement } = render(dynamicComponent(dummyData));

        expect(baseElement).toBeTruthy();

        expect(baseElement).toMatchSnapshot();
    });
});
