import mongoose from 'mongoose';

// Cache connections: { tenantDbName: mongooseConnection }
const connectionCache = new Map();

export const getTenantDatabase = (tenantDbName) => {
  if (connectionCache.has(tenantDbName)) {
    return connectionCache.get(tenantDbName);
  }

  const baseUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
  
  // Format URI dynamically to switch target database name
  const uri = baseUri.includes('?') 
    ? baseUri.replace(/\/[^/?]*\?/, `/${tenantDbName}?`)
    : `${baseUri.replace(/\/$/, '')}/${tenantDbName}`;

  const tenantConnection = mongoose.createConnection(uri);

  tenantConnection.on('connected', () => {
    console.log(`[Multi-Tenant] Connected to isolated DB: ${tenantDbName}`);
  });

  tenantConnection.on('error', (err) => {
    console.error(`[Multi-Tenant] Connection error for ${tenantDbName}:`, err);
  });

  connectionCache.set(tenantDbName, tenantConnection);
  return tenantConnection;
};