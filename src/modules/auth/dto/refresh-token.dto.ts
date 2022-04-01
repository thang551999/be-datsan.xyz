import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    token:string ;
}
export class ResRefreshTokenDto {
    @ApiProperty()
    @IsString()
    token:string ;
}