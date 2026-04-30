import express from "express";
import { supabaseAdmin } from "../lib/supabase.js";

const router = express.Router();

// GET PROFILE
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle(); //

    if (error) {
      console.log("ERROR:", error);
      return res.json(null); // 
    }

    res.json(data || null);
  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.json(null);
  }
});

// UPDATE PROFILE
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, alamat, no_hp } = req.body;

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id,
        nama,
        alamat,
        no_hp,
        updated_at: new Date(),
      })
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "Profile berhasil disimpan",
      data,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
