// Simulados Service - Business Logic Layer
import { 
  Simulado, 
  CreateSimuladoDto, 
  UpdateSimuladoDto,
  SimuladoType,
  DifficultyLevel,
  SimuladoQuestion,
  CreateSimuladoQuestionDto 
} from '../lib/types/entities';
import { 
  Result, 
  success, 
  failure, 
  IService, 
  PaginatedResponse, 
  QueryParams,
  ID 
} from '../lib/types/base';
import { SimuladosRepository } from '../lib/repositories/simulados.repository';
import { createSimuladoValidator } from '../lib/validation';
import { errorHandler } from '../lib/errors/handler';
import { logger } from '../lib/logging/logger';
import { simuladoTransformer } from '../lib/transformers';
import { BUSINESS_CONSTANTS } from '../lib/config/constants';

export interface SimuladosServiceConfig {
  maxSimuladosPerCreator?: number;
  maxQuestionsPerSimulado?: number;
  minQuestionsForPublish?: number;
  allowDuplicateTitles?: boolean;
  requireApprovalForPublish?: boolean;
  maxTagsPerSimulado?: number;
  defaultTimeLimit?: number;
  defaultPassingScore?: number;
}

export class SimuladosService implements IService<Simulado, CreateSimuladoDto, UpdateSimuladoDto> {
  private config: SimuladosServiceConfig;

  constructor(
    private repository: SimuladosRepository,
    config?: SimuladosServiceConfig
  ) {
    this.config = {
      maxSimuladosPerCreator: 100,
      maxQuestionsPerSimulado: 200,
      minQuestionsForPublish: 5,
      allowDuplicateTitles: false,
      requireApprovalForPublish: false,
      maxTagsPerSimulado: 15,
      defaultTimeLimit: 60, // minutes
      defaultPassingScore: 70, // percentage
      ...config
    };
  }

  async getAll(params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('SimuladosService: Getting all simulados', { params });
      
      const result = await this.repository.getAll(params);
      
      if (result.success) {
        logger.info('SimuladosService: Successfully retrieved simulados', { 
          count: result.data.data.length,
          total: result.data.meta.total 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'getAll'
      });
      logger.error('SimuladosService: Failed to get all simulados', error);
      return failure(appError);
    }
  }

