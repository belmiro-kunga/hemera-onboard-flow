// Simple API server to connect frontend to PostgreSQL
const express = require('express');
const cors = require('cors');
const postgres = require('postgres');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'hemera_db',
  username: process.env.DB_USER || 'hemera_user',
  password: process.env.DB_PASSWORD || 'hemera_password',
  ssl: false,
  max: 20,
});

// Test database connection
async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Routes

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await sql`
      SELECT 
        u.id,
        u.id as user_id,
        p.full_name as name,
        u.email,
        p.phone,
        CASE 
          WHEN p.job_position ILIKE '%admin%' OR p.job_position ILIKE '%gerente%' OR p.job_position ILIKE '%diretor%' THEN 'admin'
          ELSE 'funcionario'
        END as role,
        p.department,
        p.job_position,
        p.full_name as manager_name,
        '' as employee_id,
        u.created_at::date::text as start_date,
        COALESCE(u.email_confirmed, true) as is_active,
        u.last_sign_in_at as last_login,
        u.created_at,
        u.updated_at
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.user_id
      ORDER BY p.full_name, u.email
    `;

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get departments
app.get('/api/departments', async (req, res) => {
  try {
    // Static departments data (same as server.js)
    const departments = [
      { id: 'ti', name: 'TI', description: 'Tecnologia da Informação', is_active: true },
      { id: 'rh', name: 'RH', description: 'Recursos Humanos', is_active: true },
      { id: 'financeiro', name: 'Financeiro', description: 'Departamento Financeiro', is_active: true },
      { id: 'administracao', name: 'Administração', description: 'Administração Geral', is_active: true },
      { id: 'vendas', name: 'Vendas', description: 'Departamento de Vendas', is_active: true },
      { id: 'marketing', name: 'Marketing', description: 'Marketing e Comunicação', is_active: true }
    ];

    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      job_position,
      role = 'funcionario'
    } = req.body;
    
    // Generate random password
    const tempPassword = Math.random().toString(36).slice(-8);
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4();
    
    // Start transaction
    await sql.begin(async sql => {
      // Create user in auth.users
      await sql`
        INSERT INTO auth.users (id, email, password_hash, email_confirmed)
        VALUES (${userId}, ${email}, ${hashedPassword}, true)
      `;
      
      // Create profile
      await sql`
        INSERT INTO public.profiles (user_id, full_name, job_position, department, phone)
        VALUES (${userId}, ${name}, ${job_position}, ${department}, ${phone})
      `;
    });
    
    res.json({
      success: true,
      data: {
        id: userId,
        email,
        name,
        tempPassword
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === '23505') { // Unique violation
      res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Update user
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;

    const result = await sql`
      UPDATE profiles 
      SET ${sql(userData, 'name', 'email', 'phone', 'department', 'job_position', 'employee_id', 'role', 'is_active')},
          updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user status
app.patch('/api/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    const result = await sql`
      UPDATE profiles 
      SET is_active = ${is_active}, updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user (soft delete)
app.delete('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await sql`
      UPDATE profiles 
      SET is_active = false, updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create department
app.post('/api/departments', async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await sql`
      INSERT INTO departments (name, description)
      VALUES (${name}, ${description})
      RETURNING *
    `;

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== VIDEO COURSES ENDPOINTS ====================
console.log('🔧 Registering video courses endpoints...');

// Get all video courses
app.get('/api/video-courses', async (req, res) => {
  try {
    console.log('🔄 [VIDEO-COURSES] Fetching video courses from database...');

    const courses = await sql`
      SELECT 
        vc.*,
        COUNT(DISTINCT vl.id) as lesson_count,
        COUNT(DISTINCT ce.id) as enrollment_count
      FROM video_courses vc
      LEFT JOIN video_lessons vl ON vc.id = vl.course_id
      LEFT JOIN course_enrollments ce ON vc.id = ce.course_id
      GROUP BY vc.id
      ORDER BY vc.created_at DESC
    `;

    console.log('✅ [VIDEO-COURSES] Found', courses.length, 'courses');

    const formattedCourses = courses.map(course => ({
      ...course,
      video_lessons: [{ count: parseInt(course.lesson_count) || 0 }],
      course_enrollments: [{ count: parseInt(course.enrollment_count) || 0 }]
    }));

    res.json({ success: true, data: formattedCourses });

  } catch (error) {
    console.error('❌ Error fetching video courses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create video course with lessons
app.post('/api/video-courses', async (req, res) => {
  try {
    const { course, lessons } = req.body;

    await sql.begin(async sql => {
      // Insert course
      const [newCourse] = await sql`
        INSERT INTO video_courses (
          title, description, category, thumbnail_url, duration_minutes, is_active
        ) VALUES (
          ${course.title},
          ${course.description || ''},
          ${course.category || ''},
          ${course.thumbnail_url || ''},
          ${course.duration_minutes || 0},
          ${course.is_active !== false}
        )
        RETURNING *
      `;

      // Insert lessons if provided
      if (lessons && lessons.length > 0) {
        for (const lesson of lessons) {
          await sql`
            INSERT INTO video_lessons (
              course_id, title, description, video_url, video_type, 
              duration_minutes, order_number, is_required, min_watch_time_seconds,
              cloudflare_stream_id, cloudflare_account_id
            ) VALUES (
              ${newCourse.id},
              ${lesson.title},
              ${lesson.description || ''},
              ${lesson.video_url || ''},
              ${lesson.video_type || 'youtube'},
              ${lesson.duration_minutes || 0},
              ${lesson.order_number || 1},
              ${lesson.is_required !== false},
              ${lesson.min_watch_time_seconds || 0},
              ${lesson.cloudflare_stream_id || null},
              ${lesson.cloudflare_account_id || null}
            )
          `;
        }
      }

      res.json({ success: true, data: newCourse });
    });

  } catch (error) {
    console.error('Error creating video course:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update video course
app.put('/api/video-courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { course, lessons } = req.body;

    await sql.begin(async sql => {
      // Update course
      const [updatedCourse] = await sql`
        UPDATE video_courses 
        SET 
          title = ${course.title},
          description = ${course.description || ''},
          category = ${course.category || ''},
          thumbnail_url = ${course.thumbnail_url || ''},
          duration_minutes = ${course.duration_minutes || 0},
          is_active = ${course.is_active !== false},
          updated_at = NOW()
        WHERE id = ${courseId}
        RETURNING *
      `;

      if (!updatedCourse) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }

      // Delete existing lessons
      await sql`DELETE FROM video_lessons WHERE course_id = ${courseId}`;

      // Insert new lessons
      if (lessons && lessons.length > 0) {
        for (const lesson of lessons) {
          await sql`
            INSERT INTO video_lessons (
              course_id, title, description, video_url, video_type, 
              duration_minutes, order_number, is_required, min_watch_time_seconds,
              cloudflare_stream_id, cloudflare_account_id
            ) VALUES (
              ${courseId},
              ${lesson.title},
              ${lesson.description || ''},
              ${lesson.video_url || ''},
              ${lesson.video_type || 'youtube'},
              ${lesson.duration_minutes || 0},
              ${lesson.order_number || 1},
              ${lesson.is_required !== false},
              ${lesson.min_watch_time_seconds || 0},
              ${lesson.cloudflare_stream_id || null},
              ${lesson.cloudflare_account_id || null}
            )
          `;
        }
      }

      res.json({ success: true, data: updatedCourse });
    });

  } catch (error) {
    console.error('Error updating video course:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update course status
app.patch('/api/video-courses/:courseId/status', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { is_active } = req.body;

    const [result] = await sql`
      UPDATE video_courses 
      SET is_active = ${is_active}, updated_at = NOW()
      WHERE id = ${courseId}
      RETURNING *
    `;

    if (!result) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating course status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete video course
app.delete('/api/video-courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    await sql.begin(async sql => {
      // Delete lessons first
      await sql`DELETE FROM video_lessons WHERE course_id = ${courseId}`;

      // Delete enrollments
      await sql`DELETE FROM course_enrollments WHERE course_id = ${courseId}`;

      // Delete course
      const [result] = await sql`
        DELETE FROM video_courses 
        WHERE id = ${courseId}
        RETURNING *
      `;

      if (!result) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }

      res.json({ success: true, message: 'Course deleted successfully' });
    });

  } catch (error) {
    console.error('Error deleting video course:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get lessons for a course
app.get('/api/video-courses/:courseId/lessons', async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await sql`
      SELECT * FROM video_lessons 
      WHERE course_id = ${courseId}
      ORDER BY order_number
    `;

    res.json({ success: true, data: lessons });
  } catch (error) {
    console.error('Error fetching course lessons:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create course enrollment
app.post('/api/video-courses/:courseId/enroll', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { user_ids, due_date } = req.body;

    await sql.begin(async sql => {
      const enrollments = [];

      for (const userId of user_ids) {
        const [enrollment] = await sql`
          INSERT INTO course_enrollments (user_id, course_id, due_date)
          VALUES (${userId}, ${courseId}, ${due_date || null})
          RETURNING *
        `;

        enrollments.push(enrollment);

        // Create lesson progress entries
        const lessons = await sql`
          SELECT id FROM video_lessons 
          WHERE course_id = ${courseId}
          ORDER BY order_number
        `;

        for (const lesson of lessons) {
          await sql`
            INSERT INTO lesson_progress (user_id, lesson_id, enrollment_id)
            VALUES (${userId}, ${lesson.id}, ${enrollment.id})
          `;
        }
      }

      res.json({ success: true, data: enrollments });
    });

  } catch (error) {
    console.error('Error creating course enrollment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SIMULADOS ENDPOINTS ====================

// Get all simulados
app.get('/api/simulados', async (req, res) => {
  try {
    console.log('🔄 [SIMULADOS] Fetching simulados from database...');

    // First, try a simple query to see if the table exists and has data
    const simulados = await sql`
      SELECT * FROM simulados 
      ORDER BY created_at DESC
    `;

    console.log('✅ [SIMULADOS] Found', simulados.length, 'simulados');

    // For each simulado, get counts separately to avoid complex joins
    const formattedSimulados = [];

    for (const simulado of simulados) {
      try {
        // Get question count
        const questionCount = await sql`
          SELECT COUNT(*) as count FROM questoes WHERE simulado_id = ${simulado.id}
        `;

        // Get attempt count
        const attemptCount = await sql`
          SELECT COUNT(*) as count FROM simulado_attempts WHERE simulado_id = ${simulado.id}
        `;

        formattedSimulados.push({
          ...simulado,
          _count: {
            questions: parseInt(questionCount[0].count) || 0,
            attempts: parseInt(attemptCount[0].count) || 0
          }
        });
      } catch (countError) {
        console.warn('Warning getting counts for simulado', simulado.id, ':', countError.message);
        // Add simulado without counts if there's an error
        formattedSimulados.push({
          ...simulado,
          _count: {
            questions: 0,
            attempts: 0
          }
        });
      }
    }

    console.log('✅ Formatted', formattedSimulados.length, 'simulados with counts');
    res.json({ success: true, data: formattedSimulados });

  } catch (error) {
    console.error('❌ Error fetching simulados:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create simulado with questions
app.post('/api/simulados', async (req, res) => {
  try {
    const { simulado, questions } = req.body;

    // Start transaction
    await sql.begin(async sql => {
      // Insert simulado
      const [newSimulado] = await sql`
        INSERT INTO simulados (
          title, description, duration_minutes, total_questions, difficulty, is_active
        ) VALUES (
          ${simulado.title},
          ${simulado.description},
          ${simulado.duration_minutes},
          ${simulado.total_questions},
          ${simulado.difficulty},
          ${simulado.is_active}
        )
        RETURNING *
      `;

      // Insert questions if provided
      if (questions && questions.length > 0) {
        for (const question of questions) {
          const [newQuestion] = await sql`
            INSERT INTO questoes (
              simulado_id, question_text, question_type, explanation, order_number
            ) VALUES (
              ${newSimulado.id},
              ${question.text},
              ${question.type},
              ${question.explanation || ''},
              ${question.order_number}
            )
            RETURNING *
          `;

          // Insert options if it's multiple choice
          if (question.type === 'multiple_choice' && question.options && question.options.length > 0) {
            const optionsData = question.options.map(option => [
              newQuestion.id,
              option.text,
              option.is_correct,
              option.order_number
            ]);

            await sql`
              INSERT INTO opcoes_resposta (questao_id, option_text, is_correct, order_number)
              SELECT * FROM ${sql(optionsData)}
            `;
          }
        }
      }

      res.json({ success: true, data: newSimulado });
    });

  } catch (error) {
    console.error('Error creating simulado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update simulado
app.put('/api/simulados/:simuladoId', async (req, res) => {
  try {
    const { simuladoId } = req.params;
    const { simulado, questions } = req.body;

    await sql.begin(async sql => {
      // Update simulado
      const [updatedSimulado] = await sql`
        UPDATE simulados 
        SET 
          title = ${simulado.title},
          description = ${simulado.description},
          duration_minutes = ${simulado.duration_minutes},
          total_questions = ${simulado.total_questions},
          difficulty = ${simulado.difficulty},
          is_active = ${simulado.is_active},
          updated_at = NOW()
        WHERE id = ${simuladoId}
        RETURNING *
      `;

      if (!updatedSimulado) {
        return res.status(404).json({ success: false, error: 'Simulado not found' });
      }

      // Delete existing questions and options
      await sql`DELETE FROM opcoes_resposta WHERE questao_id IN (SELECT id FROM questoes WHERE simulado_id = ${simuladoId})`;
      await sql`DELETE FROM questoes WHERE simulado_id = ${simuladoId}`;

      // Insert new questions
      if (questions && questions.length > 0) {
        for (const question of questions) {
          const [newQuestion] = await sql`
            INSERT INTO questoes (
              simulado_id, question_text, question_type, explanation, order_number
            ) VALUES (
              ${simuladoId},
              ${question.text},
              ${question.type},
              ${question.explanation || ''},
              ${question.order_number}
            )
            RETURNING *
          `;

          // Insert options if it's multiple choice
          if (question.type === 'multiple_choice' && question.options && question.options.length > 0) {
            const optionsData = question.options.map(option => [
              newQuestion.id,
              option.text,
              option.is_correct,
              option.order_number
            ]);

            await sql`
              INSERT INTO opcoes_resposta (questao_id, option_text, is_correct, order_number)
              SELECT * FROM ${sql(optionsData)}
            `;
          }
        }
      }

      res.json({ success: true, data: updatedSimulado });
    });

  } catch (error) {
    console.error('Error updating simulado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update simulado status
app.patch('/api/simulados/:simuladoId/status', async (req, res) => {
  try {
    const { simuladoId } = req.params;
    const { is_active } = req.body;

    const [result] = await sql`
      UPDATE simulados 
      SET is_active = ${is_active}, updated_at = NOW()
      WHERE id = ${simuladoId}
      RETURNING *
    `;

    if (!result) {
      return res.status(404).json({ success: false, error: 'Simulado not found' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating simulado status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete simulado
app.delete('/api/simulados/:simuladoId', async (req, res) => {
  try {
    const { simuladoId } = req.params;

    await sql.begin(async sql => {
      // Delete options first
      await sql`DELETE FROM opcoes_resposta WHERE questao_id IN (SELECT id FROM questoes WHERE simulado_id = ${simuladoId})`;

      // Delete questions
      await sql`DELETE FROM questoes WHERE simulado_id = ${simuladoId}`;

      // Delete simulado
      const [result] = await sql`
        DELETE FROM simulados 
        WHERE id = ${simuladoId}
        RETURNING *
      `;

      if (!result) {
        return res.status(404).json({ success: false, error: 'Simulado not found' });
      }

      res.json({ success: true, message: 'Simulado deleted successfully' });
    });

  } catch (error) {
    console.error('Error deleting simulado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get questions for a simulado
app.get('/api/simulados/:simuladoId/questions', async (req, res) => {
  try {
    const { simuladoId } = req.params;

    const questions = await sql`
      SELECT 
        q.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', o.id,
              'text', o.option_text,
              'is_correct', o.is_correct,
              'order_number', o.order_number
            ) ORDER BY o.order_number
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'::json
        ) as options
      FROM questoes q
      LEFT JOIN opcoes_resposta o ON q.id = o.questao_id
      WHERE q.simulado_id = ${simuladoId}
      GROUP BY q.id
      ORDER BY q.order_number
    `;

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.question_text,
      type: q.question_type,
      explanation: q.explanation,
      order_number: q.order_number,
      options: q.options || []
    }));

    res.json({ success: true, data: formattedQuestions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);

  // Test database connection on startup
  await testConnection();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await sql.end();
  process.exit(0);
});