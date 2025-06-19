/**
 * Message Model for WatermelonDB
 */

import { Model, Relation } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import { ConversationRecord } from './ConversationRecord';

export class MessageRecord extends Model {
  static table = 'messages';
  static associations = {
    conversation: { type: 'belongs_to' as const, key: 'conversation_id' },
  };

  @field('text') text!: string;
  @field('is_user') isUser!: boolean;
  @field('timestamp') timestamp!: number;
  @field('conversation_id') conversationId!: string;
  @field('tokens') tokens!: number;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @relation('conversations', 'conversation_id') conversation!: Relation<ConversationRecord>;
}
