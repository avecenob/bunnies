import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOrderCompletionDto {
  @IsOptional()
  @IsBoolean()
  completion?: boolean;
}
