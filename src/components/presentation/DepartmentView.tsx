import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, User, MapPin } from 'lucide-react';
import { database } from '@/lib/database';

interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  manager_name?: string;
  manager_photo?: string;
  employee_count?: number;
}

const DepartmentView: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      // First get departments
      const { data: deptData, error: deptError } = await database
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name')
        .select_query();

      if (deptError) throw deptError;

      // Then get employee counts and manager info for each department
      const departmentsWithInfo = await Promise.all(
        (deptData || []).map(async (dept) => {
          // Get employee count
          const { data: employeeData } = await database
            .from('profiles')
            .select('*')
            .eq('department', dept.name)
            .eq('is_active', true)
            .select_query();

          const count = employeeData?.length || 0;

          // Get manager info if manager_id exists
          let managerInfo = null;
          if (dept.manager_id) {
            const { data: managerDataResult } = await database
              .from('profiles')
              .select('name, photo_url')
              .eq('user_id', dept.manager_id)
              .select_query();
            
            managerInfo = Array.isArray(managerDataResult) ? managerDataResult[0] : managerDataResult;
          }

          return {
            ...dept,
            employee_count: count,
            manager_name: managerInfo?.name,
            manager_photo: managerInfo?.photo_url
          };
        })
      );

      setDepartments(departmentsWithInfo);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-6 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="flex items-center space-x-2 mt-4">
                  <div className="h-8 w-8 bg-muted rounded-full" />
                  <div className="h-4 bg-muted rounded w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Departamentos não encontrados
          </h3>
          <p className="text-muted-foreground">
            Ainda não há departamentos cadastrados no sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {departments.map((department) => (
        <Card 
          key={department.id} 
          className="transition-all duration-300 hover:shadow-lg hover:scale-105 group"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {department.name}
                  </CardTitle>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {department.employee_count}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Description */}
            {department.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {department.description}
              </p>
            )}

            {/* Manager Info */}
            {department.manager_name && (
              <div className="pt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  RESPONSÁVEL
                </p>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={department.manager_photo} 
                      alt={department.manager_name} 
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {department.manager_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Gerente do Departamento
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Colaboradores</span>
                </div>
                <span className="font-semibold text-foreground">
                  {department.employee_count}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export { DepartmentView };