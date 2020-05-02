import AWS from 'aws-sdk';
import { config } from '../config';
import fs, { createReadStream } from 'fs';
import { promisify } from 'util';
import { basename } from 'path';
import { ErrorMessages } from '../validation';

const c = config.dev;

// Configure AWS
if (c.aws_profile !== 'DEPLOYED') {
  const credentials = new AWS.SharedIniFileCredentials({ profile: c.aws_profile });
  AWS.config.credentials = credentials;
}

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: c.aws_region ?? 'us-east-1',
  params: { Bucket: c.aws_media_bucket },
});

const download: (arg1: AWS.S3.GetObjectRequest) => Promise<AWS.S3.GetObjectOutput> = promisify(s3.getObject).bind(s3);
const upload = promisify(s3.upload).bind(s3);
const writeFile = promisify(fs.writeFile);

/**
 * Get file from bucket
 * Save locally under tmp/
 * @param bucketPath file's path in bucket
 */
export function getFromBucket(bucketPath: string) {
  const params = {
    Bucket: c.aws_media_bucket,
    Key: bucketPath,
  };
  const localPath = `${__dirname}/tmp/${bucketPath}`;
  return download(params)
    .then((res) => writeFile(localPath, res.Body))
    .then(() => localPath)
    .catch((e) => {
      console.error(e);
      throw new Error(ErrorMessages.READ);
    });
}

/**
 * Upload file to s3 bucket under filter/
 * @param filePath local path to file
 */
export function saveToBucket(filePath: string) {
  const bucketPath = `filter/${basename(filePath)}`;

  const params = {
    Bucket: c.aws_media_bucket,
    Body: createReadStream(filePath),
    Key: bucketPath,
  };

  return upload(params)
    .then(({ Key }) => Key)
    .catch((e) => {
      console.error(e);
      throw new Error(ErrorMessages.SAVE);
    });
}
