import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CheckInDto {
  @IsUrl({}, { message: 'Proof image must be a valid URL' })
  @IsNotEmpty({ message: 'Proof image URL is required' })
  proofImageUrl: string;

  @IsOptional()
  @IsString({ message: 'Notes must be text' })
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}
