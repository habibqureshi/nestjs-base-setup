import * as dotenv from 'dotenv';

// Load .env file before anything else
dotenv.config({ path: process.cwd() + 
    '/.local.env' 
    //   '/.production.env'
  }); 

export const APP_CONFIGS = {
  DB: {
      NAME: process.env.DB_NAME || "translation",
      URL: process.env.DB_URL || "mongodb://localhost:27017",
  },
  ENV: process.env.ENV || "TEST"
};