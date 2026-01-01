"use client";

import { useEffect } from "react";
import { db } from "@/lib/db";

export function DbInit() {
  useEffect(() => {
    void db.open();
  }, []);

  return null;
}
