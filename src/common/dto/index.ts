import { ApiProperty } from "@nestjs/swagger"

export interface MetaDTO {
    context?: string
    trace?: string
    path: string
    uniqueId?: string
    refId?: string
    query?: string
    body?: string
    header?: string
    currentTime?: number
    responseTime?: string
    ip?: string
    responseCode?: number
}

export class DocumentDTO {
    @ApiProperty()
    id: number
    @ApiProperty()
    file: string
    @ApiProperty()
    name: string
}