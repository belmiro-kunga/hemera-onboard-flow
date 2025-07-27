# Design Document

## Overview

O sistema de atribuição de cursos será implementado como uma extensão do sistema existente, adicionando controle granular sobre quais cursos cada funcionário pode acessar. A solução incluirá interfaces administrativas para gerenciamento de atribuições, modificações no sistema de cursos para respeitar as atribuições, e um sistema de notificações para manter funcionários e administradores informados.

## Architecture

### Database Schema Extensions

```sql
-- Tabela para armazenar atribuições de cursos
CREATE TABLE course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP NULL,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
  completed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Tabela para templates de atribuição por cargo
CREATE TABLE assignment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  job_title VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para cursos incluídos nos templates
CREATE TABLE template_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES assignment_templates(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  is_mandatory BOOLEAN DEFAULT true,
  default_due_days INTEGER DEFAULT 30,
  priority VARCHAR(10) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(template_id, course_id)
);

-- Tabela para histórico de notificações
CREATE TABLE assignment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES course_assignments(id),
  notification_type VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT false,
  in_app_read BOOLEAN DEFAULT false
);
```

### Component Architecture

```
CourseAssignmentSystem/
├── admin/
│   ├── CourseAssignmentAdmin.tsx (main admin interface)
│   ├── AssignmentManager.tsx (individual assignments)
│   ├── BulkAssignmentTool.tsx (mass assignments)
│   ├── AssignmentTemplates.tsx (template management)
│   ├── AssignmentReports.tsx (progress tracking)
│   └── components/
│       ├── UserSelector.tsx (user selection interface)
│       ├── CourseSelector.tsx (course selection interface)
│       ├── AssignmentForm.tsx (assignment creation form)
│       ├── ProgressChart.tsx (visual progress tracking)
│       └── NotificationCenter.tsx (notification management)
├── student/
│   ├── AssignedCourses.tsx (student course view)
│   ├── CourseCard.tsx (enhanced course display)
│   └── AssignmentNotifications.tsx (student notifications)
└── shared/
    ├── hooks/
    │   ├── useAssignments.ts (assignment data management)
    │   ├── useAssignmentTemplates.ts (template operations)
    │   └── useAssignmentNotifications.ts (notification handling)
    └── types/
        └── assignment.types.ts (TypeScript interfaces)
```

## Components and Interfaces

### 1. CourseAssignmentAdmin Component
- **Purpose**: Main administrative interface for course assignments
- **Features**:
  - Tabbed interface (Individual Assignments, Bulk Operations, Templates, Reports)
  - Real-time assignment statistics
  - Quick action buttons for common operations
  - Search and filter capabilities

### 2. AssignmentManager Component
- **Purpose**: Individual assignment management
- **Features**:
  - User search with autocomplete
  - Course selection with availability checking
  - Due date picker with calendar integration
  - Priority selection (High/Medium/Low)
  - Assignment history display
  - Progress tracking per user

### 3. BulkAssignmentTool Component
- **Purpose**: Mass assignment operations
- **Features**:
  - Multi-user selection (by department, role, or individual)
  - Course selection for bulk assignment
  - CSV import functionality
  - Batch processing with progress indicator
  - Error handling and rollback capabilities
  - Preview before execution

### 4. AssignmentTemplates Component
- **Purpose**: Template creation and management
- **Features**:
  - Template creation wizard
  - Course selection for templates
  - Department/role association
  - Template activation/deactivation
  - Auto-application to new employees
  - Template usage statistics

### 5. AssignedCourses Component (Student View)
- **Purpose**: Student interface for assigned courses
- **Features**:
  - Filtered course list (only assigned courses)
  - Priority-based sorting
  - Due date indicators
  - Progress tracking
  - Assignment details display
  - Access control enforcement

### 6. AssignmentReports Component
- **Purpose**: Progress tracking and reporting
- **Features**:
  - Completion rate dashboards
  - Overdue assignment alerts
  - Department-wise progress
  - Individual progress tracking
  - Export capabilities (CSV, PDF)
  - Automated report scheduling

## Data Models

### TypeScript Interfaces

