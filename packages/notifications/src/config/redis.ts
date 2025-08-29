import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    if (!redisClient) {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      redisClient = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 60000,
        }
      });

      redisClient.on('error', (err: any) => {
        console.error('❌ Redis Client Error:', err);
      });

      redisClient.on('connect', () => {
        console.log('✅ Connected to Redis');
      });

      redisClient.on('ready', () => {
        console.log('📊 Redis client ready');
      });

      redisClient.on('end', () => {
        console.log('📊 Redis connection ended');
      });

      await redisClient.connect();
    }

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.disconnect();
      redisClient = null;
      console.log('✅ Disconnected from Redis');
    }
  } catch (error) {
    console.error('❌ Redis disconnection error:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectRedis();
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
});
