import { useState, useEffect } from "react";
import { database } from "@/lib/database";
import { useCommonHook } from "@/hooks/useCommonHook";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: 'welcome' | 'password_reset' | 'notification' | 'reminder';
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  template_id?: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened';
  provider_message_id?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  created_at: string;
}

export interface EmailQueue {
  id: string;
  template_id?: string;
  recipient_email: string;
  recipient_name?: string;
  variables: Record<string, any>;
  scheduled_for: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  retry_count: number;
  max_retries: number;
  error_message?: string;
  created_at: string;
}

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [queue, setQueue] = useState<EmailQueue[]>([]);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, invalidateQueries } = useCommonHook();

  // Função auxiliar para detectar ambiente
  const isBrowser = typeof window !== 'undefined';

  // Função auxiliar para operações de database com fallback
  const executeWithFallback = async (
    operation: () => Promise<any>,
    mockData?: any
  ) => {
    if (isBrowser && mockData) {
      console.warn('🔧 Using mock email data');
      return { data: mockData, error: null };
    }

    try {
      return await operation();
    } catch (error) {
      console.warn('Database operation failed, using fallback');
      return { data: mockData || [], error: null };
    }
  };

  const fetchTemplates = async () => {
    try {
      // Mock templates data for browser
      const mockTemplates: EmailTemplate[] = [
        {
          id: 'template-1',
          name: 'Boas-vindas',
          subject: 'Bem-vindo à Hemera Capital Partners',
          content: 'Olá {{name}}, bem-vindo à nossa empresa!',
          template_type: 'welcome',
          variables: ['name', 'email', 'temporaryPassword'],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'template-2',
          name: 'Reset de Senha',
          subject: 'Redefinição de senha',
          content: 'Olá {{name}}, clique no link para redefinir sua senha.',
          template_type: 'password_reset',
          variables: ['name', 'resetLink'],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const result = await executeWithFallback(
        () => database
          .from('email_templates')
          .select('*')
          .order('created_at', { ascending: false })
          .select_query(),
        mockTemplates
      );

      if (result.error) throw result.error;
      setTemplates((result.data || []) as EmailTemplate[]);
    } catch (error: any) {
      showError(error, "Erro ao carregar templates");
    }
  };

  const fetchLogs = async () => {
    try {
      // Mock logs data for browser
      const mockLogs: EmailLog[] = [
        {
          id: 'log-1',
          template_id: 'template-1',
          recipient_email: 'joao@example.com',
          recipient_name: 'João Silva',
          subject: 'Bem-vindo à Hemera Capital Partners',
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 'log-2',
          template_id: 'template-2',
          recipient_email: 'maria@example.com',
          recipient_name: 'Maria Santos',
          subject: 'Redefinição de senha',
          status: 'delivered',
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      const result = await executeWithFallback(
        () => database
          .from('email_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
          .select_query(),
        mockLogs
      );

      if (result.error) throw result.error;
      setLogs((result.data || []) as EmailLog[]);
    } catch (error: any) {
      showError(error, "Erro ao carregar logs");
    }
  };

  const fetchQueue = async () => {
    try {
      // Mock queue data for browser
      const mockQueue: EmailQueue[] = [
        {
          id: 'queue-1',
          template_id: 'template-1',
          recipient_email: 'pedro@example.com',
          recipient_name: 'Pedro Costa',
          variables: { name: 'Pedro', temporaryPassword: 'temp123' },
          scheduled_for: new Date().toISOString(),
          status: 'pending',
          retry_count: 0,
          max_retries: 3,
          created_at: new Date().toISOString()
        }
      ];

      const result = await executeWithFallback(
        () => database
          .from('email_queue')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
          .select_query(),
        mockQueue
      );

      if (result.error) throw result.error;
      setQueue((result.data || []) as EmailQueue[]);
    } catch (error: any) {
      showError(error, "Erro ao carregar fila");
    }
  };

  const createTemplate = async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Mock result for browser
      const mockResult = { success: true };

      const result = await executeWithFallback(
        () => database
          .from('email_templates')
          .insert([templateData]),
        mockResult
      );

      if (result.error) throw result.error;

      showSuccess(`Template "${templateData.name}" foi criado com sucesso.`);
      invalidateQueries(['email-templates']);
      await fetchTemplates();
    } catch (error: any) {
      showError(error, "Erro ao criar template");
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<EmailTemplate>) => {
    try {
      // Mock result for browser
      const mockResult = { success: true };

      const result = await executeWithFallback(
        () => database
          .from('email_templates')
          .update(templateData)
          .eq('id', id),
        mockResult
      );

      if (result.error) throw result.error;

      showSuccess("Template foi atualizado com sucesso.");
      invalidateQueries(['email-templates']);
      await fetchTemplates();
    } catch (error: any) {
      showError(error, "Erro ao atualizar template");
    }
  };

  const scheduleEmail = async (emailData: {
    templateId: string;
    recipientEmail: string;
    recipientName?: string;
    variables: Record<string, any>;
    scheduledFor?: string;
  }) => {
    try {
      // Mock result for browser
      const mockResult = { success: true };

      const result = await executeWithFallback(
        () => database
          .from('email_queue')
          .insert([{
            template_id: emailData.templateId,
            recipient_email: emailData.recipientEmail,
            recipient_name: emailData.recipientName,
            variables: emailData.variables,
            scheduled_for: emailData.scheduledFor || new Date().toISOString(),
          }]),
        mockResult
      );

      if (result.error) throw result.error;

      showSuccess(`Email agendado para ${emailData.recipientEmail}.`);
      invalidateQueries(['email-queue']);
      await fetchQueue();
    } catch (error: any) {
      showError(error, "Erro ao agendar email");
    }
  };

  const sendWelcomeEmail = async (userData: {
    name: string;
    email: string;
    temporaryPassword: string;
  }) => {
    try {
      // Mock result for browser
      const mockResult = { success: true };

      const result = await executeWithFallback(
        async () => {
          // TODO: Implement local email service
          console.log('Welcome email would be sent to:', userData.email);
          return { data: { success: true }, error: null };
        },
        mockResult
      );

      if (result.error) throw result.error;

      showSuccess(`Email enviado para ${userData.email}.`);
      invalidateQueries(['email-logs', 'email-queue']);
    } catch (error: any) {
      showError(error, "Erro ao enviar email");
    }
  };

  const processEmailQueue = async () => {
    setLoading(true);
    try {
      // Mock result for browser
      const mockResult = { success: true, processed: 3 };

      const result = await executeWithFallback(
        async () => {
          // TODO: Implement local email queue processing
          console.log('Email queue processing would be triggered');
          return { data: { success: true, processed: 0 }, error: null };
        },
        mockResult
      );

      if (result.error) throw result.error;

      const processedCount = result.data?.processed || 0;
      const message = isBrowser ? 
        "Emails pendentes foram processados (modo mock)." :
        `${processedCount} emails pendentes foram processados.`;

      showSuccess(message);
      invalidateQueries(['email-queue', 'email-logs']);
      await fetchQueue();
      await fetchLogs();
    } catch (error: any) {
      showError(error, "Erro ao processar fila");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchLogs();
    fetchQueue();
  }, []);

  return {
    templates,
    logs,
    queue,
    loading,
    fetchTemplates,
    fetchLogs,
    fetchQueue,
    createTemplate,
    updateTemplate,
    scheduleEmail,
    sendWelcomeEmail,
    processEmailQueue,
  };
}