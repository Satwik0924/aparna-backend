import { Request, Response } from "express";
import { Op } from "sequelize";
import SellDoLead from "../models/SellDoLead";
import { AuthRequest } from "../middleware/auth";

interface SellDoSubmissionData {
  firstName: string;
  lastName: string; // Now mandatory
  email: string;
  phoneNumber: string;
  age?: number; // ADD BACK
  pinCode?: string;
  propertyType: string;
  project: string; // Now mandatory
  budget: string; // Now mandatory
  timeFrame: string;
  unitType?: string; // Now mandatory
  sellDoProjectId: string; // Already mandatory
  resumeUrl?: string; // NEW: Resume URL field
  message?: string;
  srd?: string; 
  // UTM Parameters
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  utmNetwork?: string;
  utmDevice?: string;
}

class SellDoLeadController {
  public submitLead = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const leadData: SellDoSubmissionData = req.body;
      const clientId = req.user?.clientId;
      

      if (!clientId) {
        res.status(400).json({
          success: false,
          message: "Client ID not found in authentication",
        });
        return;
      }

      // All fields are now mandatory (UTMs and resumeUrl are optional)
      const requiredFields = [
        "firstName",
        "email",
        "phoneNumber",
        // "propertyType",
        // "project",
        // "budget",
        // // "timeFrame",
        // "sellDoProjectId",
      ];
      const missingFields = requiredFields.filter(
        (field) => !leadData[field as keyof SellDoSubmissionData]
      );

      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
        return;
      }

      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      const sourceUrl = req.get("Referer") || req.get("Origin") || "direct";

      let sellDoResponse: any = null;
      let sellDoStatus: "success" | "failed" = "failed";

      try {
        sellDoResponse = await this.submitToSellDoAPI(leadData, sourceUrl);
        sellDoStatus = "success";
        console.log("✅ SellDo submission successful:", sellDoResponse);
      } catch (sellDoError) {
        console.error("❌ SellDo API submission failed:", sellDoError);
        sellDoResponse = {
          error:
            sellDoError instanceof Error
              ? sellDoError.message
              : "Unknown error",
          timestamp: new Date().toISOString(),
        };
      }

      const savedLead = await SellDoLead.create({
        clientId, // From authentication, not request body
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phoneNumber: leadData.phoneNumber,
        age: leadData.age, // ADD BACK
        pinCode: leadData.pinCode, //
        propertyType: leadData.propertyType,
        project: leadData.project,
        budget: leadData.budget,
        timeFrame: leadData.timeFrame,
        unitType: leadData.unitType, // ADD THIS
        message: leadData.message,
        sellDoProjectId: leadData.sellDoProjectId,

        // NEW: Save resume URL
        resumeUrl: leadData.resumeUrl || undefined,
        srd: leadData.srd || undefined,

        sellDoResponse,
        sellDoStatus,
        sourceUrl,
        ipAddress,

        // UTM Parameters
        utmSource: leadData.utmSource || undefined,
        utmMedium: leadData.utmMedium || undefined,
        utmCampaign: leadData.utmCampaign || undefined,
        utmTerm: leadData.utmTerm || undefined,
        utmContent: leadData.utmContent || undefined,
        utmNetwork: leadData.utmNetwork || undefined,
        utmDevice: leadData.utmDevice || undefined,
      });

      res.status(201).json({
        success: true,
        message: "Lead submitted successfully",
        data: {
          leadId: savedLead.id,
          sellDoStatus,
          sellDoResponse,
          savedToDatabase: true,
          submittedAt: savedLead.createdAt,
          resumeSubmitted: !!leadData.resumeUrl, // NEW: Indicate if resume was submitted
          utmData: {
            source: leadData.utmSource,
            medium: leadData.utmMedium,
            campaign: leadData.utmCampaign,
            term: leadData.utmTerm,
            content: leadData.utmContent,
            network: leadData.utmNetwork,
            device: leadData.utmDevice,
          },
        },
      });
    } catch (error) {
      console.error("Error in submitLead:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getAllLeads = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        propertyType,
        sellDoStatus,
        startDate,
        endDate,
        utmSource,
        utmMedium,
        utmCampaign,
        hasResume, // NEW: Filter by resume availability
      } = req.query;

      const clientId = req.user?.clientId;
      const whereClause: any = {};

      if (clientId) {
        whereClause.clientId = clientId;
      }

      if (propertyType) {
        whereClause.propertyType = propertyType;
      }

      if (sellDoStatus) {
        whereClause.sellDoStatus = sellDoStatus;
      }

      // NEW: Filter by resume availability
      if (hasResume !== undefined) {
        if (hasResume === "true") {
          whereClause.resumeUrl = { [Op.ne]: null };
        } else if (hasResume === "false") {
          whereClause.resumeUrl = { [Op.is]: null };
        }
      }

      // UTM filters
      if (utmSource) {
        whereClause.utmSource = utmSource;
      }

      if (utmMedium) {
        whereClause.utmMedium = utmMedium;
      }

      if (utmCampaign) {
        whereClause.utmCampaign = utmCampaign;
      }

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt[Op.gte] = new Date(startDate as string);
        }
        if (endDate) {
          whereClause.createdAt[Op.lte] = new Date(endDate as string);
        }
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const { rows: leads, count: totalCount } =
        await SellDoLead.findAndCountAll({
          where: whereClause,
          order: [[sortBy as string, sortOrder as string]],
          limit: limitNum,
          offset: offset,
          attributes: {
            exclude: ["sellDoResponse", "email", "phoneNumber"],
          },
        });

      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.status(200).json({
        success: true,
        data: {
          leads,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalCount,
            limit: limitNum,
            hasNextPage,
            hasPrevPage,
          },
        },
      });
    } catch (error) {
      console.error("Error in getAllLeads:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getLeadById = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const clientId = req.user?.clientId;

      const whereClause: any = { id };
      if (clientId) {
        whereClause.clientId = clientId;
      }

      const lead = await SellDoLead.findOne({
        where: whereClause,
        attributes: {
          exclude: ["email", "phoneNumber"],
        },
      });

      if (!lead) {
        res.status(404).json({
          success: false,
          message: "Lead not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          ...lead.toJSON(),
          sellDoResponse: lead.sellDoResponse,
          hasResume: !!lead.resumeUrl, // NEW: Indicate if resume is available
        },
      });
    } catch (error) {
      console.error("Error in getLeadById:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getLeadsStats = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const clientId = req.user?.clientId;

      const whereClause: any = {};
      if (clientId) {
        whereClause.clientId = clientId;
      }

      const totalLeads = await SellDoLead.count({ where: whereClause });

      const successfulSubmissions = await SellDoLead.count({
        where: { ...whereClause, sellDoStatus: "success" },
      });

      const failedSubmissions = await SellDoLead.count({
        where: { ...whereClause, sellDoStatus: "failed" },
      });

      // NEW: Resume statistics
      const leadsWithResume = await SellDoLead.count({
        where: { ...whereClause, resumeUrl: { [Op.ne]: null } },
      });

      const leadsByPropertyType = await SellDoLead.findAll({
        where: whereClause,
        attributes: [
          "propertyType",
          [
            SellDoLead.sequelize!.fn("COUNT", SellDoLead.sequelize!.col("id")),
            "count",
          ],
        ],
        group: ["propertyType"],
        raw: true,
      });

      // UTM Analytics
      const leadsByUtmSource = await SellDoLead.findAll({
        where: {
          ...whereClause,
          utmSource: {
            [Op.ne]: null,
          },
        },
        attributes: [
          "utmSource",
          [
            SellDoLead.sequelize!.fn("COUNT", SellDoLead.sequelize!.col("id")),
            "count",
          ],
        ],
        group: ["utmSource"],
        raw: true,
      });

      const leadsByUtmMedium = await SellDoLead.findAll({
        where: {
          ...whereClause,
          utmMedium: {
            [Op.ne]: null,
          },
        },
        attributes: [
          "utmMedium",
          [
            SellDoLead.sequelize!.fn("COUNT", SellDoLead.sequelize!.col("id")),
            "count",
          ],
        ],
        group: ["utmMedium"],
        raw: true,
      });

      const leadsByUtmCampaign = await SellDoLead.findAll({
        where: {
          ...whereClause,
          utmCampaign: {
            [Op.ne]: null,
          },
        },
        attributes: [
          "utmCampaign",
          [
            SellDoLead.sequelize!.fn("COUNT", SellDoLead.sequelize!.col("id")),
            "count",
          ],
        ],
        group: ["utmCampaign"],
        raw: true,
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentLeads = await SellDoLead.count({
        where: {
          ...whereClause,
          createdAt: {
            [Op.gte]: sevenDaysAgo,
          },
        },
      });

      res.status(200).json({
        success: true,
        data: {
          totalLeads,
          successfulSubmissions,
          failedSubmissions,
          successRate:
            totalLeads > 0
              ? ((successfulSubmissions / totalLeads) * 100).toFixed(2)
              : "0",
          recentLeads,

          // NEW: Resume statistics
          leadsWithResume,
          resumeRate:
            totalLeads > 0
              ? ((leadsWithResume / totalLeads) * 100).toFixed(2)
              : "0",

          leadsByPropertyType,
          utmAnalytics: {
            leadsByUtmSource,
            leadsByUtmMedium,
            leadsByUtmCampaign,
          },
        },
      });
    } catch (error) {
      console.error("Error in getLeadsStats:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  private submitToSellDoAPI = async (
    leadData: SellDoSubmissionData,
    sourceUrl: string
  ): Promise<any> => {
     const defaultSrd = "6437c5d68eb6d80c3c74bf5e";
  const srdToUse = leadData.srd || defaultSrd;
    const sellDoData = new URLSearchParams({
      api_key: "16fdd3221feb05bb665f51a59530b439",
      "sell_do[campaign][srd]": srdToUse,
      "sell_do[analytics][utm_source]": leadData.utmSource || "",
      "sell_do[analytics][utm_medium]": leadData.utmMedium || "",
      "sell_do[analytics][utm_campaign]": leadData.utmCampaign || "",
      "sell_do[analytics][utm_term]": leadData.utmTerm || "",
      "sell_do[analytics][utm_network]": leadData.utmNetwork || "",
      "sell_do[analytics][utm_device]": leadData.utmDevice || "",
      "sell_do[analytics][landing_page_url]": sourceUrl,
      "sell_do[form][lead][name]":`${leadData.firstName} ${leadData.lastName}`.trim(),
      "sell_do[form][lead][email]": leadData.email,
      "sell_do[form][lead][phone]": leadData.phoneNumber,
      "sell_do[form][lead][project_id]": leadData.sellDoProjectId,
      // "sell_do[form][custom][how_soon_are_you_trying_to_buy]":
      //   leadData.timeFrame,
      // "sell_do[form][custom][custom_budget]": leadData.budget,
    });

    // NEW: Add resume URL if available
    if (leadData.resumeUrl) {
      sellDoData.append(
        "sell_do[form][custom][resume_url]",
        leadData.resumeUrl
      );
    }

    if (leadData.unitType) {
      sellDoData.append(
        "sell_do[form][custom][custom_unit_type]",
        leadData.unitType
      );
    }

    // Add message if provided
    if (leadData.message) {
      sellDoData.append("sell_do[form][note][content]", leadData.message);
    }

    const response = await fetch("https://app.sell.do/api/leads/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: sellDoData,
    });

    if (!response.ok) {
      throw new Error(
        `SellDo API Error: ${response.status} - ${response.statusText}`
      );
    }

    const result = await response.text();

    try {
      return JSON.parse(result);
    } catch {
      return {
        response: result,
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
      };
    }
  };
}

export default new SellDoLeadController();
