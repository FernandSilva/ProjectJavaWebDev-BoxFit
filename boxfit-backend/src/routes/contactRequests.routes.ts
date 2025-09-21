import { Router } from "express";
import * as ContactRequestsController from "../controllers/contactRequests.controller";

const router = Router();

const wrap =
  (fn: any) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* =============================================================================
   Contact Requests
============================================================================= */
router.post("/contact-requests", wrap(ContactRequestsController.createContactRequest));
router.get("/contact-requests", wrap(ContactRequestsController.listContactRequests));

export default router;
