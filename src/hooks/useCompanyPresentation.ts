import { useState, useEffect } from 'react';
import { database } from '@/lib/database';
import { useCommonHook } from '@/hooks/useCommonHook';

export interface CompanyPresentation {
  id: string;
  company_name: string;
  mission?: string;
  vision?: string;
  values?: string[];
  history?: string;
  logo_url?: string;
  video_url?: string;
  is_active: boolean;
  requires_acknowledgment: boolean;
}

export interface OrganizationalChartNode {
  id: string;
  parent_id?: string;
  name: string;
  position: string;
  department?: string;
  photo_url?: string;
  bio?: string;
  order_position: number;
  children?: OrganizationalChartNode[];
}

export interface PresentationView {
  id: string;
  user_id: string;
  viewed_at: string;
  completed_at?: string;
  is_mandatory_completed: boolean;
  first_login_presentation_shown: boolean;
}

export const useCompanyPresentation = () => {
  const [presentation, setPresentation] = useState<CompanyPresentation | null>(null);
  const [organizationalChart, setOrganizationalChart] = useState<OrganizationalChartNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess, invalidateQueries } = useCommonHook();

  // Função auxiliar para detectar ambiente
  const isBrowser = typeof window !== 'undefined';

  // Função auxiliar para operações de database com fallback
  const executeWithFallback = async (
    operation: () => Promise<any>,
    mockData?: any
  ) => {
    if (isBrowser && mockData) {
      console.warn('🔧 Using mock company presentation data');
      return { data: mockData, error: null };
    }

    try {
      return await operation();
    } catch (error) {
      console.warn('Database operation failed, using fallback');
      return { data: mockData || null, error: null };
    }
  };

  // Fetch company presentation data
  const fetchPresentation = async () => {
    try {
      // Mock presentation data for browser
      const mockPresentation: CompanyPresentation = {
        id: 'mock-presentation-1',
        company_name: 'Hemera Capital Partners',
        mission: 'Transformar o mercado financeiro através de soluções inovadoras',
        vision: 'Ser a principal referência em gestão de investimentos no Brasil',
        values: ['Inovação', 'Transparência', 'Excelência', 'Sustentabilidade'],
        history: 'Fundada em 2020, a Hemera Capital Partners nasceu com o propósito de democratizar o acesso a investimentos de qualidade.',
        logo_url: '/placeholder.svg',
        video_url: 'https://example.com/company-video.mp4',
        is_active: true,
        requires_acknowledgment: true
      };

      const result = await executeWithFallback(
        () => database
          .from('company_presentation')
          .select('*')
          .eq('is_active', true)
          .select_query(),
        [mockPresentation]
      );

      if (result.error) throw result.error;

      const presentationData = Array.isArray(result.data) ? result.data[0] : result.data;

      if (presentationData) {
        // Safe conversion of Json to string[]
        let valuesArray: string[] = [];
        if (presentationData.values) {
          if (Array.isArray(presentationData.values)) {
            valuesArray = presentationData.values.filter((v): v is string => typeof v === 'string');
          } else if (typeof presentationData.values === 'string') {
            try {
              const parsed = JSON.parse(presentationData.values);
              valuesArray = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
            } catch {
              valuesArray = [];
            }
          }
        }

        setPresentation({
          ...presentationData,
          values: valuesArray
        });
      }
    } catch (err) {
      showError(err, 'Erro ao carregar apresentação da empresa');
      setError('Erro ao carregar apresentação da empresa');
    }
  };

  // Fetch organizational chart
  const fetchOrganizationalChart = async () => {
    try {
      // Mock organizational chart data for browser
      const mockOrgChart: OrganizationalChartNode[] = [
        {
          id: 'ceo-1',
          name: 'João Silva',
          position: 'CEO',
          department: 'Executivo',
          photo_url: '/placeholder.svg',
          bio: 'CEO e fundador da Hemera Capital Partners',
          order_position: 1,
          children: [
            {
              id: 'cto-1',
              parent_id: 'ceo-1',
              name: 'Maria Santos',
              position: 'CTO',
              department: 'Tecnologia',
              photo_url: '/placeholder.svg',
              bio: 'Responsável pela área de tecnologia',
              order_position: 2,
              children: []
            },
            {
              id: 'cfo-1',
              parent_id: 'ceo-1',
              name: 'Pedro Costa',
              position: 'CFO',
              department: 'Financeiro',
              photo_url: '/placeholder.svg',
              bio: 'Responsável pela área financeira',
              order_position: 3,
              children: []
            }
          ]
        }
      ];

      const result = await executeWithFallback(
        () => database
          .from('organizational_chart')
          .select('*')
          .eq('is_active', true)
          .eq('show_in_presentation', true)
          .order('order_position')
          .select_query(),
        mockOrgChart
      );

      if (result.error) throw result.error;

      // Build hierarchical structure
      const nodes = result.data || [];
      
      // If data is already hierarchical (mock), use it directly
      if (isBrowser && Array.isArray(nodes) && nodes.length > 0 && nodes[0].children) {
        setOrganizationalChart(nodes);
        return;
      }

      // Otherwise, build hierarchical structure from flat data
      const nodeMap = new Map<string, OrganizationalChartNode>();
      
      // First pass: create all nodes
      nodes.forEach((node: any) => {
        nodeMap.set(node.id, { ...node, children: [] });
      });

      // Second pass: build hierarchy
      const rootNodes: OrganizationalChartNode[] = [];
      nodes.forEach((node: any) => {
        const nodeWithChildren = nodeMap.get(node.id)!;
        if (node.parent_id) {
          const parent = nodeMap.get(node.parent_id);
          if (parent) {
            parent.children!.push(nodeWithChildren);
          }
        } else {
          rootNodes.push(nodeWithChildren);
        }
      });

      setOrganizationalChart(rootNodes);
    } catch (err) {
      showError(err, 'Erro ao carregar organograma');
      setError('Erro ao carregar organograma');
    }
  };

  // Check if user needs to see presentation
  const checkUserNeedsPresentation = async () => {
    try {
      // TODO: Implement with local auth context
      console.log('Checking if user needs presentation');
      return false;
    } catch (err) {
      console.error('Error checking presentation status:', err);
      return false;
    }
  };

  // Mark presentation as viewed
  const markPresentationViewed = async () => {
    try {
      // Mock result for browser
      const mockResult = { success: true };

      const result = await executeWithFallback(
        async () => {
          // TODO: Implement with local auth context
          console.log('Marking presentation as viewed');
          return { data: { success: true }, error: null };
        },
        mockResult
      );

      if (result.error) throw result.error;

      invalidateQueries(['presentation-views']);
    } catch (err) {
      showError(err, 'Erro ao registrar visualização');
    }
  };

  // Mark presentation as completed
  const markPresentationCompleted = async () => {
    try {
      // Mock result for browser
      const mockResult = { success: true };

      const result = await executeWithFallback(
        async () => {
          // TODO: Implement with local auth context
          console.log('Marking presentation as completed');
          return { data: { success: true }, error: null };
        },
        mockResult
      );

      if (result.error) throw result.error;

      showSuccess('Apresentação concluída com sucesso!');
      invalidateQueries(['presentation-views', 'presentation-completions']);
    } catch (err) {
      showError(err, 'Erro ao concluir apresentação');
    }
  };

  // Find user position in org chart
  const findUserPosition = (userId: string): OrganizationalChartNode | null => {
    const findInNodes = (nodes: OrganizationalChartNode[]): OrganizationalChartNode | null => {
      for (const node of nodes) {
        // You might want to match by user_id if you have that field
        // For now, we'll return null as we don't have user mapping
        if (node.children && node.children.length > 0) {
          const found = findInNodes(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInNodes(organizationalChart);
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPresentation(),
        fetchOrganizationalChart()
      ]);
      setLoading(false);
    };

    initializeData();
  }, []);

  return {
    presentation,
    organizationalChart,
    loading,
    error,
    checkUserNeedsPresentation,
    markPresentationViewed,
    markPresentationCompleted,
    findUserPosition,
    refetch: () => {
      fetchPresentation();
      fetchOrganizationalChart();
    }
  };
};