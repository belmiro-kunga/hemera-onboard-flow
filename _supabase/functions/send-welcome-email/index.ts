import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
  temporaryPassword: string;
  loginUrl?: string;
  companyName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Welcome email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, temporaryPassword, loginUrl = "https://app.hemeracapital.com", companyName = "Hemera Capital" }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    // Configurações SMTP
    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const fromEmail = Deno.env.get("FROM_EMAIL") || smtpUser;

    if (!smtpUser || !smtpPassword) {
      throw new Error("Credenciais SMTP não configuradas. Configure SMTP_USER e SMTP_PASSWORD.");
    }

    // Configurar cliente SMTP
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Bem-vindo(a) ao Sistema!</h1>
        
        <p>Olá <strong>${name}</strong>!</p>
        
        <p>Bem-vindo(a) ao sistema da <strong>${companyName}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Seus dados de acesso:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Email:</strong> ${email}</li>
            <li style="margin: 10px 0;"><strong>Senha temporária:</strong> <code style="background-color: #e9ecef; padding: 4px 8px; border-radius: 4px;">${temporaryPassword}</code></li>
          </ul>
        </div>
        
        <p style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffeaa7; margin: 20px 0;">
          <strong>Importante:</strong> Por motivos de segurança, você precisará alterar sua senha no primeiro acesso.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Acessar Sistema
          </a>
        </div>
        
        <hr style="border: none; height: 1px; background-color: #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 14px; text-align: center;">
          Atenciosamente,<br>
          Equipe ${companyName}
        </p>
      </div>
    `;

    // Enviar email
    await client.send({
      from: fromEmail!,
      to: email,
      subject: `Bem-vindo(a) ao Sistema - ${companyName}`,
      content: emailContent,
      html: emailContent,
    });

    await client.close();

    console.log("Email sent successfully to:", email);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email enviado com sucesso" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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