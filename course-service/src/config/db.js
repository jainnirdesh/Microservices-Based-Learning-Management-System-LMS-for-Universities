const logger = require('./logger');
const { ensureSupabaseStorage } = require('../../../shared/supabaseDocumentStore');

const connectDB = async () => {
  try {
    await ensureSupabaseStorage();
    logger.info(`Supabase storage ready: ${process.env.SUPABASE_BUCKET || 'unicore-data'}`);
  } catch (error) {
    logger.error(`Supabase initialization error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
