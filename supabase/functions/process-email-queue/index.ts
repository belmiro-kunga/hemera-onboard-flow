import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing email queue...");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Buscar emails pendentes para envio
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select(`
        id,
        template_id,
        recipient_email,
        recipient_name,
        variables,
        retry_count,
        max_retries,
        email_templates (
          subject,
          content,
          template_type
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(10);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${pendingEmails?.length || 0} pending emails`);

    let processedCount = 0;
    let errorCount = 0;

    for (const emailItem of pendingEmails || []) {
      try {
        // Marcar como processando
        await supabase
          .from('email_queue')
          .update({ status: 'processing' })
          .eq('id', emailItem.id);

        // Processar template com variáveis
        const { data: processedContent } = await supabase
          .rpc('process_email_template', {
            template_content: emailItem.email_templates.content,
            variables: emailItem.variables || {}
          });

        const processedSubject = emailItem.email_templates.subject.replace(
          /\{\{(\w+)\}\}/g, 
          (match, key) => emailItem.variables?.[key] || match
        );

        // Enviar email
        const emailResponse = await resend.emails.send({
          from: "Sistema Hemera Capital <noreply@hemeracapital.com>",
          to: [emailItem.recipient_email],
          subject: processedSubject,
          html: processedContent || emailItem.email_templates.content,
        });

        // Registrar log de sucesso
        await supabase.from('email_logs').insert({
          template_id: emailItem.template_id,
          recipient_email: emailItem.recipient_email,
          recipient_name: emailItem.recipient_name,
          subject: processedSubject,
          content: processedContent || emailItem.email_templates.content,
          status: 'sent',
          provider_message_id: emailResponse.data?.id,
          sent_at: new Date().toISOString()
        });

        // Marcar como enviado na fila
        await supabase
          .from('email_queue')
          .update({ status: 'sent' })
          .eq('id', emailItem.id);

        processedCount++;
        console.log(`Email sent to ${emailItem.recipient_email}`);

      } catch (emailError: any) {
        console.error(`Error processing email ${emailItem.id}:`, emailError);
        
        const newRetryCount = (emailItem.retry_count || 0) + 1;
        const shouldRetry = newRetryCount < (emailItem.max_retries || 3);

        // Registrar log de erro
        await supabase.from('email_logs').insert({
          template_id: emailItem.template_id,
          recipient_email: emailItem.recipient_email,
          recipient_name: emailItem.recipient_name,
          subject: emailItem.email_templates.subject,
          content: emailItem.email_templates.content,
          status: 'failed',
          error_message: emailError.message
        });

        // Atualizar status na fila
        await supabase
          .from('email_queue')
          .update({
            status: shouldRetry ? 'pending' : 'failed',
            retry_count: newRetryCount,
            error_message: emailError.message,
            scheduled_for: shouldRetry 
              ? new Date(Date.now() + 5 * 60 * 1000).toISOString() // Retry em 5 minutos
              : undefined
          })
          .eq('id', emailItem.id);

        errorCount++;
      }
    }

    console.log(`Processed ${processedCount} emails, ${errorCount} errors`);

    return new Response(JSON.stringify({ 
      success: true,
      processed: processedCount,
      errors: errorCount
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in process-email-queue function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);