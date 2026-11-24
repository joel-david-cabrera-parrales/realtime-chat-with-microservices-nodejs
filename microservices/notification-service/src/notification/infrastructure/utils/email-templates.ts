import { SessionCreatedEmailData } from "../../domain/use-cases/dtos/session-email.dto";
import { SessionRevokedEmailData } from "../../domain/use-cases/dtos/session-email.dto";

export interface EmailTemplateData {
  appName: string;
  year: number;
  userName: string;
  userEmail: string;
}

export interface SessionCreatedTemplateData extends EmailTemplateData {
  sessionId: string;
  expiresAt: string;
  currentDate: string;
}

export interface SessionRevokedTemplateData extends EmailTemplateData {
  sessionId: string;
  revokedAt: string;
  reason: string;
}

export interface WelcomeTemplateData extends EmailTemplateData {
  loginUrl: string;
  profileCode: string;
}

function baseLayout(data: EmailTemplateData, body: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px 20px;text-align:center">
      <div style="font-size:24px;font-weight:bold;margin-bottom:8px">${data.appName}</div>
      <div style="opacity:0.9;font-size:14px">${title}</div>
    </div>
    <div style="padding:30px">
      ${body}
    </div>
    <div style="background:#f8f9fa;padding:20px;text-align:center;color:#666;font-size:12px;border-top:1px solid #eee">
      <p>Este email fue enviado automáticamente, por favor no responder.</p>
      <p>&copy; ${data.year} ${data.appName}. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`;
}

export function renderSessionCreatedEmail(
  userCredential: { fullName?: string | null; username: string; email: string | null },
  data: SessionCreatedEmailData,
  appName: string = "ChatApp",
): { html: string; text: string } {
  const templateData: SessionCreatedTemplateData = {
    appName,
    year: new Date().getFullYear(),
    userName: userCredential.fullName ?? userCredential.username,
    userEmail: userCredential.email ?? userCredential.username,
    sessionId: data.sessionId,
    expiresAt: new Date(data.expiresAt).toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" }),
    currentDate: new Date().toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" }),
  };

  const body = `
    <p>Hola <strong>${templateData.userName}</strong>,</p>
    
    <p>Se ha detectado un nuevo inicio de sesión en tu cuenta.</p>
    
    <div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:6px;padding:16px;margin:20px 0">
      <strong>⚠️ Si no fuiste tú, revoca la sesión inmediatamente.</strong>
    </div>
    
    <div style="margin:20px 0">
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee">
        <span style="color:#666;font-weight:500">ID de sesión:</span>
        <span style="font-family:monospace;background:#f8f9fa;padding:4px 8px;border-radius:4px">${templateData.sessionId}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee">
        <span style="color:#666;font-weight:500">Expira:</span>
        <span style="font-family:monospace;background:#f8f9fa;padding:4px 8px;border-radius:4px">${templateData.expiresAt}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:12px 0">
        <span style="color:#666;font-weight:500">Fecha:</span>
        <span style="font-family:monospace;background:#f8f9fa;padding:4px 8px;border-radius:4px">${templateData.currentDate}</span>
      </div>
    </div>
    
    <p style="margin-top:30px;color:#666;font-size:14px">
      Si no reconoces esta actividad, te recomendamos cambiar tu contraseña y revisar tus sesiones activas.
    </p>
  `;

  const html = baseLayout(templateData, body, "Nuevo inicio de sesión");
  const text = [
    `Hola ${templateData.userName},`,
    "",
    "Se ha detectado un nuevo inicio de sesión en tu cuenta.",
    "",
    `ID de sesión: ${templateData.sessionId}`,
    `Expira: ${templateData.expiresAt}`,
    "",
    "Si no fuiste tú, revoca la sesión inmediatamente.",
  ].join("\n");

  return { html, text };
}

export function renderSessionRevokedEmail(
  userCredential: { fullName?: string | null; username: string; email: string | null },
  data: SessionRevokedEmailData,
  appName: string = "ChatApp",
): { html: string; text: string } {
  const templateData: SessionRevokedTemplateData = {
    appName,
    year: new Date().getFullYear(),
    userName: userCredential.fullName ?? userCredential.username,
    userEmail: userCredential.email ?? userCredential.username,
    sessionId: data.sessionId,
    revokedAt: new Date(data.revokedAt).toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" }),
    reason: data.reason ?? "no especificado",
  };

  const body = `
    <p>Hola <strong>${templateData.userName}</strong>,</p>
    
    <div style="background:#f8d7da;border:1px solid #f5c6cb;border-radius:6px;padding:16px;margin:20px 0;color:#721c24">
      <strong>🔒 Se ha revocado una sesión de tu cuenta.</strong>
    </div>
    
    <div style="margin:20px 0">
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee">
        <span style="color:#666;font-weight:500">ID de sesión:</span>
        <span style="font-family:monospace;background:#f8f9fa;padding:4px 8px;border-radius:4px">${templateData.sessionId}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee">
        <span style="color:#666;font-weight:500">Revocada:</span>
        <span style="font-family:monospace;background:#f8f9fa;padding:4px 8px;border-radius:4px">${templateData.revokedAt}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:12px 0">
        <span style="color:#666;font-weight:500">Motivo:</span>
        <span style="font-family:monospace;background:#f8f9fa;padding:4px 8px;border-radius:4px">${templateData.reason}</span>
      </div>
    </div>
    
    <p style="margin-top:20px;font-weight:600;color:#721c24">
      Si no fuiste tú, cambia tu contraseña de inmediato.
    </p>
  `;

  const html = baseLayout(templateData, body, "Sesión revocada");
  const text = [
    `Hola ${templateData.userName},`,
    "",
    "Se ha revocado una sesión de tu cuenta.",
    "",
    `ID de sesión: ${templateData.sessionId}`,
    `Revocada: ${templateData.revokedAt}`,
    `Motivo: ${templateData.reason}`,
    "",
    "Si no fuiste tú, cambia tu contraseña de inmediato.",
  ].join("\n");

  return { html, text };
}

export function renderWelcomeEmail(
  userCredential: { fullName?: string | null; username: string; email: string | null },
  loginUrl: string,
  appName: string = "ChatApp",
  profileCode?: string,
): { html: string; text: string } {
  const templateData: WelcomeTemplateData = {
    appName,
    year: new Date().getFullYear(),
    userName: userCredential.fullName ?? userCredential.username,
    userEmail: userCredential.email ?? userCredential.username,
    loginUrl,
    profileCode: profileCode ?? "",
  };

  const body = `
    <p>Hola <strong>${templateData.userName}</strong>,</p>
    
    <p>¡Bienvenido a <strong>${templateData.appName}</strong>! 🎉</p>
    
    <p>Tu cuenta ha sido creada exitosamente. Ya puedes empezar a chatear con tus contactos.</p>
    
    <div style="text-align:center;margin:30px 0">
      <a href="${templateData.loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px">
        Iniciar sesión
      </a>
    </div>
    
    <div style="background:#f8f9fa;border-radius:6px;padding:20px;margin:20px 0">
      <h3 style="margin:0 0 12px 0;color:#333;font-size:16px">Primeros pasos:</h3>
      <ul style="margin:0;padding-left:20px;color:#555;line-height:1.8">
        <li>Completa tu perfil con foto y descripción</li>
        <li>Agrega contactos buscando su nombre de usuario</li>
        <li>Crea tu primera conversación</li>
        <li>Comparte archivos, fotos y más</li>
      </ul>
    </div>
    
    <p style="color:#666;font-size:14px">
      Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.
    </p>
  `;

  const html = baseLayout(templateData, body, "¡Bienvenido a ChatApp!");
  const text = [
    `Hola ${templateData.userName},`,
    "",
    `¡Bienvenido a ${templateData.appName}! 🎉`,
    "",
    "Tu cuenta ha sido creada exitosamente. Ya puedes empezar a chatear con tus contactos.",
    "",
    `Inicia sesión aquí: ${templateData.loginUrl}`,
    "",
    "Primeros pasos:",
    "- Completa tu perfil con foto y descripción",
    "- Agrega contactos buscando su nombre de usuario",
    "- Crea tu primera conversación",
    "- Comparte archivos, fotos y más",
    "",
    "Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.",
  ].join("\n");

  return { html, text };
}
