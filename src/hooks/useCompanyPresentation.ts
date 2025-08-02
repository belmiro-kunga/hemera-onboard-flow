import { useState, useEffect } from 'react';
import { database } from '@/lib/database';
import { toast } from 'sonner';

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

  // Fetch company presentation data
  const fetchPresentation = async () => {
    try {
      const { data, error } = await database
        .from('company_presentation')
        .select('*')
        .eq('is_active', true)
        .select_query();

      const presentationData = Array.isArray(data) ? data[0] : data;

      if (error) {
        throw error;
      }

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
      console.error('Error fetching presentation:', err);
      setError('Erro ao carregar apresentação da empresa');
    }
  };

  // Fetch organizational chart
  const fetchOrganizationalChart = async () => {
    try {
      const { data, error } = await database
        .from('organizational_chart')
        .select('*')
        .eq('is_active', true)
        .eq('show_in_presentation', true)
        .order('order_position')
        .select_query();

      if (error) throw error;

      // Build hierarchical structure
      const nodes = data || [];
      const nodeMap = new Map<string, OrganizationalChartNode>();
      
      // First pass: create all nodes
      nodes.forEach(node => {
        nodeMap.set(node.id, { ...node, children: [] });
      });

      // Second pass: build hierarchy
      const rootNodes: OrganizationalChartNode[] = [];
      nodes.forEach(node => {
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
      console.error('Error fetching organizational chart:', err);
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
      // TODO: Implement with local auth context
      console.log('Marking presentation as viewed');
    } catch (err) {
      console.error('Error marking presentation as viewed:', err);
      toast.error('Erro ao registrar visualização');
    }
  };

  // Mark presentation as completed
  const markPresentationCompleted = async () => {
    try {
      // TODO: Implement with local auth context
      console.log('Marking presentation as completed');
      toast.success('Apresentação concluída com sucesso!');
    } catch (err) {
      console.error('Error marking presentation as completed:', err);
      toast.error('Erro ao concluir apresentação');
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