import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import internal from 'stream';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Injectable()
export class S3CoreService {
  private readonly logger: Logger = new Logger(S3CoreService.name);
  public readonly bucket: string;
  private readonly s3Config: AWS.S3.ClientConfiguration;

  constructor() {
    const region = process.env.AWS_REGION;
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    const endpoint = process.env.AWS_ENDPOINT;
    const s3ForcePathStyle = Boolean(process.env.S3_FORCE_PATH_STYLE);
    this.bucket = process.env.AWS_S3_UPLOAD_BUCKET;
    this.s3Config = { credentials, endpoint, s3ForcePathStyle, region };
  }

  public async uploadFileWithStream(readable: internal.Readable, key: string) {
    this.logger.debug(`stream file to S3 with key: ${key}`);
    try {
      const client = this.getInstance();
      return await client
        .upload({ Body: readable, Bucket: this.bucket, Key: key })
        .promise();
    } catch (error) {
      this.logger.debug(`error when upload to S3: ${JSON.stringify(error)}`);
      throw new BadRequestException(`Unknown error when upload file.`);
    }
  }

  public async deleteFiles(keys: string[]) {
    this.logger.debug(`delete files ${keys}`);

    try {
      const client = this.getInstance();
      const listKey = keys.map((key) => ({ Key: key }));

      await client
        .deleteObjects({ Bucket: this.bucket, Delete: { Objects: listKey } })
        .promise();
    } catch (error) {
      this.logger.debug(
        `error when delete file from S3: ${JSON.stringify(error)}`,
      );
      throw new BadRequestException(`Unknown error when delete file.`);
    }
  }

  public async getLinkFromS3(key: string) {
    this.logger.debug(`get link of key ${key}`);
    const client = this.getInstance();

    try {
      return client.getSignedUrl('getObject', {
        Bucket: this.bucket,
        Key: key,
        Expires: 10000, //expired after 5 min
      });
    } catch (error) {
      this.logger.debug(`error when get url from S3: ${JSON.stringify(error)}`);
      throw new BadRequestException(`Unknown error when get url file.`);
    }
  }

  public createStreamDownload(key: string) {
    this.logger.debug(`get file with stream ${key}`);
    const client = this.getInstance();

    try {
      return client
        .getObject({ Bucket: this.bucket, Key: key })
        .createReadStream();
    } catch (error) {
      this.logger.debug(
        `error when stream file to S3: ${JSON.stringify(error)}`,
      );
      throw new BadRequestException(`Unknown error when stream file to S3.`);
    }
  }

  public getInstance(): AWS.S3 {
    return new AWS.S3(this.s3Config);
  }
}
