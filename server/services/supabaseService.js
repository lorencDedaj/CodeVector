// services/supabaseService.js
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // use service key on server
);

async function logInteraction({ jobId, question, answer }) {
  const { error } = await supabase.from("query_history").insert([
    {
      job_id: jobId,
      question,
      answer,
    },
  ]);
  if (error) console.error("Error logging interaction:", error.message);
}

module.exports = { logInteraction };
