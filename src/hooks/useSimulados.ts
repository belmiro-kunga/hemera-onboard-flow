import { useState, useEffect } from "react";
import { simuladosAPI, type Simulado, type Question } from "@/lib/api/simulados";
import { useCommonHook } from "@/hooks/useCommonHook";

export function useSimulados() {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, invalidateQueries } = useCommonHook();

  const fetchSimulados = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching simulados from API...');
      const simuladosData = await simuladosAPI.getSimulados();
      console.log('✅ Simulados fetched successfully:', simuladosData);
      setSimulados(simuladosData);
    } catch (error: any) {
      console.error('❌ Error fetching simulados:', error);
      showError(error, "Erro ao carregar simulados");
    } finally {
      setLoading(false);
    }
  };

  const createSimulado = async (simuladoData: any, questions: Question[]) => {
    try {
      const result = await simuladosAPI.createSimulado(simuladoData, questions);
      
      if (result.success) {
        showSuccess(`Simulado "${simuladoData.title}" foi criado com sucesso!`);
        invalidateQueries(['simulados']);
        await fetchSimulados();
        return { success: true, data: result };
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      showError(error, "Erro ao criar simulado");
      return { success: false, error: error.message };
    }
  };

  const updateSimulado = async (simuladoId: string, simuladoData: any, questions: Question[]) => {
    try {
      await simuladosAPI.updateSimulado(simuladoId, simuladoData, questions);
      showSuccess(`Simulado "${simuladoData.title}" foi atualizado com sucesso!`);
      invalidateQueries(['simulados']);
      await fetchSimulados();
    } catch (error: any) {
      showError(error, "Erro ao atualizar simulado");
    }
  };

  const toggleSimuladoStatus = async (simulado: Simulado) => {
    try {
      await simuladosAPI.toggleSimuladoStatus(simulado.id, !simulado.is_active);
      showSuccess(`Simulado ${simulado.is_active ? 'desativado' : 'ativado'} com sucesso.`);
      invalidateQueries(['simulados']);
      await fetchSimulados();
    } catch (error: any) {
      showError(error, "Erro ao alterar status do simulado");
    }
  };

  const deleteSimulado = async (simulado: Simulado) => {
    try {
      await simuladosAPI.deleteSimulado(simulado.id);
      showSuccess(`Simulado "${simulado.title}" foi excluído com sucesso.`);
      invalidateQueries(['simulados']);
      await fetchSimulados();
    } catch (error: any) {
      showError(error, "Erro ao excluir simulado");
    }
  };

  const getQuestions = async (simuladoId: string): Promise<Question[]> => {
    try {
      return await simuladosAPI.getQuestions(simuladoId);
    } catch (error: any) {
      showError(error, "Erro ao carregar questões");
      return [];
    }
  };

  useEffect(() => {
    fetchSimulados();
  }, []);

  return {
    simulados,
    loading,
    fetchSimulados,
    createSimulado,
    updateSimulado,
    toggleSimuladoStatus,
    deleteSimulado,
    getQuestions,
  };
}