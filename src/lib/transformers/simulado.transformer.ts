// Simulado data transformer
import { BaseTransformer, TransformUtils } from './base';
import { Simulado, CreateSimuladoDto, UpdateSimuladoDto } from '../types/entities';

// API response format (what we receive from backend)
interface SimuladoApiResponse {
  id: string | number;
  title: string;
  description: string;
  type: string;
  category: string;
  difficulty: string;
  time_limit: number;
  passing_score: number;
  max_attempts: number;
  status: string;
  is_public: boolean;
  created_by: string | number;
  creator?: any;
  questions?: any[];
  tags: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

export class SimuladoTransformer extends BaseTransformer<SimuladoApiResponse, Simulado> {
  transform(input: SimuladoApiResponse): Simulado {
    this.validateInput(input, ['id', 'title', 'description', 'type', 'created_by']);

    const transformed: Simulado = {
      id: String(input.id),
      title: TransformUtils.normalizeString(input.title),
      description: TransformUtils.normalizeString(input.description),
      type: this.normalizeType(input.type),
      category: TransformUtils.normalizeString(input.category),
      difficulty: this.normalizeDifficulty(input.difficulty),
      timeLimit: TransformUtils.normalizeNumber(input.time_limit),
      passingScore: TransformUtils.normalizeNumber(input.passing_score),
      maxAttempts: TransformUtils.normalizeNumber(input.max_attempts, 3),
      status: this.normalizeStatus(input.status),
      isPublic: TransformUtils.normalizeBoolean(input.is_public),
      createdBy: String(input.created_by),
      creator: input.creator ? this.transformCreator(input.creator) : undefined,
      questions: input.questions ? this.transformQuestions(input.questions) : [],
      tags: TransformUtils.normalizeArray(input.tags, TransformUtils.normalizeString),
      metadata: this.transformMetadata(input.metadata),
      createdAt: TransformUtils.normalizeDate(input.created_at) || new Date().toISOString(),
      updatedAt: TransformUtils.normalizeDate(input.updated_at) || new Date().toISOString()
    };

    this.logTransformation('Simulado', input, transformed);
    return transformed;
  }

  reverse(output: Simulado): SimuladoApiResponse {
    const reversed: SimuladoApiResponse = {
      id: output.id,
      title: output.title,
      description: output.description,
      type: output.type,
      category: output.category,
      difficulty: output.difficulty,
      time_limit: output.timeLimit,
      passing_score: output.passingScore,
      max_attempts: output.maxAttempts,
      status: output.status,
      is_public: output.isPublic,
      created_by: output.createdBy,
      creator: output.creator,
      questions: output.questions,
      tags: output.tags,
      metadata: output.metadata,
      created_at: output.createdAt,
      updated_at: output.updatedAt
    };

    this.logTransformation('Simulado reverse', output, reversed);
    return reversed;
  }

  // Transform create DTO for API
  transformCreateDto(dto: CreateSimuladoDto): any {
    return {
      title: dto.title,
      description: dto.description,
      type: dto.type,
      category: dto.category,
      difficulty: dto.difficulty,
      time_limit: dto.timeLimit,
      passing_score: dto.passingScore,
      max_attempts: dto.maxAttempts,
      is_public: dto.isPublic,
      created_by: dto.createdBy,
      tags: dto.tags,
      metadata: dto.metadata
    };
  }

  // Transform update DTO for API
  transformUpdateDto(dto: UpdateSimuladoDto): any {
    const transformed: any = {};

    if (dto.title !== undefined) transformed.title = dto.title;
    if (dto.description !== undefined) transformed.description = dto.description;
    if (dto.type !== undefined) transformed.type = dto.type;
    if (dto.category !== undefined) transformed.category = dto.category;
    if (dto.difficulty !== undefined) transformed.difficulty = dto.difficulty;
    if (dto.timeLimit !== undefined) transformed.time_limit = dto.timeLimit;
    if (dto.passingScore !== undefined) transformed.passing_score = dto.passingScore;
    if (dto.maxAttempts !== undefined) transformed.max_attempts = dto.maxAttempts;
    if (dto.status !== undefined) transformed.status = dto.status;
    if (dto.isPublic !== undefined) transformed.is_public = dto.isPublic;
    if (dto.tags !== undefined) transformed.tags = dto.tags;
    if (dto.metadata !== undefined) transformed.metadata = dto.metadata;

    return transformed;
  }

  private normalizeType(type: string): 'practice' | 'exam' | 'quiz' | 'assessment' {
    const normalized = type?.toLowerCase();
    if (['practice', 'exam', 'quiz', 'assessment'].includes(normalized)) {
      return normalized as 'practice' | 'exam' | 'quiz' | 'assessment';
    }
    return 'practice';
  }

