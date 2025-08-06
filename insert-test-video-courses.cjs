// Insert test video courses directly into database
const postgres = require('postgres');

const sql = postgres({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'hemera_db',
    username: process.env.DB_USER || 'hemera_user',
    password: process.env.DB_PASSWORD || 'hemera_password',
    ssl: false,
    max: 20,
});

async function insertTestVideoCourses() {
    try {
        console.log('🔄 Inserting test video courses...');

        // Insert first course
        const [course1] = await sql`
      INSERT INTO video_courses (
        title, description, category, thumbnail_url, duration_minutes, is_active
      ) VALUES (
        'Introdução à Empresa',
        'Curso introdutório sobre a cultura e valores da empresa',
        'Cultura',
        '/placeholder.svg',
        120,
        true
      )
      RETURNING *
    `;

        console.log('✅ Created course 1:', course1.title);

        // Insert lessons for course 1
        const lessons1 = [
            {
                title: 'Boas-vindas do CEO',
                description: 'Mensagem de boas-vindas do CEO da empresa',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 15,
                order_number: 1,
                is_required: true,
                min_watch_time_seconds: 600
            },
            {
                title: 'História da Empresa',
                description: 'Conheça a história e evolução da nossa empresa',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 20,
                order_number: 2,
                is_required: true,
                min_watch_time_seconds: 900
            },
            {
                title: 'Valores e Cultura',
                description: 'Nossos valores fundamentais e cultura organizacional',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 25,
                order_number: 3,
                is_required: true,
                min_watch_time_seconds: 1200
            }
        ];

        for (const lesson of lessons1) {
            await sql`
        INSERT INTO video_lessons (
          course_id, title, description, video_url, video_type, 
          duration_minutes, order_number, is_required, min_watch_time_seconds
        ) VALUES (
          ${course1.id}, ${lesson.title}, ${lesson.description}, ${lesson.video_url}, 
          ${lesson.video_type}, ${lesson.duration_minutes}, ${lesson.order_number}, 
          ${lesson.is_required}, ${lesson.min_watch_time_seconds}
        )
      `;
        }

        // Insert second course
        const [course2] = await sql`
      INSERT INTO video_courses (
        title, description, category, thumbnail_url, duration_minutes, is_active
      ) VALUES (
        'Compliance e Ética',
        'Diretrizes de compliance e código de ética empresarial',
        'Compliance',
        '/placeholder.svg',
        90,
        true
      )
      RETURNING *
    `;

        console.log('✅ Created course 2:', course2.title);

        // Insert lessons for course 2
        const lessons2 = [
            {
                title: 'Código de Ética',
                description: 'Princípios éticos que guiam nossa empresa',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 30,
                order_number: 1,
                is_required: true,
                min_watch_time_seconds: 1500
            },
            {
                title: 'Políticas de Compliance',
                description: 'Políticas e procedimentos de compliance',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 35,
                order_number: 2,
                is_required: true,
                min_watch_time_seconds: 1800
            },
            {
                title: 'Prevenção à Corrupção',
                description: 'Como identificar e prevenir práticas corruptas',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 25,
                order_number: 3,
                is_required: true,
                min_watch_time_seconds: 1200
            }
        ];

        for (const lesson of lessons2) {
            await sql`
        INSERT INTO video_lessons (
          course_id, title, description, video_url, video_type, 
          duration_minutes, order_number, is_required, min_watch_time_seconds
        ) VALUES (
          ${course2.id}, ${lesson.title}, ${lesson.description}, ${lesson.video_url}, 
          ${lesson.video_type}, ${lesson.duration_minutes}, ${lesson.order_number}, 
          ${lesson.is_required}, ${lesson.min_watch_time_seconds}
        )
      `;
        }

        // Insert third course
        const [course3] = await sql`
      INSERT INTO video_courses (
        title, description, category, thumbnail_url, duration_minutes, is_active
      ) VALUES (
        'Processos Internos',
        'Visão geral dos principais processos da empresa',
        'Processos',
        '/placeholder.svg',
        150,
        true
      )
      RETURNING *
    `;

        console.log('✅ Created course 3:', course3.title);

        // Insert lessons for course 3
        const lessons3 = [
            {
                title: 'Fluxo de Trabalho',
                description: 'Como funcionam nossos processos de trabalho',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 40,
                order_number: 1,
                is_required: true,
                min_watch_time_seconds: 2000
            },
            {
                title: 'Sistemas Internos',
                description: 'Apresentação dos sistemas utilizados na empresa',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 45,
                order_number: 2,
                is_required: true,
                min_watch_time_seconds: 2200
            },
            {
                title: 'Procedimentos de Qualidade',
                description: 'Padrões de qualidade e procedimentos',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 35,
                order_number: 3,
                is_required: false,
                min_watch_time_seconds: 1500
            }
        ];

        for (const lesson of lessons3) {
            await sql`
        INSERT INTO video_lessons (
          course_id, title, description, video_url, video_type, 
          duration_minutes, order_number, is_required, min_watch_time_seconds
        ) VALUES (
          ${course3.id}, ${lesson.title}, ${lesson.description}, ${lesson.video_url}, 
          ${lesson.video_type}, ${lesson.duration_minutes}, ${lesson.order_number}, 
          ${lesson.is_required}, ${lesson.min_watch_time_seconds}
        )
      `;
        }

        // Insert fourth course (inactive)
        const [course4] = await sql`
      INSERT INTO video_courses (
        title, description, category, thumbnail_url, duration_minutes, is_active
      ) VALUES (
        'Desenvolvimento Técnico',
        'Curso técnico para desenvolvedores e equipe de TI',
        'Técnico',
        '/placeholder.svg',
        240,
        false
      )
      RETURNING *
    `;

        console.log('✅ Created course 4:', course4.title);

        // Insert lessons for course 4
        const lessons4 = [
            {
                title: 'Fundamentos de Programação',
                description: 'Conceitos básicos de programação',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 60,
                order_number: 1,
                is_required: true,
                min_watch_time_seconds: 3000
            },
            {
                title: 'Arquitetura de Software',
                description: 'Princípios de arquitetura de software',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 90,
                order_number: 2,
                is_required: true,
                min_watch_time_seconds: 4500
            },
            {
                title: 'Boas Práticas de Desenvolvimento',
                description: 'Metodologias e boas práticas',
                video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                video_type: 'youtube',
                duration_minutes: 90,
                order_number: 3,
                is_required: true,
                min_watch_time_seconds: 4500
            }
        ];

        for (const lesson of lessons4) {
            await sql`
        INSERT INTO video_lessons (
          course_id, title, description, video_url, video_type, 
          duration_minutes, order_number, is_required, min_watch_time_seconds
        ) VALUES (
          ${course4.id}, ${lesson.title}, ${lesson.description}, ${lesson.video_url}, 
          ${lesson.video_type}, ${lesson.duration_minutes}, ${lesson.order_number}, 
          ${lesson.is_required}, ${lesson.min_watch_time_seconds}
        )
      `;
        }

        // Verify insertion
        const allCourses = await sql`
      SELECT 
        vc.*,
        COUNT(vl.id) as lesson_count
      FROM video_courses vc
      LEFT JOIN video_lessons vl ON vc.id = vl.course_id
      GROUP BY vc.id
      ORDER BY vc.created_at DESC
    `;

        console.log('\n📚 All video courses in database:');
        allCourses.forEach((c, i) => {
            console.log(`${i + 1}. ${c.title} (${c.category}) - ${c.is_active ? 'Active' : 'Inactive'} - ${c.lesson_count} lessons - ${c.duration_minutes}min`);
        });

        console.log('\n✅ Test video courses inserted successfully!');

    } catch (error) {
        console.error('❌ Error inserting test video courses:', error);
    } finally {
        await sql.end();
    }
}

insertTestVideoCourses();