// aws.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
@Injectable()
export class AwsService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    const aws = this.configService.get('aws');
    this.s3Client = new S3Client({
      region: aws.region,
      credentials: {
        accessKeyId: aws.s3AccessKey,
        secretAccessKey: aws.s3SecretAccessKey,
      },
    });
  }

  async imageUploadToS3({
    fileName,
    buffer,
    ext,
  }: {
    fileName: string;
    buffer: Buffer;
    ext: string;
  }) {
    const aws = this.configService.get('aws');
    const command = new PutObjectCommand({
      Bucket: aws.bucketName,
      Key: fileName,
      Body: buffer,
      ACL: 'public-read',
      ContentType: `image/${ext}`,
    });
    await this.s3Client.send(command);
    return `https://s3.${aws.region}.amazonaws.com/${aws.bucketName}/${fileName}`;
  }
}
