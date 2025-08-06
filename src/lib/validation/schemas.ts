// Entity-specific validators
import { BaseValidator, ValidationUtils } from './base';
import { ValidationResult, ValidationError } from '../types/base';
import {
    VideoCourse,
    CreateVideoCourseDto,
    UpdateVideoCourseDto,
    VideoLesson,
    CreateVideoLessonDto,
    UpdateVideoLessonDto,
    Simulado,
    CreateSimuladoDto,
    UpdateSimuladoDto,
    User,
    CreateUserDto,
    UpdateUserDto
} from '../types/entities';
import { VALIDATION_CONSTANTS, BUSINESS_CONSTANTS } from '../config/constants';

// User validators
export class CreateUserValidator extends BaseValidator<CreateUserDto> {
    validate(data: CreateUserDto): ValidationResult {
        const errors: ValidationError[] = [];

        // Email validation
        const emailError = this.validateRequired('email', data.email) ||
            this.validateEmail('email', data.email);
        if (emailError) errors.push(emailError);

        // Name validation
        const nameError = this.validateRequired('name', data.name) ||
            this.validateString('name', data.name,
                VALIDATION_CONSTANTS.LENGTHS.NAME_MIN,
                VALIDATION_CONSTANTS.LENGTHS.NAME_MAX);
        if (nameError) errors.push(nameError);

        // Password validation
        const passwordError = this.validateRequired('password', data.password);
        if (passwordError) {
            errors.push(passwordError);
        } else {
            errors.push(...ValidationUtils.validatePassword(data.password));
        }

        // Role validation
        const roleError = this.validateRequired('role', data.role) ||
            this.validateEnum('role', data.role, Object.values(BUSINESS_CONSTANTS.USER_ROLES));
        if (roleError) errors.push(roleError);

        return this.createValidationResult(errors);
    }
}

export class UpdateUserValidator extends BaseValidator<UpdateUserDto> {
    validate(data: UpdateUserDto): ValidationResult {
        const errors: ValidationError[] = [];

        // Name validation (optional)
        if (data.name !== undefined) {
            const nameError = this.validateString('name', data.name,
                VALIDATION_CONSTANTS.LENGTHS.NAME_MIN,
                VALIDATION_CONSTANTS.LENGTHS.NAME_MAX);
            if (nameError) errors.push(nameError);
        }

        // Role validation (optional)
        if (data.role !== undefined) {
            const roleError = this.validateEnum('role', data.role, Object.values(BUSINESS_CONSTANTS.USER_ROLES));
            if (roleError) errors.push(roleError);
        }

        // Status validation (optional)
        if (data.status !== undefined) {
            const statusError = this.validateEnum('status', data.status, ['active', 'inactive', 'draft', 'archived']);
            if (statusError) errors.push(statusError);
        }

        return this.createValidationResult(errors);
    }
}

// Video Course validators
export class CreateVideoCourseValidator extends BaseValidator<CreateVideoCourseDto> {
    validate(data: CreateVideoCourseDto): ValidationResult {
        const errors: ValidationError[] = [];

        // Title validation
        const titleError = this.validateRequired('title', data.title) ||
            this.validateString('title', data.title,
                VALIDATION_CONSTANTS.LENGTHS.TITLE_MIN,
                VALIDATION_CONSTANTS.LENGTHS.TITLE_MAX);
        if (titleError) errors.push(titleError);

        // Description validation
        const descriptionError = this.validateRequired('description', data.description) ||
            this.validateString('description', data.description,
                VALIDATION_CONSTANTS.LENGTHS.DESCRIPTION_MIN,
                VALIDATION_CONSTANTS.LENGTHS.DESCRIPTION_MAX);
        if (descriptionError) errors.push(descriptionError);

        // Instructor ID validation
        const instructorError = this.validateRequired('instructorId', data.instructorId);
        if (instructorError) errors.push(instructorError);
        else if (!ValidationUtils.isValidId(data.instructorId)) {
            errors.push(this.createError('instructorId', 'ID do instrutor inválido', 'INVALID_ID'));
        }

        // Category validation
        const categoryError = this.validateRequired('category', data.category) ||
            this.validateString('category', data.category, 2, 50);
        if (categoryError) errors.push(categoryError);

        // Tags validation
        const tagsError = this.validateArray('tags', data.tags, 0, 10);
        if (tagsError) errors.push(tagsError);
        else if (data.tags) {
            data.tags.forEach((tag, index) => {
                const tagError = this.validateString(`tags[${index}]`, tag, 1, 30);
                if (tagError) errors.push(tagError);
            });
        }

        // Level validation
        const levelError = this.validateRequired('level', data.level) ||
            this.validateEnum('level', data.level, ['beginner', 'intermediate', 'advanced']);
        if (levelError) errors.push(levelError);

        // Price validation
        const priceError = this.validateRequired('price', data.price) ||
            this.validateNumber('price', data.price, 0);
        if (priceError) errors.push(priceError);

        // Currency validation
        const currencyError = this.validateRequired('currency', data.currency) ||
            this.validateString('currency', data.currency, 3, 3);
        if (currencyError) errors.push(currencyError);

        // Metadata validation
        if (data.metadata) {
            const metadataErrors = this.validateCourseMetadata(data.metadata);
            errors.push(...metadataErrors);
        }

        return this.createValidationResult(errors);
    }

