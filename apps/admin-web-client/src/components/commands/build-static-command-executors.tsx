import {
    AggregateCompositeIdentifier,
    AggregateType,
    CategorizableType,
} from '@coscrad/api-interfaces';
import { CommandExecutionFormProps, buildCommandExecutor } from './command-executor';
import { ConnectResourcesWithNoteForm, CreateNoteForm } from './connections';
import { TagResourceOrNoteForm } from './connections/tag-resource-or-note-form';

export const buildStaticCommandExecutors = (compositeIdentifier: AggregateCompositeIdentifier) => {
    const { type: aggregateType, id } = compositeIdentifier;

    if (!Object.values(CategorizableType).includes(aggregateType as CategorizableType)) return [];

    const categorizableType = aggregateType as CategorizableType;

    const tagResourceOrNoteExecutor = {
        // TODO Pull the meta from the back-end
        label: 'Tag Resource or Note',
        description: 'Apply an existing tag to this resource',
        type: 'TAG_RESOURCE_OR_NOTE',
        executor: buildCommandExecutor(TagResourceOrNoteForm, {
            taggedMemberCompositeIdentifier: compositeIdentifier,
        }),
    };

    return [
        ...(categorizableType === CategorizableType.note
            ? [tagResourceOrNoteExecutor]
            : [
                  {
                      // TODO Pull the meta from the back-end
                      label: 'Create Note',
                      description: 'Create a note about this resource',
                      type: 'CREATE_NOTE_ABOUT_RESOURCE',
                      executor: buildCommandExecutor(
                          CreateNoteForm,
                          {
                              /**
                               * Here we bind the composite identifier
                               * for the current page to the payload
                               * for `CREATE_NOTE_ABOUT_RESOURCE`. Note
                               * that this command is being presented in
                               * a foreign aggregate context, so we do
                               * not bind to `aggregateCompositeIdentifier`
                               * on the payload. This, the ID of the newly
                               * created note, must be generated via the
                               * ID generation system.
                               */
                              resourceCompositeIdentifier: {
                                  ...compositeIdentifier,
                              },
                          },
                          AggregateType.note
                      ),
                  },
                  {
                      // TODO Pull the meta from the back-end
                      label: 'Create Connection with Note',
                      description: 'Connect this resource to another resource with a note',
                      type: 'CONNECT_RESOURCES_WITH_NOTE',
                      executor: buildCommandExecutor(
                          ({ onSubmitForm }: CommandExecutionFormProps) => (
                              <ConnectResourcesWithNoteForm
                                  fromMemberCompositeIdentifier={{
                                      type: categorizableType,
                                      id,
                                  }}
                                  onSubmitForm={onSubmitForm}
                                  bindProps={{
                                      fromMemberCompositeIdentifier: compositeIdentifier,
                                  }}
                              />
                          ),
                          {
                              /**
                               * Here we bind the composite identifier
                               * for the current page to the payload
                               * for `CONNECT_RESOURCES_WITH_NOTE`. Note
                               * that this command is being presented in
                               * a foreign aggregate context, so we do
                               * not bind to `aggregateCompositeIdentifier`
                               * on the payload. This, the ID of the newly
                               * created note, must be generated via the
                               * ID generation system.
                               */
                              fromMemberCompositeIdentifier: {
                                  ...compositeIdentifier,
                              },
                          },
                          AggregateType.note
                      ),
                  },
                  tagResourceOrNoteExecutor,
              ]),
    ];
};
