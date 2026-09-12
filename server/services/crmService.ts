/**
 * Native CRM Service (Server-side)
 * Manages customer leads, score tracking, and status.
 */
import { db } from '../db';
import { CustomerLead } from '../../src/types/index';

export class CrmService {
  public static getConnectionStatus(): { connected: boolean; provider: string } {
    return {
      connected: true,
      provider: 'Zain Native CRM Database'
    };
  }

  public static getLeads(orgId: string): CustomerLead[] {
    const tenant = db.getTenant(orgId);
    return tenant.leads || [];
  }

  public static saveLead(orgId: string, leadData: Partial<CustomerLead>): CustomerLead {
    const tenant = db.getTenant(orgId);
    const existingIndex = tenant.leads.findIndex(
      (l) => (leadData.phone && l.phone === leadData.phone) || (leadData.email && l.email === leadData.email)
    );

    if (existingIndex >= 0) {
      tenant.leads[existingIndex] = {
        ...tenant.leads[existingIndex],
        ...leadData,
        lastActivity: 'تحديث بيانات العميل عبر النظام'
      };
      return tenant.leads[existingIndex];
    }

    const newLead: CustomerLead = {
      id: `lead_${Date.now()}`,
      name: leadData.name || 'عميل جديد',
      phone: leadData.phone || '+966500000000',
      email: leadData.email || 'lead@example.com',
      company: leadData.company || 'مؤسسة تجارية',
      source: leadData.source || 'Automation Pipeline',
      status: leadData.status || 'qualified',
      stage: leadData.stage || 'qualified',
      value: leadData.value || 12000,
      score: leadData.score || 85,
      sentimentScore: leadData.sentimentScore || 'positive',
      sentimentNote: leadData.sentimentNote || 'تم تأهيل العميل تلقائياً بنجاح',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lastActivity: 'تم إنشاء العميل في الـ CRM',
      tags: ['AI-Qualified', 'Automation Lead'],
      activityHistory: [
        {
          id: `act_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          action: 'إنشاء جهة اتصال',
          description: 'تم تسجيل العميل بنجاح عبر النظام'
        }
      ]
    };

    tenant.leads.unshift(newLead);
    return newLead;
  }
}
