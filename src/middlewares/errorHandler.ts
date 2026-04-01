import type { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  // Mongo duplicate key (unique index violation)
  if (err && err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate value",
      details: err.keyValue,
    });
  }

  const status = err?.status ?? 500;
  const message = err?.message ?? "Internal Server Error";
  res.status(status).json({ message });
}
