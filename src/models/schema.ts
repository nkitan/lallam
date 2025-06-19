/**
 * WatermelonDB Schema Definition
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'conversations',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'last_message', type: 'string' },
        { name: 'timestamp', type: 'number' },
        { name: 'message_count', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'messages',
      columns: [
        { name: 'text', type: 'string' },
        { name: 'is_user', type: 'boolean' },
        { name: 'timestamp', type: 'number' },
        { name: 'conversation_id', type: 'string', isIndexed: true },
        { name: 'tokens', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
