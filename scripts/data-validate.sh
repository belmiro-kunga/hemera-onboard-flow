#!/bin/bash

# Data validation script for Hemera project
# This script validates data integrity after migration

set -e

echo "🔍 Validating data integrity..."

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if PostgreSQL container is running
check_postgres() {
    if ! docker compose ps postgres | grep -q "running"; then
        echo "❌ PostgreSQL container is not running."
        echo "💡 Start it with: npm run db:start"
        exit 1
    fi
}

# Function to run SQL query and return result
run_query() {
    local query="$1"
    docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "$query" 2>/dev/null | sed 's/^ *//'
}

# Function to validate table existence
validate_tables() {
    echo "📋 Validating table existence..."
    
    local expected_tables=(
        "profiles"
        "video_courses"
        "video_lessons"
        "course_enrollments"
        "lesson_progress"
        "course_assignments"
        "assignment_templates"
        "template_courses"
        "simulados"
        "questoes"
        "opcoes_resposta"
        "simulado_attempts"
        "simulado_answers"
        "user_levels"
        "badges"
        "user_badges"
        "user_points"
        "course_certificates"
        "simulado_certificates"
        "departments"
        "organizational_chart"
        "company_presentation"
        "site_settings"
        "email_templates"
        "email_queue"
        "email_logs"
        "assignment_notifications"
        "presentation_views"
    )
    
    local missing_tables=0
    
    for table in "${expected_tables[@]}"; do
        local exists=$(run_query "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');")
        
        if [ "$exists" = "t" ]; then
            local count=$(run_query "SELECT COUNT(*) FROM $table;")
            echo "✅ $table: $count records"
        else
            echo "❌ $table: MISSING"
            missing_tables=$((missing_tables + 1))
        fi
    done
    
    if [ $missing_tables -eq 0 ]; then
        echo "✅ All expected tables exist"
        return 0
    else
        echo "❌ $missing_tables tables are missing"
        return 1
    fi
}

