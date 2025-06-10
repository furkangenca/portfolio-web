import api from '@/app/services/api';
import { ApiResponse } from '@/types';

interface Visitor {
  ip_address: string;
  timestamp: string;
  formatted_date: string;
  user_agent?: string;
  referrer?: string;
}

interface Stats {
  totalVisitors: number;
  onlineUsers: number;
}

class VisitorService {
  async getStats(): Promise<ApiResponse<Stats>> {
    try {
      const response = await api.get('/api/stats');
      return {
        data: response.data,
        message: 'İstatistikler başarıyla alındı',
        status: response.status
      };
    } catch (error) {
      console.error('Stats fetch error:', error);
      throw error;
    }
  }

  async getVisitors(): Promise<ApiResponse<Visitor[]>> {
    try {
      const response = await api.get('/api/visitors');
      return {
        data: response.data,
        message: 'Ziyaretçi listesi başarıyla alındı',
        status: response.status
      };
    } catch (error) {
      console.error('Visitors fetch error:', error);
      throw error;
    }
  }
}

export const visitorService = new VisitorService(); 