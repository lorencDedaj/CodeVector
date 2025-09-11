// controllers/historyController.js
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.getHistoryByJob = async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) return res.status(400).json({ error: "Missing jobId param" });

  const { data, error } = await supabase
    .from("query_history")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
