import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from 'next-auth/react';
import { SecurityService } from '../services/securityService';

export async function securityMiddleware(
  req: NextRequest,
  context: { params: { [key: string]: string } }
) {
  try {
    const session = await getSession({ req });
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const securityService = SecurityService.getInstance();
    const userId = session.user.id;

    // Get security settings
    const settings = await securityService.getSecuritySettings(userId);
    if (!settings) {
      return NextResponse.json(
        { error: 'Security settings not found' },
        { status: 500 }
      );
    }

    // Check IP whitelisting if enabled
    if (settings.accessControl.ipWhitelisting.enabled) {
      const clientIP = req.headers.get('x-forwarded-for') || req.ip;
      if (!settings.accessControl.ipWhitelisting.allowedIPs.includes(clientIP)) {
        await securityService.logAuditEvent({
          userId,
          action: 'IP_BLOCKED',
          resource: req.url,
          details: { ip: clientIP },
          ipAddress: clientIP,
          userAgent: req.headers.get('user-agent') || '',
          timestamp: new Date()
        });

        return NextResponse.json(
          { error: 'Access denied: IP not whitelisted' },
          { status: 403 }
        );
      }
    }

    // Check session timeout
    if (settings.authentication.sessionTimeout) {
      const sessionStart = new Date(session.user.sessionStart || 0);
      const now = new Date();
      const sessionAge = (now.getTime() - sessionStart.getTime()) / (1000 * 60); // in minutes

      if (sessionAge > settings.authentication.sessionTimeout) {
        await securityService.logAuditEvent({
          userId,
          action: 'SESSION_EXPIRED',
          resource: req.url,
          details: { sessionAge },
          ipAddress: req.headers.get('x-forwarded-for') || req.ip,
          userAgent: req.headers.get('user-agent') || '',
          timestamp: new Date()
        });

        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }
    }

    // Check access permissions
    const resource = req.url.split('/').pop() || '';
    const action = req.method.toLowerCase();
    const hasAccess = await securityService.checkAccess(userId, resource, action);

    if (!hasAccess) {
      await securityService.logAuditEvent({
        userId,
        action: 'ACCESS_DENIED',
        resource: req.url,
        details: { method: req.method },
        ipAddress: req.headers.get('x-forwarded-for') || req.ip,
        userAgent: req.headers.get('user-agent') || '',
        timestamp: new Date()
      });

      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Log successful access
    if (settings.auditLogging.logDataAccess) {
      await securityService.logAuditEvent({
        userId,
        action: 'ACCESS_GRANTED',
        resource: req.url,
        details: { method: req.method },
        ipAddress: req.headers.get('x-forwarded-for') || req.ip,
        userAgent: req.headers.get('user-agent') || '',
        timestamp: new Date()
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Security middleware error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 