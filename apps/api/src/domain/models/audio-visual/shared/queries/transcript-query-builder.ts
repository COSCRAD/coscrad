/* eslint-disable @typescript-eslint/no-unused-vars */
import { MultilingualTextItemRole, ResourceType } from '@coscrad/api-interfaces';
import { AqlQuery } from 'arangojs/aql';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { AudiovisualResourceType } from '../../audio-item/entities/audio-item-composite-identifier';
import { TranslationLineItemDto } from '../../audio-item/queries/audio-item-query-repository.interface';
import { TranscriptLineItemDto, TranslationItem } from '../commands';
import { TranscriptItem } from '../entities/transcript-item.entity';
import { TranscriptParticipant } from '../entities/transcript-participant';
import { Transcript } from '../entities/transcript.entity';

export class ArangoTranscriptQueryBuilder {
    private readonly collectionName: string;

    constructor(resourceType: AudiovisualResourceType) {
        if (resourceType === ResourceType.audioItem) {
            this.collectionName = 'audioItem__VIEWS';
            return;
        }

        if (resourceType === ResourceType.video) {
            this.collectionName = 'video__VIEWS';
            return;
        }

        const exhaustiveCheck: never = resourceType;

        throw new InternalError(
            `unsupported target resource type (${exhaustiveCheck}) for transcription`
        );
    }

    createTranscript(id: AggregateId): AqlQuery {
        const emptyTranscript = Transcript.buildEmpty();

        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        UPDATE doc WITH {
            transcript: @transcriptDto
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id,
            transcriptDto: emptyTranscript.toDTO(),
        };

        return {
            query,
            bindVars,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addParticipant(id: AggregateId, { name, initials }: TranscriptParticipant): AqlQuery {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        let newParticipant = {
            name: @name,
            initials: @initials
        }
        update doc with {
            transcript: MERGE(doc.transcript,{
                participants: APPEND(doc.transcript.participants,newParticipant)
            })
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id,
            name,
            initials,
        };

        return { query, bindVars };
    }

    addLineItem(
        id: AggregateId,
        {
            speakerInitials,
            inPointMilliseconds,
            outPointMilliseconds,
            text,
            languageCode,
        }: TranscriptLineItemDto
    ): AqlQuery {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id

        update doc with {
            transcript: MERGE(doc.transcript,{
                items: APPEND(doc.transcript.items, @lineItem)
            })
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id,
            lineItem: new TranscriptItem({
                text: buildMultilingualTextWithSingleItem(text, languageCode),
                inPointMilliseconds,
                outPointMilliseconds,
                speakerInitials,
            }),
        };

        return { query, bindVars };
    }

    importLineItems(id: AggregateId, lineItems: TranscriptLineItemDto[]) {
        const query = `
                FOR doc IN @@collectionName
                FILTER doc._key == @id
        
                update doc with {
                    transcript: MERGE(doc.transcript,{
                        items: APPEND(doc.transcript.items, @lineItems)
                    })
                } IN @@collectionName
                `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id,
            lineItems: lineItems.map(
                ({
                    inPointMilliseconds,
                    outPointMilliseconds,
                    text,
                    languageCode,
                    speakerInitials,
                }) =>
                    new TranscriptItem({
                        text: buildMultilingualTextWithSingleItem(text, languageCode),
                        inPointMilliseconds,
                        outPointMilliseconds,
                        speakerInitials,
                    })
            ),
        };

        return { query, bindVars };
    }

    translateLineItem(
        id: AggregateId,
        // TODO Consider whether the out point is actually necessary here
        { languageCode, text, inPointMilliseconds, outPointMilliseconds }: TranslationLineItemDto
    ) {
        const newMultilingualTextItem = new MultilingualTextItem({
            languageCode,
            text,
            // TODO add this to the event payload
            role: MultilingualTextItemRole.freeTranslation,
        });

        const query = `
                FOR doc IN @@collectionName
                FILTER doc._key == @id
        
                let updatedItems = (
                    FOR item IN doc.transcript.items
                    let updatedItem = item.inPointMilliseconds == @inPointMilliseconds && item.outPointMilliseconds == @outPointMilliseconds ? MERGE(item,{ text: { items: APPEND(item.text.items,@newItem) }}) : item
                    return updatedItem
                )
        
                update doc with {
                    transcript: MERGE(doc.transcript,{
                        items: updatedItems
                    })
                } IN @@collectionName
                `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id,
            inPointMilliseconds,
            outPointMilliseconds,
            newItem: newMultilingualTextItem,
        };

        return { query, bindVars };
    }

    importTranslationsForTranscript(id: AggregateId, translations: TranslationItem[]): AqlQuery {
        const timeStampsAndNewMultilingualTextItems = translations.map(
            ({ inPointMilliseconds, translation: text, languageCode }) => ({
                inPointMilliseconds,
                translationItem: new MultilingualTextItem({
                    text,
                    languageCode,
                    role: MultilingualTextItemRole.freeTranslation,
                }),
            })
        );

        const query = `
        for doc in @@collectionName
        filter doc._key == @id

        let updatedTranscriptItems = (
            for existingItem in doc.transcript.items
            let index = position(@translations[*].inPointMilliseconds,existingItem.inPointMilliseconds,true)
             return merge_recursive(existingItem,
                index == -1 
                    ? {}
                    : {
                        text: {
                            items: append(existingItem.text.items,@translations[index].translationItem)
                        }
                    }
            )
        )

        update doc with {
            transcript: {
                        items: updatedTranscriptItems
                        }
                    } in @@collectionName
            `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id,
            translations: timeStampsAndNewMultilingualTextItems,
        };

        return {
            query,
            bindVars,
        };
    }
}
