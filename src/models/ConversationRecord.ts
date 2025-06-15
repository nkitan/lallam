/**
 * Conversation Model for WatermelonDB
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';
import { MessageRecord } from './MessageRecord';

export class ConversationRecord extends Model {
  static table = 'conversations';
  static associations = {
    messages: { type: 'has_many' as const, foreignKey: 'conversation_id' },
  };

  @field('title') title!: string;
  @field('last_message') lastMessage!: string;
  @field('timestamp') timestamp!: number;
  @field('message_count') messageCount!: number;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @children('messages') messages!: MessageRecord[];
}