    private validateCourseMetadata(metadata: any): ValidationError[] {
        const errors: ValidationError[] = [];

        if (metadata.language) {
            const langError = this.validateString('metadata.language', metadata.language, 2, 5);
            if (langError) errors.push(langError);
        }

        if (metadata.requirements) {
            const reqError = this.validateArray('metadata.requirements', metadata.requirements, 0, 20);
            if (reqError) errors.push(reqError);
        }

        if (metadata.objectives) {
            const objError = this.validateArray('metadata.objectives', metadata.objectives, 1, 20);
            if (objError) errors.push(objError);
        }

        return errors;
    }
}

export class UpdateVideoCourseValidator extends BaseValidator<UpdateVideoCourseDto> {
    validate(data: UpdateVideoCourseDto): ValidationResult {
        const errors: ValidationError[] = [];

        // Title validation (optional)
        if (data.title !== undefined) {
            const titleError = this.validateString('title', data.title,
                VALIDATION_CONSTANTS.LENGTHS.TITLE_MIN,
                VALIDATION_CONSTANTS.LENGTHS.TITLE_MAX);
            if (titleError) errors.push(titleError);
        }

        // Description validation (optional)
        if (data.description !== undefined) {
            const descriptionError = this.validateString('description', data.description,
                VALIDATION_CONSTANTS.LENGTHS.DESCRIPTION_MIN,
                VALIDATION_CONSTANTS.LENGTHS.DESCRIPTION_MAX);
            if (descriptionError) errors.push(descriptionError);
        }

        // Status validation (optional)
        if (data.status !== undefined) {
            const statusError = this.validateEnum('status', data.status, Object.values(BUSINESS_CONSTANTS.COURSE_STATUS));
            if (statusError) errors.push(statusError);
        }

        // Level validation (optional)
        if (data.level !== undefined) {
            const levelError = this.validateEnum('level', data.level, ['beginner', 'intermediate', 'advanced']);
            if (levelError) errors.push(levelError);
        }

        // Price validation (optional)
        if (data.price !== undefined) {
            const priceError = this.validateNumber('price', data.price, 0);
            if (priceError) errors.push(priceError);
        }

        return this.createValidationResult(errors);
    }
}

// Video Lesson validators
export class CreateVideoLessonValidator extends BaseValidator<CreateVideoLessonDto> {
    validate(data: CreateVideoLessonDto): ValidationResult {
        const errors: ValidationError[] = [];

        // Title validation
        const titleError = this.validateRequired('title', data.title) ||
            this.validateString('title', data.title,
                VALIDATION_CONSTANTS.LENGTHS.TITLE_MIN,
                VALIDATION_CONSTANTS.LENGTHS.TITLE_MAX);
        if (titleError) errors.push(titleError);

        // Description validation
        const descriptionError = this.validateRequired('description', data.description) ||
            this.validateString('description', data.description,
                VALIDATION_CONSTANTS.LENGTHS.DESCRIPTION_MIN,
                VALIDATION_CONSTANTS.LENGTHS.DESCRIPTION_MAX);
        if (descriptionError) errors.push(descriptionError);

        // Video URL validation
        const videoUrlError = this.validateRequired('videoUrl', data.videoUrl) ||
            this.validateUrl('videoUrl', data.videoUrl);
        if (videoUrlError) errors.push(videoUrlError);

        // Duration validation
        const durationError = this.validateRequired('duration', data.duration) ||
            this.validateNumber('duration', data.duration, 1, 7200); // max 2 hours
        if (durationError) errors.push(durationError);

        // Order validation
        const orderError = this.validateRequired('order', data.order) ||
            this.validateNumber('order', data.order, 1);
        if (orderError) errors.push(orderError);

        // Course ID validation
        const courseIdError = this.validateRequired('courseId', data.courseId);
        if (courseIdError) errors.push(courseIdError);
        else if (!ValidationUtils.isValidId(data.courseId)) {
            errors.push(this.createError('courseId', 'ID do curso inválido', 'INVALID_ID'));
        }

        // Preview validation
        const previewError = this.validateRequired('isPreview', data.isPreview) ||
            this.validateBoolean('isPreview', data.isPreview);
        if (previewError) errors.push(previewError);

        return this.createValidationResult(errors);
    }
}