  private normalizeDifficulty(difficulty: string): 'easy' | 'medium' | 'hard' {
    const normalized = difficulty?.toLowerCase();
    if (['easy', 'medium', 'hard'].includes(normalized)) {
      return normalized as 'easy' | 'medium' | 'hard';
    }
    return 'medium';
  }

  private normalizeStatus(status: string): 'active' | 'inactive' | 'draft' | 'archived' {
    const normalized = status?.toLowerCase();
    if (['active', 'inactive', 'draft', 'archived'].includes(normalized)) {
      return normalized as 'active' | 'inactive' | 'draft' | 'archived';
    }
    return 'draft';
  }

  private transformCreator(creator: any): any {
    if (!creator) return undefined;

    return {
      id: String(creator.id),
      name: TransformUtils.normalizeString(creator.name),
      email: TransformUtils.normalizeString(creator.email),
      avatar: creator.avatar
    };
  }

  private transformQuestions(questions: any[]): any[] {
    if (!Array.isArray(questions)) return [];

    return questions.map(question => ({
      id: String(question.id),
      question: TransformUtils.normalizeString(question.question),
      type: this.normalizeQuestionType(question.type),
      order: TransformUtils.normalizeNumber(question.order),
      points: TransformUtils.normalizeNumber(question.points, 1),
      explanation: question.explanation ? TransformUtils.normalizeString(question.explanation) : undefined,
      options: this.transformQuestionOptions(question.options),
      correctAnswers: TransformUtils.normalizeArray(question.correct_answers || question.correctAnswers, String),
      metadata: this.transformQuestionMetadata(question.metadata),
      createdAt: TransformUtils.normalizeDate(question.created_at || question.createdAt),
      updatedAt: TransformUtils.normalizeDate(question.updated_at || question.updatedAt)
    }));
  }

  private normalizeQuestionType(type: string): 'multiple_choice' | 'single_choice' | 'true_false' | 'essay' | 'fill_blank' {
    const normalized = type?.toLowerCase();
    if (['multiple_choice', 'single_choice', 'true_false', 'essay', 'fill_blank'].includes(normalized)) {
      return normalized as 'multiple_choice' | 'single_choice' | 'true_false' | 'essay' | 'fill_blank';
    }
    return 'single_choice';
  }

  private transformQuestionOptions(options: any[]): any[] {
    if (!Array.isArray(options)) return [];

    return options.map(option => ({
      id: String(option.id),
      text: TransformUtils.normalizeString(option.text),
      order: TransformUtils.normalizeNumber(option.order),
      isCorrect: TransformUtils.normalizeBoolean(option.is_correct || option.isCorrect),
      createdAt: TransformUtils.normalizeDate(option.created_at || option.createdAt),
      updatedAt: TransformUtils.normalizeDate(option.updated_at || option.updatedAt)
    }));
  }

  private transformQuestionMetadata(metadata: any): any {
    if (!metadata || typeof metadata !== 'object') {
      return {
        difficulty: 'medium',
        category: '',
        tags: [],
        estimatedTime: 60,
        references: []
      };
    }

    return {
      difficulty: this.normalizeDifficulty(metadata.difficulty) || 'medium',
      category: TransformUtils.normalizeString(metadata.category),
      tags: TransformUtils.normalizeArray(metadata.tags, TransformUtils.normalizeString),
      estimatedTime: TransformUtils.normalizeNumber(metadata.estimated_time || metadata.estimatedTime, 60),
      references: TransformUtils.normalizeArray(metadata.references, TransformUtils.normalizeString)
    };
  }

  private transformMetadata(metadata: any): any {
    if (!metadata || typeof metadata !== 'object') {
      return {
        instructions: '',
        showResults: true,
        showCorrectAnswers: true,
        randomizeQuestions: false,
        randomizeOptions: false,
        allowReview: true,
        certificateTemplate: undefined
      };
    }

    return {
      instructions: TransformUtils.normalizeString(metadata.instructions),
      showResults: TransformUtils.normalizeBoolean(metadata.show_results ?? metadata.showResults ?? true),
      showCorrectAnswers: TransformUtils.normalizeBoolean(metadata.show_correct_answers ?? metadata.showCorrectAnswers ?? true),
      randomizeQuestions: TransformUtils.normalizeBoolean(metadata.randomize_questions ?? metadata.randomizeQuestions ?? false),
      randomizeOptions: TransformUtils.normalizeBoolean(metadata.randomize_options ?? metadata.randomizeOptions ?? false),
      allowReview: TransformUtils.normalizeBoolean(metadata.allow_review ?? metadata.allowReview ?? true),
      certificateTemplate: metadata.certificate_template || metadata.certificateTemplate
    };
  }
}

// Export singleton instance
export const simuladoTransformer = new SimuladoTransformer();