// Video Course data transformer
import { BaseTransformer, TransformUtils } from './base';
import { VideoCourse, CreateVideoCourseDto, UpdateVideoCourseDto } from '../types/entities';

// API response format (what we receive from backend)
interface VideoCourseApiResponse {
  id: string | number;
  title: string;
  description: string;
  thumbnail?: string;
  status: string;
  instructor_id: string | number;
  instructor?: any;
  category: string;
  tags: string[];
  duration: number;
  level: string;
  price: number;
  currency: string;
  enrollment_count: number;
  rating: number;
  rating_count: number;
  lessons?: any[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

export class VideoCourseTransformer extends BaseTransformer<VideoCourseApiResponse, VideoCourse> {
  transform(input: VideoCourseApiResponse): VideoCourse {
    this.validateInput(input, ['id', 'title', 'description', 'instructor_id']);

    const transformed: VideoCourse = {
      id: String(input.id),
      title: TransformUtils.normalizeString(input.title),
      description: TransformUtils.normalizeString(input.description),
      thumbnail: input.thumbnail || undefined,
      status: this.normalizeStatus(input.status),
      instructorId: String(input.instructor_id),
      instructor: input.instructor ? this.transformInstructor(input.instructor) : undefined,
      category: TransformUtils.normalizeString(input.category),
      tags: TransformUtils.normalizeArray(input.tags, TransformUtils.normalizeString),
      duration: TransformUtils.normalizeNumber(input.duration),
      level: this.normalizeLevel(input.level),
      price: TransformUtils.normalizeNumber(input.price),
      currency: TransformUtils.normalizeString(input.currency) || 'BRL',
      enrollmentCount: TransformUtils.normalizeNumber(input.enrollment_count),
      rating: TransformUtils.normalizeNumber(input.rating),
      ratingCount: TransformUtils.normalizeNumber(input.rating_count),
      lessons: input.lessons ? this.transformLessons(input.lessons) : [],
      metadata: this.transformMetadata(input.metadata),
      createdAt: TransformUtils.normalizeDate(input.created_at) || new Date().toISOString(),
      updatedAt: TransformUtils.normalizeDate(input.updated_at) || new Date().toISOString()
    };

    this.logTransformation('VideoCourse', input, transformed);
    return transformed;
  }

  reverse(output: VideoCourse): VideoCourseApiResponse {
    const reversed: VideoCourseApiResponse = {
      id: output.id,
      title: output.title,
      description: output.description,
      thumbnail: output.thumbnail,
      status: output.status,
      instructor_id: output.instructorId,
      instructor: output.instructor,
      category: output.category,
      tags: output.tags,
      duration: output.duration,
      level: output.level,
      price: output.price,
      currency: output.currency,
      enrollment_count: output.enrollmentCount,
      rating: output.rating,
      rating_count: output.ratingCount,
      lessons: output.lessons,
      metadata: output.metadata,
      created_at: output.createdAt,
      updated_at: output.updatedAt
    };

    this.logTransformation('VideoCourse reverse', output, reversed);
    return reversed;
  }

  // Transform create DTO for API
  transformCreateDto(dto: CreateVideoCourseDto): any {
    return {
      title: dto.title,
      description: dto.description,
      thumbnail: dto.thumbnail,
      instructor_id: dto.instructorId,
      category: dto.category,
      tags: dto.tags,
      level: dto.level,
      price: dto.price,
      currency: dto.currency,
      metadata: dto.metadata
    };
  }

  // Transform update DTO for API
  transformUpdateDto(dto: UpdateVideoCourseDto): any {
    const transformed: any = {};

    if (dto.title !== undefined) transformed.title = dto.title;
    if (dto.description !== undefined) transformed.description = dto.description;
    if (dto.thumbnail !== undefined) transformed.thumbnail = dto.thumbnail;
    if (dto.status !== undefined) transformed.status = dto.status;
    if (dto.category !== undefined) transformed.category = dto.category;
    if (dto.tags !== undefined) transformed.tags = dto.tags;
    if (dto.level !== undefined) transformed.level = dto.level;
    if (dto.price !== undefined) transformed.price = dto.price;
    if (dto.metadata !== undefined) transformed.metadata = dto.metadata;

    return transformed;
  }

  private normalizeStatus(status: string): 'draft' | 'published' | 'archived' {
    const normalized = status?.toLowerCase();
    if (['draft', 'published', 'archived'].includes(normalized)) {
      return normalized as 'draft' | 'published' | 'archived';
    }
    return 'draft';
  }

  private normalizeLevel(level: string): 'beginner' | 'intermediate' | 'advanced' {
    const normalized = level?.toLowerCase();
    if (['beginner', 'intermediate', 'advanced'].includes(normalized)) {
      return normalized as 'beginner' | 'intermediate' | 'advanced';
    }
    return 'beginner';
  }

  private transformInstructor(instructor: any): any {
    if (!instructor) return undefined;

    return {
      id: String(instructor.id),
      name: TransformUtils.normalizeString(instructor.name),
      email: TransformUtils.normalizeString(instructor.email),
      avatar: instructor.avatar
    };
  }

  private transformLessons(lessons: any[]): any[] {
    if (!Array.isArray(lessons)) return [];

    return lessons.map(lesson => ({
      id: String(lesson.id),
      title: TransformUtils.normalizeString(lesson.title),
      description: TransformUtils.normalizeString(lesson.description),
      videoUrl: TransformUtils.normalizeString(lesson.video_url || lesson.videoUrl),
      duration: TransformUtils.normalizeNumber(lesson.duration),
      order: TransformUtils.normalizeNumber(lesson.order),
      isPreview: TransformUtils.normalizeBoolean(lesson.is_preview || lesson.isPreview),
      createdAt: TransformUtils.normalizeDate(lesson.created_at || lesson.createdAt),
      updatedAt: TransformUtils.normalizeDate(lesson.updated_at || lesson.updatedAt)
    }));
  }

  private transformMetadata(metadata: any): any {
    if (!metadata || typeof metadata !== 'object') {
      return {
        language: 'pt-BR',
        subtitles: [],
        requirements: [],
        objectives: [],
        targetAudience: []
      };
    }

    return {
      language: TransformUtils.normalizeString(metadata.language) || 'pt-BR',
      subtitles: TransformUtils.normalizeArray(metadata.subtitles, TransformUtils.normalizeString),
      requirements: TransformUtils.normalizeArray(metadata.requirements, TransformUtils.normalizeString),
      objectives: TransformUtils.normalizeArray(metadata.objectives, TransformUtils.normalizeString),
      targetAudience: TransformUtils.normalizeArray(
        metadata.target_audience || metadata.targetAudience, 
        TransformUtils.normalizeString
      )
    };
  }
}

// Export singleton instance
export const videoCourseTransformer = new VideoCourseTransformer();