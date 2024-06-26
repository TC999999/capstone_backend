require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "postgresql:///market_test"
    : process.env.DATABASE_URL || "postgresql:///market";
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

const supabaseUrl = "https://iwyxashrshpdwjrvnnth.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXhhc2hyc2hwZHdqcnZubnRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg2MzQzNzcsImV4cCI6MjAzNDIxMDM3N30.GLEozH0OEJlfWikBWFr3mIclOhNHDSNZ0yKr9l-eFuc";
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  supabase,
};
