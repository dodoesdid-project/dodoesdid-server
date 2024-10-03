import { ReactionType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ToggleReactionFeedDto {
  @IsEnum(ReactionType)
  readonly reactionType: ReactionType;
}
