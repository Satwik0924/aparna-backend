import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Client from '../models/Client';
import { AuthRequest } from '../middleware/auth';

export class ClientController {
  async getClients(req: AuthRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (search) {
        where[Op.or] = [
          { companyName: { [Op.like]: `%${search}%` } },
          { contactEmail: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        where.isActive = status === 'active';
      }

      const { count, rows } = await Client.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['apiKey'] } // Don't expose API keys in list
      });

      res.json({
        success: true,
        data: {
          clients: rows,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            pages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch clients'
      });
    }
  }

  async getClient(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      res.json({
        success: true,
        data: client
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch client'
      });
    }
  }

  async createClient(req: AuthRequest, res: Response) {
    try {
      const clientData = req.body;

      const client = await Client.create(clientData);

      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: client
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create client'
      });
    }
  }

  async updateClient(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      await client.update(req.body);

      res.json({
        success: true,
        message: 'Client updated successfully',
        data: client
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update client'
      });
    }
  }

  async deleteClient(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      await client.destroy();

      res.json({
        success: true,
        message: 'Client deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete client'
      });
    }
  }

  async regenerateApiKey(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      const newApiKey = Client.generateApiKey();
      await client.update({ apiKey: newApiKey });

      res.json({
        success: true,
        message: 'API key regenerated successfully',
        data: { apiKey: newApiKey }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate API key'
      });
    }
  }

  async getClientAnalytics(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // TODO: Implement analytics data collection
      const analytics = {
        monthlyRequests: client.monthlyRequests,
        monthlyRequestsLimit: client.monthlyRequestsLimit,
        bandwidthUsage: client.bandwidthUsage,
        bandwidthLimit: client.bandwidthLimit,
        subscriptionPlan: client.subscriptionPlan,
        subscriptionActive: client.isSubscriptionActive(),
        // Add more analytics data as needed
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics'
      });
    }
  }
}