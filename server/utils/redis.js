const { createClient } = require('redis');

const client = createClient({
  socket: { host: '127.0.0.1', port: 6379 }
});

client.on('error', err => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected'));

const TTL = 300; // 5分钟缓存

module.exports = {
  client,
  async get(key) {
    try {
      if (!client.isOpen) await client.connect();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  async set(key, value, ttl = TTL) {
    try {
      if (!client.isOpen) await client.connect();
      await client.setEx(key, ttl, JSON.stringify(value));
    } catch (err) { console.error('Redis set error:', err); }
  },
  // 清空所有公开数据缓存（管理员修改后调用）
  async clearPublicCache() {
    try {
      if (!client.isOpen) await client.connect();
      const keys = await client.keys('liujing:/api/public*');
      if (keys.length) {
        await client.del(keys);
        console.log(`Redis: cleared ${keys.length} cache entries`);
      }
    } catch (err) { console.error('Redis clear error:', err); }
  }
};
