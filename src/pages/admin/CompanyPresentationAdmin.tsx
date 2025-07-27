import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, BarChart3 } from 'lucide-react';
import CompanyPresentationAdmin from '@/components/admin/CompanyPresentationAdmin';
import OrganizationalChartAdmin from '@/components/admin/OrganizationalChartAdmin';

const CompanyPresentationAdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Apresentação da Empresa
        </h1>
        <p className="text-muted-foreground">
          Configure a apresentação institucional e organograma para novos funcionários
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="presentation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="presentation" className="gap-2">
            <Building2 className="h-4 w-4" />
            Apresentação
          </TabsTrigger>
          <TabsTrigger value="orgchart" className="gap-2">
            <Users className="h-4 w-4" />
            Organograma
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presentation">
          <CompanyPresentationAdmin />
        </TabsContent>

        <TabsContent value="orgchart">
          <OrganizationalChartAdmin />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatórios de Apresentação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Relatórios em desenvolvimento
                </h3>
                <p className="text-muted-foreground">
                  Os relatórios de visualização e engajamento estarão disponíveis em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyPresentationAdminPage;