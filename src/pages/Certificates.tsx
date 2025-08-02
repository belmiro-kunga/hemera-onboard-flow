import { useQuery } from "@tanstack/react-query";
import { database } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Award, FileText, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: string;
  issued_at: string;
  certificate_url?: string;
  type: 'course' | 'simulado';
  title: string;
  score?: number;
}

export default function Certificates() {
  const { toast } = useToast();

  const { user } = useAuth();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      // Fetch course certificates
      const { data: courseCerts, error: courseError } = await database
        .from("course_certificates")
        .select("id, issued_at, certificate_url, course_id")
        .eq("user_id", user.id)
        .select_query();

      if (courseError) throw courseError;

      // Get course details
      const courseIds = courseCerts?.map(c => c.course_id) || [];
      const { data: courses } = await database
        .from("video_courses")
        .select("id, title")
        .in("id", courseIds)
        .select_query();

      // Fetch simulado certificates
      const { data: simuladoCerts, error: simuladoError } = await database
        .from("simulado_certificates")
        .select("id, issued_at, certificate_url, score, simulado_id")
        .eq("user_id", user.id)
        .select_query();

      if (simuladoError) throw simuladoError;

      // Get simulado details
      const simuladoIds = simuladoCerts?.map(c => c.simulado_id) || [];
      const { data: simulados } = await database
        .from("simulados")
        .select("id, title")
        .in("id", simuladoIds)
        .select_query();

      // Transform and combine data
      const courseCertificates: Certificate[] = (courseCerts || []).map(cert => {
        const course = courses?.find(c => c.id === cert.course_id);
        return {
          id: cert.id,
          issued_at: cert.issued_at,
          certificate_url: cert.certificate_url,
          type: 'course' as const,
          title: course?.title || 'Curso não encontrado',
        };
      });

      const simuladoCertificates: Certificate[] = (simuladoCerts || []).map(cert => {
        const simulado = simulados?.find(s => s.id === cert.simulado_id);
        return {
          id: cert.id,
          issued_at: cert.issued_at,
          certificate_url: cert.certificate_url,
          type: 'simulado' as const,
          title: simulado?.title || 'Simulado não encontrado',
          score: cert.score,
        };
      });

      return [...courseCertificates, ...simuladoCertificates].sort(
        (a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
      );
    },
  });

  const handleDownload = async (certificate: Certificate) => {
    if (!certificate.certificate_url) {
      toast({
        title: "Erro",
        description: "Certificado ainda não foi gerado",
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
      a.download = `certificado-${certificate.title.replace(/\s+/g, '-')}.pdf`;
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

  const courseCertificates = certificates?.filter(c => c.type === 'course') || [];
  const simuladoCertificates = certificates?.filter(c => c.type === 'simulado') || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Award className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Meus Certificados</h1>
      </div>

      {certificates?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum certificado ainda</h3>
            <p className="text-muted-foreground">
              Complete cursos e simulados para ganhar seus primeiros certificados!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Course Certificates */}
          {courseCertificates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Certificados de Cursos</h2>
                <Badge variant="outline">{courseCertificates.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseCertificates.map((certificate) => (
                  <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{certificate.title}</CardTitle>
                          <Badge className="mt-2">Curso</Badge>
                        </div>
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Emitido em: {new Date(certificate.issued_at).toLocaleDateString('pt-AO')}
                        </p>
                        <Button
                          onClick={() => handleDownload(certificate)}
                          disabled={!certificate.certificate_url}
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {certificate.certificate_url ? 'Download' : 'Processando...'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Simulado Certificates */}
          {simuladoCertificates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Certificados de Simulados</h2>
                <Badge variant="outline">{simuladoCertificates.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {simuladoCertificates.map((certificate) => (
                  <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{certificate.title}</CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">Simulado</Badge>
                            {certificate.score && (
                              <Badge variant="outline">
                                Nota: {certificate.score}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Trophy className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Emitido em: {new Date(certificate.issued_at).toLocaleDateString('pt-AO')}
                        </p>
                        <Button
                          onClick={() => handleDownload(certificate)}
                          disabled={!certificate.certificate_url}
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {certificate.certificate_url ? 'Download' : 'Processando...'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}