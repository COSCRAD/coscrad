import { IDigitalTextViewModel, LanguageCode, MultilingualTextItemRole, ResourceType } from '@coscrad/api-interfaces';

export const buildDummyDigitalTexts = (): IDigitalTextViewModel[] => Array(2)
.fill(0)
.map(
    (_,index) => ({
        type: ResourceType.digitalText,
        id: (index + 1).toString(),
        title: {
            items: [{
                text: `name for digital text ${index + 1}`,
                languageCode: LanguageCode.English,
                role: MultilingualTextItemRole.original
            }]
        },
        name: {
            items: [{
                text: `name for digital text ${index + 1}`,
                languageCode: LanguageCode.English,
                role: MultilingualTextItemRole.original
            }]
        },
        tags: [],
        isPublished: true,
        pages: []

    })
)