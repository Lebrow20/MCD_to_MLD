import { Router } from "express";
import type { McdModel } from "@mcd-to-mld/shared";
import { validateMcdOrThrow } from "../services/validateMcd.js";
import { generateMld } from "../services/generateMld.js";

export const mldRouter = Router();

mldRouter.post("/generate", (req, res) => {
  const mcd = req.body as McdModel;

  try {
    validateMcdOrThrow(mcd);
    const mld = generateMld(mcd);
    res.json(mld);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});