```typescript
interface CourseAssignment {
  id: string;
  userId: string;
  courseId: string;
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
  notes?: string;
  user: {
    id: string;
    name: string;
    email: string;
    department?: string;
    jobTitle?: string;
  };
  course: {
    id: string;
    title: string;
    description: string;
    duration?: number;
    difficulty?: string;
  };
}

interface AssignmentTemplate {
  id: string;
  name: string;
  department?: string;
  jobTitle?: string;
  description?: string;
  isActive: boolean;
  courses: TemplateCourse[];
  createdBy: string;
  createdAt: string;
}

interface TemplateCourse {
  id: string;
  courseId: string;
  isMandatory: boolean;
  defaultDueDays: number;
  priority: 'low' | 'medium' | 'high';
  course: {
    id: string;
    title: string;
    description: string;
  };
}

interface AssignmentNotification {
  id: string;
  assignmentId: string;
  type: 'assignment_created' | 'due_soon' | 'overdue' | 'completed' | 'reminder';
  sentAt: string;
  emailSent: boolean;
  inAppRead: boolean;
}
```

### API Endpoints

```typescript
// Assignment Management
POST /api/assignments - Create new assignment
GET /api/assignments - List assignments (with filters)
PUT /api/assignments/:id - Update assignment
DELETE /api/assignments/:id - Remove assignment
POST /api/assignments/bulk - Bulk assignment creation

// Template Management
POST /api/assignment-templates - Create template
GET /api/assignment-templates - List templates
PUT /api/assignment-templates/:id - Update template
DELETE /api/assignment-templates/:id - Delete template
POST /api/assignment-templates/:id/apply - Apply template to users

// Student Interface
GET /api/my-assignments - Get user's assigned courses
PUT /api/assignments/:id/progress - Update assignment progress
POST /api/assignments/:id/complete - Mark assignment as completed

// Reporting
GET /api/assignment-reports/overview - System overview
GET /api/assignment-reports/user/:id - User-specific report
GET /api/assignment-reports/department/:dept - Department report
GET /api/assignment-reports/export - Export reports
```

## Error Handling

### Assignment Validation
- **Duplicate Assignments**: Prevent assigning same course to same user twice
- **Invalid Users/Courses**: Validate existence before assignment
- **Permission Checks**: Ensure admin has rights to assign courses
- **Date Validation**: Ensure due dates are in the future

### Access Control
- **Course Access**: Block access to non-assigned courses
- **Admin Permissions**: Verify admin rights for assignment operations
- **User Context**: Ensure users only see their own assignments
- **Template Permissions**: Control who can create/modify templates

### Data Integrity
- **Cascade Operations**: Handle course/user deletions properly
- **Status Consistency**: Maintain accurate assignment statuses
- **Notification Delivery**: Ensure notifications are sent reliably
- **Progress Tracking**: Maintain accurate completion records

## Testing Strategy

### Unit Tests
- Assignment creation and validation
- Template operations
- Notification system
- Access control logic
- Data transformation utilities

### Integration Tests
- Database operations
- API endpoint functionality
- Email notification delivery
- File import/export operations
- Template application workflows

### E2E Tests
- Complete assignment workflow
- Bulk assignment operations
- Student course access
- Report generation
- Template management

### Performance Tests
- Large-scale assignment operations
- Report generation with large datasets
- Notification system under load
- Database query optimization

## Security Considerations

### Access Control
- Role-based permissions for admin functions
- User isolation (users only see their assignments)
- Template access control
- API endpoint protection

### Data Protection
- Input sanitization for all forms
- SQL injection prevention
- File upload security (CSV imports)
- Audit logging for all operations

### Privacy
- Personal data handling compliance
- Assignment data confidentiality
- Notification content security
- Report data access control

## Performance Optimizations

### Database Optimization
- Proper indexing on assignment queries
- Efficient joins for user/course data
- Pagination for large datasets
- Query optimization for reports

### UI Performance
- Lazy loading for large assignment lists
- Virtual scrolling for bulk operations
- Debounced search inputs
- Optimized re-renders

### Notification System
- Batch notification processing
- Queue management for email delivery
- Efficient notification status tracking
- Background job processing