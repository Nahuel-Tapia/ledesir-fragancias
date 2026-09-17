/**
 * Clean Architecture - Domain Exceptions
 */

export class DomainError extends Error {
  constructor(message: string, public readonly code: string = 'DOMAIN_ERROR') {
    super(message);
    this.name = 'DomainError';
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} con ID "${id}" no fue encontrado.`, 'ENTITY_NOT_FOUND');
    this.name = 'EntityNotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class RepositoryError extends DomainError {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message, 'REPOSITORY_ERROR');
    this.name = 'RepositoryError';
  }
}