  async getById(id: ID): Promise<Result<Simulado>> {
    try {
      logger.info('SimuladosService: Getting simulado by ID', { id });
      
      const result = await this.repository.getById(id);
      
      if (result.success) {
        logger.info('SimuladosService: Successfully retrieved simulado', { 
          id: result.data.id,
          title: result.data.title 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'getById'
      });
      logger.error('SimuladosService: Failed to get simulado by ID', error, { id });
      return failure(appError);
    }
  }

  async create(data: CreateSimuladoDto): Promise<Result<Simulado>> {
    try {
      logger.info('SimuladosService: Creating simulado', { title: data.title, type: data.type });
      
      // Validate input data
      const validationResult = createSimuladoValidator.validate(data);
      if (!validationResult.isValid) {
        logger.warn('SimuladosService: Validation failed', { errors: validationResult.errors });
        const appError = errorHandler.handle(
          { validationErrors: validationResult.errors },
          { component: 'SimuladosService', action: 'create' }
        );
        return failure(appError);
      }

      // Apply business rules
      const businessRulesResult = await this.validateBusinessRulesForCreate(data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Transform and enrich data
      const enrichedData = await this.enrichCreateData(data);
      
      // Create simulado
      const result = await this.repository.create(enrichedData);
      
      if (result.success) {
        logger.info('SimuladosService: Simulado created successfully', { 
          id: result.data.id,
          title: result.data.title,
          type: result.data.type,
          createdBy: result.data.createdBy 
        });

        // Trigger post-creation actions
        await this.handlePostCreation(result.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'create'
      });
      logger.error('SimuladosService: Failed to create simulado', error, { title: data.title });
      return failure(appError);
    }
  }

  async update(id: ID, data: UpdateSimuladoDto): Promise<Result<Simulado>> {
    try {
      logger.info('SimuladosService: Updating simulado', { id, changes: Object.keys(data) });
      
      // Get existing simulado for business rule validation
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      // Apply business rules
      const businessRulesResult = await this.validateBusinessRulesForUpdate(existingResult.data, data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Transform and enrich data
      const enrichedData = await this.enrichUpdateData(existingResult.data, data);
      
      // Update simulado
      const result = await this.repository.update(id, enrichedData);
      
      if (result.success) {
        logger.info('SimuladosService: Simulado updated successfully', { 
          id: result.data.id,
          title: result.data.title 
        });

        // Trigger post-update actions
        await this.handlePostUpdate(existingResult.data, result.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'update'
      });
      logger.error('SimuladosService: Failed to update simulado', error, { id });
      return failure(appError);
    }
  }

  async delete(id: ID): Promise<Result<void>> {
    try {
      logger.info('SimuladosService: Deleting simulado', { id });
      
      // Get existing simulado for business rule validation
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      // Apply business rules for deletion
      const businessRulesResult = await this.validateBusinessRulesForDelete(existingResult.data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Delete simulado
      const result = await this.repository.delete(id);
      
      if (result.success) {
        logger.info('SimuladosService: Simulado deleted successfully', { id });

        // Trigger post-deletion actions
        await this.handlePostDeletion(existingResult.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'delete'
      });
      logger.error('SimuladosService: Failed to delete simulado', error, { id });
      return failure(appError);
    }
  }

  // Business-specific methods
  async getByType(type: SimuladoType, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('SimuladosService: Getting simulados by type', { type });
      
      const result = await this.repository.getByType(type, params);
      
      if (result.success) {
        logger.info('SimuladosService: Successfully retrieved simulados by type', { 
          type,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'getByType'
      });
      logger.error('SimuladosService: Failed to get simulados by type', error, { type });
      return failure(appError);
    }
  }

  async getByDifficulty(difficulty: DifficultyLevel, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('SimuladosService: Getting simulados by difficulty', { difficulty });
      
      const result = await this.repository.getByDifficulty(difficulty, params);
      
      if (result.success) {
        logger.info('SimuladosService: Successfully retrieved simulados by difficulty', { 
          difficulty,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'getByDifficulty'
      });
      logger.error('SimuladosService: Failed to get simulados by difficulty', error, { difficulty });
      return failure(appError);
    }
  }

  async getByCreator(createdBy: ID, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('SimuladosService: Getting simulados by creator', { createdBy });
      
      const result = await this.repository.getByCreator(createdBy, params);
      
      if (result.success) {
        logger.info('SimuladosService: Successfully retrieved creator simulados', { 
          createdBy,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'getByCreator'
      });
      logger.error('SimuladosService: Failed to get simulados by creator', error, { createdBy });
      return failure(appError);
    }
  }

  async getPublic(params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('SimuladosService: Getting public simulados');
      
      const result = await this.repository.getPublic(params);
      
      if (result.success) {
        logger.info('SimuladosService: Successfully retrieved public simulados', { 
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'getPublic'
      });
      logger.error('SimuladosService: Failed to get public simulados', error);
      return failure(appError);
    }
  }

  async togglePublic(id: ID): Promise<Result<Simulado>> {
    try {
      logger.info('SimuladosService: Toggling simulado public status', { id });
      
      // Get current simulado
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      const currentSimulado = existingResult.data;

      // Validate if can be made public
      if (!currentSimulado.isPublic) {
        const canMakePublicResult = await this.canMakePublic(currentSimulado);
        if (!canMakePublicResult.success) {
          return failure(canMakePublicResult.error);
        }
      }

      // Toggle public status
      const result = await this.repository.togglePublic(id);
      
      if (result.success) {
        logger.info('SimuladosService: Simulado public status toggled', { 
          id,
          oldStatus: currentSimulado.isPublic,
          newStatus: result.data.isPublic 
        });

        // Trigger status change actions
        await this.handlePublicStatusChange(currentSimulado, result.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'togglePublic'
      });
      logger.error('SimuladosService: Failed to toggle public status', error, { id });
      return failure(appError);
    }
  }

  async clone(id: ID, newTitle?: string): Promise<Result<Simulado>> {
    try {
      logger.info('SimuladosService: Cloning simulado', { id, newTitle });
      
      // Get original simulado
      const originalResult = await this.repository.getWithQuestions(id);
      if (!originalResult.success) {
        return failure(originalResult.error);
      }

      const original = originalResult.data;

      // Validate cloning permissions
      const canCloneResult = await this.canClone(original);
      if (!canCloneResult.success) {
        return failure(canCloneResult.error);
      }

      // Generate new title if not provided
      const cloneTitle = newTitle || `${original.title} (Cópia)`;

      // Clone simulado
      const result = await this.repository.clone(id, cloneTitle);
      
      if (result.success) {
        logger.info('SimuladosService: Simulado cloned successfully', { 
          originalId: id,
          newId: result.data.id,
          newTitle: result.data.title 
        });

        // Trigger post-clone actions
        await this.handlePostClone(original, result.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'clone'
      });
      logger.error('SimuladosService: Failed to clone simulado', error, { id });
      return failure(appError);
    }
  }

  async search(query: string, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('SimuladosService: Searching simulados', { query });
      
      // Validate search query
      if (!query || query.trim().length < 2) {
        const appError = errorHandler.handle(
          new Error('Search query must be at least 2 characters'),
          { component: 'SimuladosService', action: 'search' }
        );
        return failure(appError);
      }

      const result = await this.repository.search(query.trim(), params);
      
      if (result.success) {
        logger.info('SimuladosService: Search completed', { 
          query,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'search'
      });
      logger.error('SimuladosService: Failed to search simulados', error, { query });
      return failure(appError);
    }
  }

  async getStatistics(id: ID): Promise<Result<any>> {
    try {
      logger.info('SimuladosService: Getting simulado statistics', { id });
      
      const result = await this.repository.getStatistics(id);
      
      if (result.success) {
        logger.info('SimuladosService: Successfully retrieved statistics', { id });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'getStatistics'
      });
      logger.error('SimuladosService: Failed to get statistics', error, { id });
      return failure(appError);
    }
  }

  // Question management methods
  async validateQuestionDistribution(simulado: Simulado): Promise<Result<void>> {
    try {
      const questions = simulado.questions || [];
      
      if (questions.length < this.config.minQuestionsForPublish!) {
        const appError = errorHandler.handle(
          new Error(`Simulado must have at least ${this.config.minQuestionsForPublish} questions to be published`),
          { component: 'SimuladosService', action: 'validateQuestionDistribution' }
        );
        return failure(appError);
      }

      if (questions.length > this.config.maxQuestionsPerSimulado!) {
        const appError = errorHandler.handle(
          new Error(`Simulado cannot have more than ${this.config.maxQuestionsPerSimulado} questions`),
          { component: 'SimuladosService', action: 'validateQuestionDistribution' }
        );
        return failure(appError);
      }

      // Validate question distribution by difficulty
      const difficultyDistribution = this.calculateDifficultyDistribution(questions);
      const validationResult = this.validateDifficultyDistribution(difficultyDistribution, simulado.difficulty);
      
      if (!validationResult.success) {
        return failure(validationResult.error);
      }

      return success(undefined);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosService',
        action: 'validateQuestionDistribution'
      });
      return failure(appError);
    }
  }

  // Private business rule validation methods
  private async validateBusinessRulesForCreate(data: CreateSimuladoDto): Promise<Result<void>> {
    // Check creator simulado limit
    const creatorSimuladosResult = await this.repository.getByCreator(data.createdBy);
    if (creatorSimuladosResult.success) {
      const simuladoCount = creatorSimuladosResult.data.meta.total;
      if (simuladoCount >= this.config.maxSimuladosPerCreator!) {
        const appError = errorHandler.handle(
          new Error(`Creator has reached maximum simulado limit (${this.config.maxSimuladosPerCreator})`),
          { component: 'SimuladosService', action: 'validateBusinessRulesForCreate' }
        );
        return failure(appError);
      }
    }

    // Check duplicate titles if not allowed
    if (!this.config.allowDuplicateTitles) {
      const searchResult = await this.repository.search(data.title);
      if (searchResult.success && searchResult.data.data.length > 0) {
        const appError = errorHandler.handle(
          new Error('A simulado with this title already exists'),
          { component: 'SimuladosService', action: 'validateBusinessRulesForCreate' }
        );
        return failure(appError);
      }
    }

    // Check tags limit
    if (data.tags && data.tags.length > this.config.maxTagsPerSimulado!) {
      const appError = errorHandler.handle(
        new Error(`Too many tags. Maximum allowed: ${this.config.maxTagsPerSimulado}`),
        { component: 'SimuladosService', action: 'validateBusinessRulesForCreate' }
      );
      return failure(appError);
    }

    // Validate time limit
    if (data.timeLimit < 5 || data.timeLimit > 480) { // 5 minutes to 8 hours
      const appError = errorHandler.handle(
        new Error('Time limit must be between 5 and 480 minutes'),
        { component: 'SimuladosService', action: 'validateBusinessRulesForCreate' }
      );
      return failure(appError);
    }

    // Validate passing score
    if (data.passingScore < 0 || data.passingScore > 100) {
      const appError = errorHandler.handle(
        new Error('Passing score must be between 0 and 100'),
        { component: 'SimuladosService', action: 'validateBusinessRulesForCreate' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  private async validateBusinessRulesForUpdate(
    existing: Simulado, 
    data: UpdateSimuladoDto
  ): Promise<Result<void>> {
    // Check if trying to publish without enough questions
    if (data.status === 'active' && existing.status !== 'active') {
      const questionCount = existing.questions?.length || 0;
      if (questionCount < this.config.minQuestionsForPublish!) {
        const appError = errorHandler.handle(
          new Error(`Simulado must have at least ${this.config.minQuestionsForPublish} questions to be activated`),
          { component: 'SimuladosService', action: 'validateBusinessRulesForUpdate' }
        );
        return failure(appError);
      }
    }

    // Check tags limit
    if (data.tags && data.tags.length > this.config.maxTagsPerSimulado!) {
      const appError = errorHandler.handle(
        new Error(`Too many tags. Maximum allowed: ${this.config.maxTagsPerSimulado}`),
        { component: 'SimuladosService', action: 'validateBusinessRulesForUpdate' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  private async validateBusinessRulesForDelete(simulado: Simulado): Promise<Result<void>> {
    // Don't allow deletion of active public simulados
    if (simulado.status === 'active' && simulado.isPublic) {
      const appError = errorHandler.handle(
        new Error('Cannot delete active public simulado'),
        { component: 'SimuladosService', action: 'validateBusinessRulesForDelete' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  private async canMakePublic(simulado: Simulado): Promise<Result<void>> {
    // Check if has minimum questions
    const questionCount = simulado.questions?.length || 0;
    if (questionCount < this.config.minQuestionsForPublish!) {
      const appError = errorHandler.handle(
        new Error(`Simulado must have at least ${this.config.minQuestionsForPublish} questions to be made public`),
        { component: 'SimuladosService', action: 'canMakePublic' }
      );
      return failure(appError);
    }

    // Check if simulado is active
    if (simulado.status !== 'active') {
      const appError = errorHandler.handle(
        new Error('Only active simulados can be made public'),
        { component: 'SimuladosService', action: 'canMakePublic' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  private async canClone(simulado: Simulado): Promise<Result<void>> {
    // For now, allow cloning of any simulado
    // Add specific business rules here if needed
    return success(undefined);
  }

  // Private helper methods
  private async enrichCreateData(data: CreateSimuladoDto): Promise<CreateSimuladoDto> {
    return {
      ...data,
      timeLimit: data.timeLimit || this.config.defaultTimeLimit!,
      passingScore: data.passingScore || this.config.defaultPassingScore!,
      tags: data.tags || []
    };
  }

  private async enrichUpdateData(
    existing: Simulado, 
    data: UpdateSimuladoDto
  ): Promise<UpdateSimuladoDto> {
    return {
      ...data
    };
  }

  private calculateDifficultyDistribution(questions: SimuladoQuestion[]): Record<DifficultyLevel, number> {
    const distribution: Record<DifficultyLevel, number> = {
      easy: 0,
      medium: 0,
      hard: 0
    };

    questions.forEach(question => {
      const difficulty = question.metadata?.difficulty || 'medium';
      distribution[difficulty]++;
    });

    return distribution;
  }

  private validateDifficultyDistribution(
    distribution: Record<DifficultyLevel, number>,
    simuladoDifficulty: DifficultyLevel
  ): Result<void> {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return success(undefined);
    }

    // Define expected distribution based on simulado difficulty
    const expectedDistributions: Record<DifficultyLevel, Record<DifficultyLevel, number>> = {
      easy: { easy: 0.6, medium: 0.3, hard: 0.1 },
      medium: { easy: 0.3, medium: 0.5, hard: 0.2 },
      hard: { easy: 0.2, medium: 0.3, hard: 0.5 }
    };

    const expected = expectedDistributions[simuladoDifficulty];
    const actual = {
      easy: distribution.easy / total,
      medium: distribution.medium / total,
      hard: distribution.hard / total
    };

    // Allow some tolerance (±20%)
    const tolerance = 0.2;
    
    for (const [difficulty, expectedRatio] of Object.entries(expected)) {
      const actualRatio = actual[difficulty as DifficultyLevel];
      const diff = Math.abs(actualRatio - expectedRatio);
      
      if (diff > tolerance && total >= 10) { // Only enforce for simulados with 10+ questions
        const appError = errorHandler.handle(
          new Error(`Question difficulty distribution doesn't match simulado difficulty level`),
          { component: 'SimuladosService', action: 'validateDifficultyDistribution' }
        );
        return failure(appError);
      }
    }

    return success(undefined);
  }

  // Post-action handlers
  private async handlePostCreation(simulado: Simulado): Promise<void> {
    logger.info('SimuladosService: Handling post-creation actions', { simuladoId: simulado.id });
    // Add any post-creation logic here (notifications, analytics, etc.)
  }

  private async handlePostUpdate(oldSimulado: Simulado, newSimulado: Simulado): Promise<void> {
    logger.info('SimuladosService: Handling post-update actions', { simuladoId: newSimulado.id });
    // Add any post-update logic here
  }

  private async handlePostDeletion(simulado: Simulado): Promise<void> {
    logger.info('SimuladosService: Handling post-deletion actions', { simuladoId: simulado.id });
    // Add any post-deletion logic here
  }

  private async handlePublicStatusChange(oldSimulado: Simulado, newSimulado: Simulado): Promise<void> {
    logger.info('SimuladosService: Handling public status change actions', { 
      simuladoId: newSimulado.id,
      oldStatus: oldSimulado.isPublic,
      newStatus: newSimulado.isPublic 
    });
    // Add any public status change logic here (notifications, etc.)
  }

  private async handlePostClone(original: Simulado, clone: Simulado): Promise<void> {
    logger.info('SimuladosService: Handling post-clone actions', { 
      originalId: original.id,
      cloneId: clone.id 
    });
    // Add any post-clone logic here
  }
}