// Services module exports

export * from './video-courses.service';
export * from './simulados.service';
export * from './user.service';
export * from './course-assignment.service';
export * from './notification.service';
export * from './toast.service';

// Re-export commonly used services
export { VideoCoursesService } from './video-courses.service';
export { SimuladosService } from './simulados.service';
export { UserService } from './user.service';
export { CourseAssignmentService } from './course-assignment.service';
export { NotificationService } from './notification.service';
export { ToastService, toastService, toast } from './toast.service';

// Re-export service configs
export type { VideoCoursesServiceConfig } from './video-courses.service';
export type { SimuladosServiceConfig } from './simulados.service';
export type { UserServiceConfig } from './user.service';
export type { CourseAssignmentServiceConfig } from './course-assignment.service';
export type { NotificationServiceConfig } from './notification.service';
export type { ToastServiceConfig } from './toast.service';