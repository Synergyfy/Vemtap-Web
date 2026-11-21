import {
  BadRequestException,
  Controller,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SkipSubscriptionCheck } from '../subscriptions/decorators/skip-subscription-check.decorator';
import { UploadsService } from './uploads.service';

// Photos are kept small so a crop is cheap to upload; videos get their own,
// larger allowance. Multer is capped at the video limit and the handler applies
// the tighter photo limit after it knows the MIME type.
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_UPLOAD_BYTES = MAX_VIDEO_UPLOAD_BYTES;
const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_VIDEO_MIME_TYPES];

/**
 * Cloudinary folders a caller may route to. The override exists so avatars,
 * chat media and verification documents do not land under a business folder;
 * without a boundary a caller could write anywhere in the account.
 */
const ALLOWED_FOLDER_PREFIXES = [
  'vemtap/avatars/',
  'vemtap/users/',
  'vemtap/messaging/',
  'vemtap/businesses/',
  'vemtap/verification/',
];

function isAllowedFolder(folder: string): boolean {
  // A prefix plus at least one path segment — `vemtap/avatars/` alone is a
  // folder-less path and Cloudinary would flatten it into the parent.
  return ALLOWED_FOLDER_PREFIXES.some(
    (prefix) => folder.startsWith(prefix) && folder.length > prefix.length,
  );
}

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @SkipSubscriptionCheck()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN, UserRole.CUSTOMER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_BYTES },
      // Only the file is validated here: multer parses non-file fields after
      // this callback, so anything derived from `req.body` (the folder
      // override) cannot be checked at this stage — it is validated in the
      // handler below.
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Only JPG, PNG, WebP, PDF, MP4, WebM or MOV files are allowed',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({
    summary: 'Upload an image or video (business media, gallery, or user avatar)',
    description:
      'Accepts multipart/form-data `file`. Images (JPG/PNG/WebP/PDF) max 5MB; ' +
      'videos (MP4/WebM/MOV) max 50MB. Returns the hosted URL. Owners, managers ' +
      'and admins land in `vemtap/businesses/{businessId}`; customers with no ' +
      'business context land in `vemtap/users/{userId}`, which is where the ' +
      'profile-picture flow puts avatars before PATCHing them onto the user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded successfully',
    schema: { example: { url: 'https://res.cloudinary.com/.../logo.png' } },
  })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Request()
    req: {
      user?: { id?: string; businessId?: string };
      body?: { folderOverride?: string };
    },
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const user = req.user;
    const folderOverride = req.body?.folderOverride;

    if (
      ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype) &&
      file.size > MAX_IMAGE_UPLOAD_BYTES
    ) {
      throw new BadRequestException('Images must be 5MB or smaller.');
    }
    if (
      ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype) &&
      file.size > MAX_VIDEO_UPLOAD_BYTES
    ) {
      throw new BadRequestException('Videos must be 50MB or smaller.');
    }

    // Rejected here rather than in `fileFilter`: multer has not parsed the
    // non-file fields yet when the filter runs.
    if (folderOverride !== undefined && !isAllowedFolder(folderOverride)) {
      throw new BadRequestException(
        'Invalid folder override. Allowed prefixes: vemtap/avatars, vemtap/users, vemtap/messaging, vemtap/businesses, vemtap/verification',
      );
    }

    const folder = folderOverride
      ? folderOverride
      : user?.businessId
        ? undefined
        : user?.id
          ? `vemtap/users/${user.id}`
          : undefined;
    return this.uploadsService.uploadImage(file, user?.businessId, folder);
  }
}
