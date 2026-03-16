import { Router } from "express";

import { requireAuth } from "../middleware/auth";
import { assignSeat, clearSeat, clearTable, deleteTable, getTable, getTablePeople, getTables, postTable, putTable } from "../controllers/table.controller";

export const table = Router();

table.use(requireAuth);

table.get("/tables", getTables);
table.get("/tables/people", getTablePeople);
table.get("/tables/:id", getTable);

table.post("/tables", postTable);
table.put("/tables/:id", putTable);
table.delete("/tables/:id", deleteTable);

table.put("/tables/:tableId/seats/:seatNumber/assign", assignSeat);
table.delete("/tables/:tableId/seats/:seatNumber", clearSeat);
table.delete("/tables/:id/guests", clearTable);