// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAuth } from './lib/auth'
import * as Minio from 'minio'
import type internal from 'stream'
// import
// import { env } from '~/env.js'
// const Minio = require('minio');
interface MinioFileServiceOptions {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

class MinioFileService {
  private client: Minio.Client;
  private bucket: string;

  constructor(options: MinioFileServiceOptions) {
    this.client = new Minio.Client({
      endPoint: options.endPoint,
      port: options.port,
      useSSL: options.useSSL,
      accessKey: options.accessKey,
      secretKey: options.secretKey,
    });
    this.bucket = options.bucket;
  }

  async upload(file: { originalname: string; path: string; mimetype: string }): Promise<string> {
    const fileName = file.originalname;
    const filePath = file.path;

    try {
      await this.client.fPutObject(this.bucket, fileName, filePath, {
        'Content-Type': file.mimetype,
      });
      return `/${this.bucket}/${fileName}`;
    } catch (error) {
      throw new Error('Failed to upload file to MinIO');
    }
  }

  async delete(fileKey: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, fileKey);
    } catch (error) {
      throw new Error('Failed to delete file from MinIO');
    }
  }
}

const minioFileService = new MinioFileService({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
  bucket: process.env.MINIO_BUCKET || 'my-bucket',
});

export default minioFileService;

// Create a new Minio client with the S3 endpoint, access key, and secret key
// export const s3Client = new Minio.Client({
//   endPoint: process.env.S3_ENDPOINT,
//   port: process.env.S3_PORT ? Number(process.env.S3_PORT) : undefined,
//   accessKey: process.env.S3_ACCESS_KEY,
//   secretKey: process.env.S3_SECRET_KEY,
//   useSSL: process.env.S3_USE_SSL === 'true',
// })
 
// export async function createBucketIfNotExists(bucketName: string) {
//   const bucketExists = await s3Client.bucketExists(bucketName)
//   if (!bucketExists) {
//     await s3Client.makeBucket(bucketName)
//   }
// }

// export s3Client 
async function getPresignedUrl(file:any) {
  const response = await fetch(`/api/files/download/presignedUrl/${file.id}`)
  return (await response.json()) as string
}
 
const downloadFile = async (file:any) => {
  const presignedUrl = await getPresignedUrl(file)
  window.open(presignedUrl, '_blank')
}
// Create a new Minio client with the S3 endpoint, access key, and secret key
export async function deleteFileFromBucket({ bucketName, fileName }: { bucketName: string; fileName: string }) {
  try {
    await s3Client.removeObject(bucketName, fileName)
  } catch (error) {
    console.error(error)
    return false
  }
  return true
}

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const token = req.cookies.get('user-token')?.value

  // validate the user is authenticated
  const verifiedToken =
    token &&
    (await verifyAuth(token).catch((err) => {
      console.error(err.message)
    }))

  if (req.nextUrl.pathname.startsWith('/login') && !verifiedToken) {
    return
  }

  const url = req.url

  if (url.includes('/login') && verifiedToken) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (!verifiedToken) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*', '/login'],
}
