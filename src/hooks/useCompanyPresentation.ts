import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('company_presentation')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Safe conversion of Json to string[]
        let valuesArray: string[] = [];
        if (data.values) {
          if (Array.isArray(data.values)) {
            valuesArray = data.values.filter((v): v is string => typeof v === 'string');
          } else if (typeof data.values === 'string') {
            try {
              const parsed = JSON.parse(data.values);
              valuesArray = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
            } catch {
              valuesArray = [];
            }
          }
        }

        setPresentation({
          ...data,
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
      const { data, error } = await supabase
        .from('organizational_chart')
        .select('*')
        .eq('is_active', true)
        .eq('show_in_presentation', true)
        .order('order_position');

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('user_needs_presentation', {
        user_uuid: user.id
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error checking presentation status:', err);
      return false;
    }
  };

  // Mark presentation as viewed
  const markPresentationViewed = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('presentation_views')
        .insert({
          user_id: user.id,
          first_login_presentation_shown: true
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error marking presentation as viewed:', err);
      toast.error('Erro ao registrar visualização');
    }
  };

  // Mark presentation as completed
  const markPresentationCompleted = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('presentation_views')
        .update({
          completed_at: new Date().toISOString(),
          is_mandatory_completed: true
        })
        .eq('user_id', user.id);

      if (error) throw error;
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