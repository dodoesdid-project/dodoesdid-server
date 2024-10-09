import { ReactionType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ToggleDazimReactionDto {
  @IsEnum(ReactionType)
  readonly reactionType: ReactionType;
}
