import type { Request, Response } from "express";
import type {
  EmergencySeverity,
  EmergencyStatus,
  EmergencyType,
} from "../models/EmergencyReport.model";
import * as emergencyService from "../services/emergency.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { parsePagination, parseQueryString } from "./utils/requestParsing";

export const reportEmergency = asyncHandler(
  async (req: Request, res: Response) => {
    const report = await emergencyService.reportEmergency(req.body);
    sendSuccess(res, 201, "Emergency reported successfully", { report });
  }
);

export const getEmergencyReportById = asyncHandler(
  async (req: Request, res: Response) => {
    const report = await emergencyService.getEmergencyReportById(
      req.params.id
    );
    sendSuccess(res, 200, "Emergency report fetched successfully", {
      report,
    });
  }
);

export const listEmergencyReportsByEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await emergencyService.listEmergencyReportsByEvent(
      req.params.eventId,
      {
        status: parseQueryString(req.query.status) as
          | EmergencyStatus
          | undefined,
        type: parseQueryString(req.query.type) as EmergencyType | undefined,
        severity: parseQueryString(req.query.severity) as
          | EmergencySeverity
          | undefined,
      },
      parsePagination(req)
    );
    sendSuccess(res, 200, "Emergency reports fetched successfully", result);
  }
);

export const listActiveEmergencies = asyncHandler(
  async (req: Request, res: Response) => {
    const reports = await emergencyService.listActiveEmergencies(
      req.params.eventId
    );
    sendSuccess(res, 200, "Active emergency reports fetched successfully", {
      reports,
    });
  }
);

export const updateEmergencyStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const report = await emergencyService.updateEmergencyStatus(
      req.params.id,
      req.body.status
    );
    sendSuccess(res, 200, "Emergency status updated successfully", {
      report,
    });
  }
);

export const getEventEmergencySummary = asyncHandler(
  async (req: Request, res: Response) => {
    const summary = await emergencyService.getEventEmergencySummary(
      req.params.eventId
    );
    sendSuccess(res, 200, "Event emergency summary fetched successfully", {
      summary,
    });
  }
);

export const deleteEmergencyReport = asyncHandler(
  async (req: Request, res: Response) => {
    await emergencyService.deleteEmergencyReport(req.params.id);
    sendSuccess(res, 200, "Emergency report deleted successfully");
  }
);
