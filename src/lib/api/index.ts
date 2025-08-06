// API clients module exports

export * from './video-courses.client';
export * from './simulados.client';

// Re-export commonly used clients
export { VideoCoursesApiClient, videoCoursesApiClient } from './video-courses.client';
export { SimuladosApiClient, simuladosApiClient } from './simulados.client';