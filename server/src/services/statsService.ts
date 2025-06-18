import db from '../config/db';

export const statsService = {
  // 类别统计
  async getCategoryStats() {
    return db.any('SELECT category, message_count, percentage FROM category_stats ORDER BY message_count DESC');
  },
  // 区域统计
  async getDistrictStats() {
    return db.any('SELECT district_name, message_count, percentage FROM district_stats ORDER BY message_count DESC');
  },
  // 领域统计
  async getDomainStats() {
    return db.any('SELECT domain, message_count, percentage FROM domain_stats ORDER BY message_count DESC');
  },
  // 满意度统计
  async getSatisfactionStats() {
    return db.any('SELECT satisfaction, message_count, percentage FROM satisfaction_stats ORDER BY message_count DESC');
  },
  // 办理状态统计
  async getStatusStats() {
    return db.any('SELECT status, message_count, percentage FROM status_stats ORDER BY message_count DESC');
  }
}; 