# Function to validate foreign key relationships
validate_relationships() {
    echo ""
    echo "🔗 Validating foreign key relationships..."
    
    # Check profiles -> auth.users relationship
    local orphaned_profiles=$(run_query "
        SELECT COUNT(*) FROM profiles p 
        LEFT JOIN auth.users u ON p.user_id = u.id 
        WHERE u.id IS NULL;
    ")
    
    if [ "$orphaned_profiles" = "0" ]; then
        echo "✅ Profiles -> Users: No orphaned records"
    else
        echo "⚠️  Profiles -> Users: $orphaned_profiles orphaned profiles"
    fi
    
    # Check course_enrollments -> profiles relationship
    local orphaned_enrollments=$(run_query "
        SELECT COUNT(*) FROM course_enrollments ce 
        LEFT JOIN profiles p ON ce.user_id = p.user_id 
        WHERE p.user_id IS NULL;
    ")
    
    if [ "$orphaned_enrollments" = "0" ]; then
        echo "✅ Enrollments -> Profiles: No orphaned records"
    else
        echo "⚠️  Enrollments -> Profiles: $orphaned_enrollments orphaned enrollments"
    fi
    
    # Check course_enrollments -> video_courses relationship
    local orphaned_course_enrollments=$(run_query "
        SELECT COUNT(*) FROM course_enrollments ce 
        LEFT JOIN video_courses vc ON ce.course_id = vc.id 
        WHERE vc.id IS NULL;
    ")
    
    if [ "$orphaned_course_enrollments" = "0" ]; then
        echo "✅ Enrollments -> Courses: No orphaned records"
    else
        echo "⚠️  Enrollments -> Courses: $orphaned_course_enrollments orphaned enrollments"
    fi
    
    # Check course_assignments -> profiles relationship
    local orphaned_assignments=$(run_query "
        SELECT COUNT(*) FROM course_assignments ca 
        LEFT JOIN profiles p ON ca.user_id = p.user_id 
        WHERE p.user_id IS NULL;
    ")
    
    if [ "$orphaned_assignments" = "0" ]; then
        echo "✅ Assignments -> Profiles: No orphaned records"
    else
        echo "⚠️  Assignments -> Profiles: $orphaned_assignments orphaned assignments"
    fi
}

# Function to validate data consistency
validate_consistency() {
    echo ""
    echo "🔍 Validating data consistency..."
    
    # Check for duplicate emails in profiles
    local duplicate_emails=$(run_query "
        SELECT COUNT(*) FROM (
            SELECT email FROM profiles 
            WHERE email IS NOT NULL 
            GROUP BY email 
            HAVING COUNT(*) > 1
        ) duplicates;
    ")
    
    if [ "$duplicate_emails" = "0" ]; then
        echo "✅ Profile emails: No duplicates"
    else
        echo "⚠️  Profile emails: $duplicate_emails duplicate emails found"
    fi
    
    # Check for courses without lessons
    local courses_without_lessons=$(run_query "
        SELECT COUNT(*) FROM video_courses vc 
        LEFT JOIN video_lessons vl ON vc.id = vl.course_id 
        WHERE vl.course_id IS NULL AND vc.is_active = true;
    ")
    
    if [ "$courses_without_lessons" = "0" ]; then
        echo "✅ Active courses: All have lessons"
    else
        echo "⚠️  Active courses: $courses_without_lessons courses without lessons"
    fi
    
    # Check for simulados without questions
    local simulados_without_questions=$(run_query "
        SELECT COUNT(*) FROM simulados s 
        LEFT JOIN questoes q ON s.id = q.simulado_id 
        WHERE q.simulado_id IS NULL AND s.is_active = true;
    ")
    
    if [ "$simulados_without_questions" = "0" ]; then
        echo "✅ Active simulados: All have questions"
    else
        echo "⚠️  Active simulados: $simulados_without_questions simulados without questions"
    fi
}

# Function to validate user data
validate_users() {
    echo ""
    echo "👥 Validating user data..."
    
    # Check for users without profiles
    local users_without_profiles=$(run_query "
        SELECT COUNT(*) FROM auth.users u 
        LEFT JOIN profiles p ON u.id = p.user_id 
        WHERE p.user_id IS NULL;
    ")
    
    if [ "$users_without_profiles" = "0" ]; then
        echo "✅ Users: All have profiles"
    else
        echo "⚠️  Users: $users_without_profiles users without profiles"
    fi
    
    # Check for active users
    local active_users=$(run_query "SELECT COUNT(*) FROM profiles WHERE is_active = true;")
    local total_users=$(run_query "SELECT COUNT(*) FROM profiles;")
    
    echo "📊 Users: $active_users active / $total_users total"
    
    # Check admin users
    local admin_users=$(run_query "SELECT COUNT(*) FROM profiles WHERE role IN ('admin', 'super_admin');")
    echo "👑 Admin users: $admin_users"
}

# Function to validate course data
validate_courses() {
    echo ""
    echo "📚 Validating course data..."
    
    # Check active courses
    local active_courses=$(run_query "SELECT COUNT(*) FROM video_courses WHERE is_active = true;")
    local total_courses=$(run_query "SELECT COUNT(*) FROM video_courses;")
    
    echo "📊 Courses: $active_courses active / $total_courses total"
    
    # Check total lessons
    local total_lessons=$(run_query "SELECT COUNT(*) FROM video_lessons;")
    echo "📝 Total lessons: $total_lessons"
    
    # Check enrollments
    local total_enrollments=$(run_query "SELECT COUNT(*) FROM course_enrollments;")
    echo "🎓 Total enrollments: $total_enrollments"
    
    # Check assignments
    local total_assignments=$(run_query "SELECT COUNT(*) FROM course_assignments;")
    local pending_assignments=$(run_query "SELECT COUNT(*) FROM course_assignments WHERE status = 'assigned';")
    
    echo "📋 Assignments: $pending_assignments pending / $total_assignments total"
}

# Function to validate gamification data
validate_gamification() {
    echo ""
    echo "🎮 Validating gamification data..."
    
    # Check user levels
    local users_with_levels=$(run_query "SELECT COUNT(*) FROM user_levels;")
    echo "📊 Users with levels: $users_with_levels"
    
    # Check badges
    local total_badges=$(run_query "SELECT COUNT(*) FROM badges WHERE is_active = true;")
    local earned_badges=$(run_query "SELECT COUNT(*) FROM user_badges;")
    
    echo "🏆 Badges: $earned_badges earned / $total_badges available"
    
    # Check points
    local total_points=$(run_query "SELECT COALESCE(SUM(points), 0) FROM user_points;")
    echo "⭐ Total points awarded: $total_points"
}

# Function to validate system settings
validate_settings() {
    echo ""
    echo "⚙️  Validating system settings..."
    
    # Check site settings
    local site_settings=$(run_query "SELECT COUNT(*) FROM site_settings;")
    echo "🔧 Site settings: $site_settings"
    
    # Check email templates
    local email_templates=$(run_query "SELECT COUNT(*) FROM email_templates;")
    echo "📧 Email templates: $email_templates"
    
    # Check organizational chart
    local org_positions=$(run_query "SELECT COUNT(*) FROM organizational_chart WHERE is_active = true;")
    echo "🏢 Active org positions: $org_positions"
}

# Function to generate validation report
generate_report() {
    echo ""
    echo "📊 Generating validation report..."
    
    local report_file="data-validation-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Hemera Data Validation Report"
        echo "============================="
        echo "Generated: $(date)"
        echo ""
        
        echo "Database Summary:"
        echo "----------------"
        run_query "
            SELECT 
                schemaname,
                tablename,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes
            FROM pg_stat_user_tables 
            ORDER BY schemaname, tablename;
        "
        
        echo ""
        echo "Table Sizes:"
        echo "------------"
        run_query "
            SELECT 
                tablename,
                pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY pg_total_relation_size(tablename::regclass) DESC;
        "
        
    } > "$report_file"
    
    echo "📄 Report saved: $report_file"
}

# Main execution
echo "🔍 Data Validation Suite"
echo "========================"
echo ""

check_docker
check_postgres

echo ""

# Run all validations
validation_errors=0

if ! validate_tables; then
    validation_errors=$((validation_errors + 1))
fi

validate_relationships
validate_consistency
validate_users
validate_courses
validate_gamification
validate_settings

generate_report

echo ""
echo "📊 Validation Summary"
echo "===================="

if [ $validation_errors -eq 0 ]; then
    echo "✅ All critical validations passed!"
    echo "🎉 Data integrity looks good!"
    exit 0
else
    echo "⚠️  Found $validation_errors critical issues"
    echo "💡 Review the output above and fix any issues"
    exit 1
fi