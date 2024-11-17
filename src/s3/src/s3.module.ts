import { Module } from '@nestjs/common';
import { S3CoreService } from './s3.service';

@Module({
  providers: [S3CoreService],
  exports: [S3CoreService],
})
export class S3CoreModule { }
