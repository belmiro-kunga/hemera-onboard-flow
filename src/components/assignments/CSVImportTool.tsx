import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  X,
  Eye,
  FileSpreadsheet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCSVImport, validateCSVFormat, parseCSVToData } from "@/hooks/useCSVImport";
import { csvImportSchema } from "@/lib/validations/assignment.schemas";
import type { CSVImportData, CSVImportResult } from "@/types/assignment.types";

interface CSVImportToolProps {
  onImportComplete?: (result: CSVImportResult) => void;
}

export default function CSVImportTool({ onImportComplete }: CSVImportToolProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVImportData[]>([]);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { importAssignments, isImporting } = useCSVImport();

  const form = useForm({
    resolver: zodResolver(csvImportSchema),
    defaultValues: {
      validateOnly: false,
    },
  });

  // CSV template for download
  const csvTemplate = `userEmail,courseTitle,dueDate,priority,notes
funcionario1@empresa.com,Curso de Segurança,2024-12-31,high,Obrigatório para todos
funcionario2@empresa.com,Treinamento de Vendas,2024-11-30,medium,Recomendado para equipe comercial
funcionario3@empresa.com,Curso de Liderança,,low,Desenvolvimento pessoal`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_atribuicoes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    parseCSVFile(file);
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      // Validate CSV format
      const validation = validateCSVFormat(text);
      if (!validation.isValid) {
        toast({
          title: "Erro no formato",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      try {
        // Parse CSV data
        const data = parseCSVToData(text);
        
        setCsvData(data);
        setPreviewMode(true);
        
        toast({
          title: "Arquivo carregado",
          description: `${data.length} linhas encontradas no arquivo CSV.`,
        });
      } catch (error) {
        toast({
          title: "Erro ao processar arquivo",
          description: "Não foi possível processar o arquivo CSV. Verifique o formato.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };



  const handleImport = async (validateOnly = false) => {
    if (csvData.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum dado para importar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      importAssignments(
        { data: csvData, validateOnly },
        {
          onSuccess: (result) => {
            setImportResult(result);
            onImportComplete?.(result);
            setIsProcessing(false);
          },
          onError: () => {
            setIsProcessing(false);
          }
        }
      );
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro durante a importação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const resetImport = () => {
    setCsvFile(null);
    setCsvData([]);
    setImportResult(null);
    setPreviewMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Template CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use este template para preparar seu arquivo CSV com as atribuições.
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Colunas obrigatórias:</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>userEmail:</strong> Email do funcionário</li>
                  <li><strong>courseTitle:</strong> Título do curso</li>
                  <li><strong>dueDate:</strong> Data de vencimento (opcional, formato: YYYY-MM-DD)</li>
                  <li><strong>priority:</strong> Prioridade (low, medium, high - opcional)</li>
                  <li><strong>notes:</strong> Observações (opcional)</li>
                </ul>
              </div>

              <Button onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Baixar Template CSV
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          {!previewMode ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload do Arquivo CSV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Selecione um arquivo CSV</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça upload do arquivo com as atribuições em massa
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Certifique-se de que o arquivo CSV segue o formato do template disponível na aba "Template".
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* File Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Arquivo Carregado
                    </div>
                    <Button variant="outline" size="sm" onClick={resetImport}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{csvFile?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {csvData.length} linha(s) de dados
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {(csvFile?.size || 0) < 1024 
                        ? `${csvFile?.size} bytes`
                        : `${Math.round((csvFile?.size || 0) / 1024)} KB`
                      }
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Prévia dos Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Curso</th>
                          <th className="text-left p-2">Vencimento</th>
                          <th className="text-left p-2">Prioridade</th>
                          <th className="text-left p-2">Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 5).map((row, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{row.userEmail}</td>
                            <td className="p-2">{row.courseTitle}</td>
                            <td className="p-2">{row.dueDate || '-'}</td>
                            <td className="p-2">
                              <Badge variant="outline" className="text-xs">
                                {row.priority || 'medium'}
                              </Badge>
                            </td>
                            <td className="p-2">{row.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvData.length > 5 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ... e mais {csvData.length - 5} linha(s)
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleImport(true)}
                      disabled={isProcessing || isImporting}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Validar Dados
                    </Button>
                    <Button
                      onClick={() => handleImport(false)}
                      disabled={isProcessing || isImporting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isProcessing || isImporting ? "Importando..." : "Importar Atribuições"}
                    </Button>
                  </div>

                  {(isProcessing || isImporting) && (
                    <div className="space-y-2">
                      <Progress value={50} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        Processando atribuições...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {importResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {importResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      Resultado da {importResult.success ? 'Importação' : 'Validação'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{importResult.totalRows}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">{importResult.successCount}</p>
                        <p className="text-sm text-muted-foreground">Sucesso</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-500">{importResult.errorCount}</p>
                        <p className="text-sm text-muted-foreground">Erros</p>
                      </div>
                    </div>

                    {importResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-500">Erros encontrados:</h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {importResult.errors.map((error, index) => (
                            <Alert key={index} variant="destructive">
                              <AlertDescription>
                                <strong>Linha {error.row}:</strong> {error.error}
                                <br />
                                <span className="text-xs">
                                  Email: {error.data.userEmail} | Curso: {error.data.courseTitle}
                                </span>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {importResult.success && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Todas as atribuições foram criadas com sucesso!
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}