// Simulado validators
export class CreateSimuladoValidator extends BaseValidator<CreateSimuladoDto> {
    validate(data: CreateSimuladoDto): ValidationResult {
        const errors: ValidationError[] = [];

        // Title validation
        const titleError = this.validateRequired('title', data.title) ||
            this.validateString('title', data.title,
                VALIDATION_CONSTANTS.LENGTHS.TITLE_MIN,
                VALIDATION_CONSTANTS.LENGTHS.TITLE_MAX);
        if (titleError) errors.push(titleError);

        // Description validation
        const descriptionError = this.validateRequired('description', data.description) ||
            this.validateString('description', data.description,
                VALIDATION_CONSTANTS.LENGTHS.DESCRIPTION_MIN,
                VALIDATION_CONSTANTS.LENGTHS.DESCRIPTION_MAX);
        if (descriptionError) errors.push(descriptionError);

        // Type validation
        const typeError = this.validateRequired('type', data.type) ||
            this.validateEnum('type', data.type, Object.values(BUSINESS_CONSTANTS.SIMULADO_TYPES));
        if (typeError) errors.push(typeError);

        // Category validation
        const categoryError = this.validateRequired('category', data.category) ||
            this.validateString('category', data.category, 2, 50);
        if (categoryError) errors.push(categoryError);

        // Difficulty validation
        const difficultyError = this.validateRequired('difficulty', data.difficulty) ||
            this.validateEnum('difficulty', data.difficulty, ['easy', 'medium', 'hard']);
        if (difficultyError) errors.push(difficultyError);

        // Time limit validation
        const timeLimitError = this.validateRequired('timeLimit', data.timeLimit) ||
            this.validateNumber('timeLimit', data.timeLimit, 1, 480); // max 8 hours
        if (timeLimitError) errors.push(timeLimitError);

        // Passing score validation
        const passingScoreError = this.validateRequired('passingScore', data.passingScore) ||
            this.validateNumber('passingScore', data.passingScore, 0, 100);
        if (passingScoreError) errors.push(passingScoreError);

        // Max attempts validation
        const maxAttemptsError = this.validateRequired('maxAttempts', data.maxAttempts) ||
            this.validateNumber('maxAttempts', data.maxAttempts, 1, 10);
        if (maxAttemptsError) errors.push(maxAttemptsError);

        // Created by validation
        const createdByError = this.validateRequired('createdBy', data.createdBy);
        if (createdByError) errors.push(createdByError);
        else if (!ValidationUtils.isValidId(data.createdBy)) {
            errors.push(this.createError('createdBy', 'ID do criador inválido', 'INVALID_ID'));
        }

        // Public validation
        const publicError = this.validateRequired('isPublic', data.isPublic) ||
            this.validateBoolean('isPublic', data.isPublic);
        if (publicError) errors.push(publicError);

        return this.createValidationResult(errors);
    }
}

// Form validation utilities
export class FormValidator {
    static validateLoginForm(data: { email: string; password: string }): ValidationResult {
        const errors: ValidationError[] = [];
        const validator = new BaseValidator<any>();

        const emailError = validator.validateRequired('email', data.email) ||
            validator.validateEmail('email', data.email);
        if (emailError) errors.push(emailError);

        const passwordError = validator.validateRequired('password', data.password);
        if (passwordError) errors.push(passwordError);

        return { isValid: errors.length === 0, errors };
    }

    static validateSearchForm(data: { query: string }): ValidationResult {
        const errors: ValidationError[] = [];
        const validator = new BaseValidator<any>();

        if (data.query && data.query.length < 2) {
            errors.push(validator.createError('query', 'Busca deve ter pelo menos 2 caracteres', 'MIN_LENGTH'));
        }

        if (data.query && data.query.length > 100) {
            errors.push(validator.createError('query', 'Busca deve ter no máximo 100 caracteres', 'MAX_LENGTH'));
        }

        return { isValid: errors.length === 0, errors };
    }
}

// Export validator instances
export const createUserValidator = new CreateUserValidator();
export const updateUserValidator = new UpdateUserValidator();
export const createVideoCourseValidator = new CreateVideoCourseValidator();
export const updateVideoCourseValidator = new UpdateVideoCourseValidator();
export const createVideoLessonValidator = new CreateVideoLessonValidator();
export const createSimuladoValidator = new CreateSimuladoValidator();