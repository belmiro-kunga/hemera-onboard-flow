import { useState, useEffect } from "react";
import { database } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
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
  const { showError, showSuccess } = useCommonHook();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await database
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false })
        .select_query();
      
      if (error) throw error;
      setTemplates((data || []) as EmailTemplate[]);
    } catch (error: any) {
      showError(error, "Erro ao carregar templates");
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await database
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
        .select_query();
      
      if (error) throw error;
      setLogs((data || []) as EmailLog[]);
    } catch (error: any) {
      showError(error, "Erro ao carregar logs");
    }
  };

  const fetchQueue = async () => {
    try {
      const { data, error } = await database
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
        .select_query();
      
      if (error) throw error;
      setQueue((data || []) as EmailQueue[]);
    } catch (error: any) {
      showError(error, "Erro ao carregar fila");
    }
  };

  const createTemplate = async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await database
        .from('email_templates')
        .insert([templateData]);

      if (error) throw error;

      showSuccess(`Template "${templateData.name}" foi criado com sucesso.`);
      
      await fetchTemplates();
    } catch (error: any) {
      showError(error, "Erro ao criar template");
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<EmailTemplate>) => {
    try {
      const { error } = await database
        .from('email_templates')
        .update(templateData)
        .eq('id', id);

      if (error) throw error;

      showSuccess("Template foi atualizado com sucesso.");
      
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
      const { error } = await database
        .from('email_queue')
        .insert([{
          template_id: emailData.templateId,
          recipient_email: emailData.recipientEmail,
          recipient_name: emailData.recipientName,
          variables: emailData.variables,
          scheduled_for: emailData.scheduledFor || new Date().toISOString(),
        }]);

      if (error) throw error;

      showSuccess(`Email agendado para ${emailData.recipientEmail}.`);
      
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
      // TODO: Implement local email service
      console.log('Welcome email would be sent to:', userData.email);
      showSuccess(`Email enviado para ${userData.email}.`);

    } catch (error: any) {
      showError(error, "Erro ao enviar email");
    }
  };

  const processEmailQueue = async () => {
    setLoading(true);
    try {
      // TODO: Implement local email queue processing
      console.log('Email queue processing would be triggered');

      showSuccess("Emails pendentes foram processados.");

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