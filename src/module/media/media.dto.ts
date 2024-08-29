import { ApiProperty } from '@nestjs/swagger';

export class ListMediaDTO {
  @ApiProperty({ required: false })
  search: string;
  @ApiProperty({ required: false })
  status: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  startDate: string;
  @ApiProperty({ required: false })
  endDate: string;
  @ApiProperty({ required: false })
  isInvoice: number;
  userId?: number;
}

export class CartDto {
  @ApiProperty()
  year: string;
  userId?: number;
}

export class ApproveMediaDTO {
  @ApiProperty()
  mediaId: string;
  @ApiProperty({ description: '1->approved, 2->rejected' })
  status: number;
  @ApiProperty({ required: false })
  reasonId: number;
}

export class ApproveNewsDTO {
  @ApiProperty()
  newsId: string;
  @ApiProperty({ description: '1->approved, 2->rejected' })
  status: number;
  @ApiProperty({ required: false })
  reasonId: number;
}

export class SubmitNewsDTO {
  @ApiProperty()
  categoryId: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  desc: string;
  @ApiProperty()
  url: string;
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Files'
  })
  files: Express.Multer.File[];
}

export class ProcessApprovedMediaDTO {
  status: number;
  mediaName: string;
  userJournalId: number;
  reasonName: string;
  userJournalEmail: string;
  userId: number;
  reasonId: number;
  sortId: number;
  createdTime: string;
}

export class NewsItemsDTO {
  @ApiProperty()
  newsId: string;
  @ApiProperty()
  price: number;
  @ApiProperty()
  quantity: number;
}
