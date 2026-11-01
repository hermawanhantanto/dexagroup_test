import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ClockOutDto {
  @IsOptional()
  @IsString({ message: 'Notes must be text' })
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}
