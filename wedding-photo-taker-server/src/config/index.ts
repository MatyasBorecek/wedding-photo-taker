import {z} from "zod";
import {config as dotenvConfig} from "dotenv";

dotenvConfig();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().default('3030'),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/wedding-photo-taker"),
  JWT_SECRET: z.string().default("91aec4c2a20f7b4a4f958f524377a33535549ce192d43c2f282655ab0522f08b79a5890ab09ac674964e9387c2cc15e5815151e54ac2b83fca9a06199c3a21525328fe8271c476a8123d474e7500f68cad47a456f815a51cd9e87eb1e70d00211cf28bcf1556d1695250041dc404c61db4e3fadcc80440ce6c9961e88a58bf36c6e37f9bd018b5ff2ca90ec285e20a65b8d380fb36f4e93847848084560c6ab5de4e2e2f8a8d162fa00f462c148683e24f28ab8ca93630a401371eaf377aff5f2d8e0976fb61b6b0a006f55069adbc044c46656864c1600c43da2e632dcae55c9a6bb8873571983e3c1d2c37c98a5d446ecacdfd9c8578638314778cf2bc21ed"),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().default('10485760') // 10MB
});

export const appConfig = envSchema.parse(process.env);