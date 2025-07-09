const { createClient } = require('redis');

const client = createClient({
  username: 'default',
  password: 'yigChNHGPr9XGOFTbpm8VqXEEYLuOE39',
  socket: {
    host: 'redis-11012.c241.us-east-1-4.ec2.redns.redis-cloud.com',
    port: 11012
  }
});

client.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

const connectRedis = async () => {
  try {
    if (!client.isOpen && !client.isReady) {
      await client.connect();
      console.log('✅ Connected to Redis');
    } else {
      console.log('🔄 Redis already connected or connecting');
    }
  } catch (err) {
    console.error('❌ Redis Connection Failed:', err);
  }
};

module.exports = { client, connectRedis };
