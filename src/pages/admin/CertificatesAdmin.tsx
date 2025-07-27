import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Award, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: string;
  user_id: string;
  issued_at: string;
  certificate_url?: string;
  type: 'course' | 'simulado';
  title: string;
  user_name: string;
  score?: number;
}

export default function CertificatesAdmin() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "course" | "simulado">("all");

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["admin-certificates", searchTerm, filterType],
    queryFn: async () => {
      // Fetch course certificates with manual joins
      const { data: courseCerts, error: courseError } = await supabase
        .from("course_certificates")
        .select("id, user_id, issued_at, certificate_url, course_id");

      if (courseError) throw courseError;

      // Get course details
      const courseIds = courseCerts?.map(c => c.course_id) || [];
      const { data: courses } = await supabase
        .from("video_courses")
        .select("id, title")
        .in("id", courseIds);

      // Fetch simulado certificates
      const { data: simuladoCerts, error: simuladoError } = await supabase
        .from("simulado_certificates")
        .select("id, user_id, issued_at, certificate_url, score, simulado_id");

      if (simuladoError) throw simuladoError;

      // Get simulado details
      const simuladoIds = simuladoCerts?.map(c => c.simulado_id) || [];
      const { data: simulados } = await supabase
        .from("simulados")
        .select("id, title")
        .in("id", simuladoIds);

      // Get user profiles
      const allUserIds = [
        ...(courseCerts?.map(c => c.user_id) || []),
        ...(simuladoCerts?.map(c => c.user_id) || [])
      ];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", allUserIds);

      // Transform and combine data
      const courseCertificates: Certificate[] = (courseCerts || []).map(cert => {
        const course = courses?.find(c => c.id === cert.course_id);
        const profile = profiles?.find(p => p.user_id === cert.user_id);
        return {
          id: cert.id,
          user_id: cert.user_id,
          issued_at: cert.issued_at,
          certificate_url: cert.certificate_url,
          type: 'course' as const,
          title: course?.title || 'Curso não encontrado',
          user_name: profile?.name || 'Usuário não encontrado',
        };
      });

      const simuladoCertificates: Certificate[] = (simuladoCerts || []).map(cert => {
        const simulado = simulados?.find(s => s.id === cert.simulado_id);
        const profile = profiles?.find(p => p.user_id === cert.user_id);
        return {
          id: cert.id,
          user_id: cert.user_id,
          issued_at: cert.issued_at,
          certificate_url: cert.certificate_url,
          type: 'simulado' as const,
          title: simulado?.title || 'Simulado não encontrado',
          user_name: profile?.name || 'Usuário não encontrado',
          score: cert.score,
        };
      });

      return [...courseCertificates, ...simuladoCertificates];
    },
  });

  const filteredCertificates = certificates?.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || cert.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const stats = {
    total: certificates?.length || 0,
    courses: certificates?.filter(c => c.type === 'course').length || 0,
    simulados: certificates?.filter(c => c.type === 'simulado').length || 0,
    thisMonth: certificates?.filter(c => 
      new Date(c.issued_at).getMonth() === new Date().getMonth()
    ).length || 0,
  };

  const handleDownload = async (certificate: Certificate) => {
    if (!certificate.certificate_url) {
      toast({
        title: "Erro",
        description: "URL do certificado não encontrada",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(certificate.certificate_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `certificado-${certificate.user_name}-${certificate.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Sucesso",
        description: "Certificado baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao baixar certificado",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestão de Certificados</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.simulados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por usuário ou título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="course">Cursos</SelectItem>
            <SelectItem value="simulado">Simulados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Certificates List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCertificates.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum certificado encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredCertificates.map((certificate) => (
            <Card key={certificate.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{certificate.title}</h3>
                      <Badge variant={certificate.type === 'course' ? 'default' : 'secondary'}>
                        {certificate.type === 'course' ? 'Curso' : 'Simulado'}
                      </Badge>
                      {certificate.score && (
                        <Badge variant="outline">
                          Nota: {certificate.score}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Funcionário: {certificate.user_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Emitido em: {new Date(certificate.issued_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(certificate)}
                      disabled={!certificate.certificate_url}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}