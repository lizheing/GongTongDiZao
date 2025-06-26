import db from '../config/db';

export const messagesService = {
  // 获取分页和检索留言
  async getAll(query: any) {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    let where = [];
    let params: any[] = [];
    // 检索条件
    if (query.keyword) {
      where.push(`(user_nickname ILIKE $${params.length+1} OR subject ILIKE $${params.length+1} OR content ILIKE $${params.length+1})`);
      params.push(`%${query.keyword}%`);
    }
    if (query.category) {
      where.push(`category = $${params.length+1}`);
      params.push(query.category);
    }
    if (query.domain) {
      where.push(`domain = $${params.length+1}`);
      params.push(query.domain);
    }
    if (query.status) {
      where.push(`status = $${params.length+1}`);
      params.push(query.status);
    }
    if (query.district_name) {
      where.push(`district_name = $${params.length+1}`);
      params.push(query.district_name);
    }
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    // 总数
    const total = await db.oneOrNone(`SELECT COUNT(*) FROM messages ${whereStr}`, params);
    // 数据
    const list = await db.any(`SELECT * FROM messages ${whereStr} ORDER BY message_id DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, pageSize, offset]);
    return {
      total: total ? parseInt(total.count) : 0,
      list
    };
  },
  // 新增留言
  async create(data: any) {
    // 校验三个评分分数只能是1到5
    const scoreFields = ['solution_score', 'attitude_score', 'speed_score'];
    for (const field of scoreFields) {
      const value = Number(data[field]);
      if (isNaN(value) || value < 1 || value > 5) {
        throw new Error(`${field} 必须是1到5之间的整数`);
      }
    }
    // 校验回复时间必须在留言时间之后
    if (data.reply_time && data.message_time) {
      const replyTime = new Date(data.reply_time).getTime();
      const messageTime = new Date(data.message_time).getTime();
      if (!isNaN(replyTime) && !isNaN(messageTime) && replyTime <= messageTime) {
        throw new Error('回复时间必须在留言时间之后');
      }
    }
    const fields = [
      'original_id','link_url','user_nickname','original_message_id','subject','message_time','category','domain','status','location','target_object','content','reply_id','reply_nickname','reply_organization','reply_time','reply_content','satisfaction','solution_score','attitude_score','speed_score','district_name'
    ];
    const values = fields.map(f => data[f] ?? null);
    const sql = `INSERT INTO messages (${fields.join(',')}) VALUES (${fields.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING *`;
    return db.one(sql, values);
  },
  // 编辑留言
  async update(id: number, data: any) {
    // 校验三个评分分数只能是1到5
    const scoreFields = ['solution_score', 'attitude_score', 'speed_score'];
    for (const field of scoreFields) {
      const value = Number(data[field]);
      if (isNaN(value) || value < 1 || value > 5) {
        throw new Error(`${field} 必须是1到5之间的整数`);
      }
    }
    // 校验回复时间必须在留言时间之后
    if (data.reply_time && data.message_time) {
      const replyTime = new Date(data.reply_time).getTime();
      const messageTime = new Date(data.message_time).getTime();
      if (!isNaN(replyTime) && !isNaN(messageTime) && replyTime <= messageTime) {
        throw new Error('回复时间必须在留言时间之后');
      }
    }
    const fields = [
      'original_id','link_url','user_nickname','original_message_id','subject','message_time','category','domain','status','location','target_object','content','reply_id','reply_nickname','reply_organization','reply_time','reply_content','satisfaction','solution_score','attitude_score','speed_score','district_name'
    ];
    const setStr = fields.map((f,i) => `${f}=$${i+1}`).join(',');
    const values = fields.map(f => data[f] ?? null);
    values.push(id);
    const sql = `UPDATE messages SET ${setStr} WHERE message_id=$${fields.length+1} RETURNING *`;
    return db.one(sql, values);
  },
  // 删除留言
  async remove(id: number) {
    return db.none('DELETE FROM messages WHERE message_id=$1', [id]);
  },
  // 按区域查询留言
  async getByDistrict(districtName: string, query: any) {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    let where = [`district_name = $1`];
    let params: any[] = [districtName];
    
    // 检索条件
    if (query.keyword) {
      where.push(`(user_nickname ILIKE $${params.length+1} OR subject ILIKE $${params.length+1} OR content ILIKE $${params.length+1})`);
      params.push(`%${query.keyword}%`);
    }
    if (query.category) {
      where.push(`category = $${params.length+1}`);
      params.push(query.category);
    }
    if (query.domain) {
      where.push(`domain = $${params.length+1}`);
      params.push(query.domain);
    }
    if (query.status) {
      where.push(`status = $${params.length+1}`);
      params.push(query.status);
    }
    
    const whereStr = 'WHERE ' + where.join(' AND ');
    
    // 总数
    const total = await db.oneOrNone(`SELECT COUNT(*) FROM messages ${whereStr}`, params);
    
    // 数据
    const list = await db.any(
      `SELECT * FROM messages ${whereStr} ORDER BY message_id DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`, 
      [...params, pageSize, offset]
    );
    
    return {
      total: total ? parseInt(total.count) : 0,
      list,
      districtName
    };
  }
}; 