import { Request, Response } from 'express';

export class UTMCookieController {
  /**
   * Set UTM tracking cookies with Organic Override Logic
   * - Sponsored campaigns CAN override organic attribution
   * - Sponsored campaigns CANNOT override other sponsored campaigns (first-touch)
   * - 90-day fixed expiration from first touch (no refresh for preserves)
   * - Only reset expiration when actually setting NEW cookies
   */
  public setUTMCookies = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Extract UTM parameters from query string
      const {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        srd
      } = req.query as Record<string, string>;

      // STEP 1: Check existing cookies
      const existingCookies = {
        utmcampaign: req.cookies.utmcampaign,
        utmmedium: req.cookies.utmmedium,
        utmsource: req.cookies.utmsource,
        utmterm: req.cookies.utmterm,
        utmcontent: req.cookies.utmcontent,
        srd: req.cookies.srd
      };

      const hasExistingCookies = Object.values(existingCookies).some(value => value && value.trim() !== '');
      const hasNewUTMParams = utm_source || utm_medium || utm_campaign || utm_term || utm_content || srd;

      // STEP 2: Check if existing cookies are "Organic"
      const isExistingOrganic = hasExistingCookies && (
        existingCookies.utmsource === 'Organic' ||
        existingCookies.utmmedium === 'Organic' ||
        (existingCookies.utmcampaign && existingCookies.utmcampaign.includes('organic'))
      );

      // STEP 3: Cookie options - 90 days expiration (ONLY when setting NEW cookies)
      const cookieOptions = {
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
        httpOnly: false, // Allow JavaScript access for analytics
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax' as const, // CSRF protection while allowing cross-site navigation
        domain: process.env.NODE_ENV === 'production' ? '.aparnaconstructions.com' : undefined,
        path: '/' // Available on all paths
      };

      // STEP 4: Decision Logic
      
      if (hasExistingCookies && !isExistingOrganic) {
        // SCENARIO: User has NON-ORGANIC attribution (sponsored campaign)
        // PRESERVE existing attribution - no override allowed
        console.log('🔒 User has sponsored attribution - preserving first-touch');
        
        return res.json({
          success: true,
          message: 'Sponsored attribution preserved - no override allowed',
          action: 'preserved_sponsored_attribution',
          existingAttribution: {
            source: existingCookies.utmsource,
            medium: existingCookies.utmmedium,
            campaign: existingCookies.utmcampaign,
            term: existingCookies.utmterm,
            content: existingCookies.utmcontent,
            srd: existingCookies.srd
          },
          ignoredNewParams: hasNewUTMParams ? {
            utm_source,
            utm_medium,
            utm_campaign,
            utm_term,
            utm_content,
            srd
          } : null,
          note: 'Sponsored campaigns maintain first-touch priority with original expiration'
        });
      }

      if (isExistingOrganic && hasNewUTMParams) {
        // SCENARIO: User has ORGANIC attribution BUT new campaign UTMs present
        // OVERRIDE organic with new sponsored campaign
        console.log('🎯 Overriding organic attribution with new campaign');
        
        // Set NEW campaign cookies with FRESH 90-day expiration
        if (utm_campaign) res.cookie('utmcampaign', utm_campaign, cookieOptions);
        if (utm_medium) res.cookie('utmmedium', utm_medium, cookieOptions);
        if (utm_source) res.cookie('utmsource', utm_source, cookieOptions);
        if (utm_term) res.cookie('utmterm', utm_term, cookieOptions);
        if (utm_content) res.cookie('utmcontent', utm_content, cookieOptions);
        if (srd) res.cookie('srd', srd, cookieOptions);

        return res.json({
          success: true,
          message: 'Organic attribution overridden by sponsored campaign',
          action: 'organic_overridden_by_campaign',
          previousAttribution: {
            source: existingCookies.utmsource,
            medium: existingCookies.utmmedium,
            campaign: existingCookies.utmcampaign
          },
          newAttribution: {
            source: utm_source || '',
            medium: utm_medium || '',
            campaign: utm_campaign || '',
            term: utm_term || '',
            content: utm_content || '',
            srd: srd || ''
          },
          expiresIn: '90 days from now (fresh expiration)',
          note: 'Sponsored campaign override successful - new 90-day cycle started'
        });
      }

      if (isExistingOrganic && !hasNewUTMParams) {
        // SCENARIO: User has ORGANIC attribution and visiting page without UTMs
        // PRESERVE existing organic attribution (no expiration refresh)
        console.log('🌱 Preserving existing organic attribution');
        
        return res.json({
          success: true,
          message: 'Existing organic attribution preserved',
          action: 'preserved_organic_attribution',
          existingAttribution: {
            source: existingCookies.utmsource,
            medium: existingCookies.utmmedium,
            campaign: existingCookies.utmcampaign
          },
          note: 'Organic attribution maintained with original expiration'
        });
      }

      if (!hasExistingCookies && hasNewUTMParams) {
        // SCENARIO: NEW user via Campaign
        console.log('🎯 New user via campaign - setting campaign attribution');
        
        // Set campaign cookies with NEW 90-day expiration
        if (utm_campaign) res.cookie('utmcampaign', utm_campaign, cookieOptions);
        if (utm_medium) res.cookie('utmmedium', utm_medium, cookieOptions);
        if (utm_source) res.cookie('utmsource', utm_source, cookieOptions);
        if (utm_term) res.cookie('utmterm', utm_term, cookieOptions);
        if (utm_content) res.cookie('utmcontent', utm_content, cookieOptions);
        if (srd) res.cookie('srd', srd, cookieOptions);

        return res.json({
          success: true,
          message: 'New campaign attribution set',
          action: 'new_campaign_attribution',
          attribution: {
            source: utm_source || '',
            medium: utm_medium || '',
            campaign: utm_campaign || '',
            term: utm_term || '',
            content: utm_content || '',
            srd: srd || ''
          },
          expiresIn: '90 days from now',
          note: 'First-touch campaign attribution established'
        });
      }

      if (!hasExistingCookies && !hasNewUTMParams) {
        // SCENARIO: NEW user via Organic
        console.log('🌱 New user via organic - setting organic attribution');
        
        const defaultCookies = {
          utmcampaign: 'aparna-indi-orga-organic-organic-20181227-5833195',
          utmmedium: 'Organic',
          utmsource: 'Organic'
        };

        res.cookie('utmcampaign', defaultCookies.utmcampaign, cookieOptions);
        res.cookie('utmmedium', defaultCookies.utmmedium, cookieOptions);
        res.cookie('utmsource', defaultCookies.utmsource, cookieOptions);

        return res.json({
          success: true,
          message: 'New organic attribution set',
          action: 'new_organic_attribution',
          attribution: {
            source: defaultCookies.utmsource,
            medium: defaultCookies.utmmedium,
            campaign: defaultCookies.utmcampaign
          },
          expiresIn: '90 days from now',
          note: 'First-touch organic attribution established'
        });
      }

      // FALLBACK: Should never reach here
      return res.json({
        success: false,
        message: 'Unexpected state in UTM logic',
        debug: {
          hasExistingCookies,
          isExistingOrganic,
          hasNewUTMParams,
          existingCookies,
          newParams: { utm_source, utm_medium, utm_campaign, utm_term, utm_content, srd }
        }
      });

    } catch (error) {
      console.error('Error in UTM cookie handling:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process UTM cookies',
        error: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          'Internal server error'
      });
    }
  };

  /**
   * Get current UTM cookie values
   */
  public getUTMCookies = async (req: Request, res: Response): Promise<void> => {
    try {
      const cookies = {
        utmcampaign: req.cookies.utmcampaign || null,
        utmmedium: req.cookies.utmmedium || null,
        utmsource: req.cookies.utmsource || null,
        utmterm: req.cookies.utmterm || null,
        utmcontent: req.cookies.utmcontent || null,
        srd: req.cookies.srd || null
      };

      const hasAnyCookies = Object.values(cookies).some(value => value !== null);
      const isOrganic = cookies.utmsource === 'Organic' && cookies.utmmedium === 'Organic';
      
      let attributionType = 'none';
      if (hasAnyCookies) {
        attributionType = isOrganic ? 'organic' : 'sponsored';
      }

      res.json({
        success: true,
        attribution: cookies,
        attributionType,
        hasAttribution: hasAnyCookies,
        canBeOverridden: isOrganic,
        message: hasAnyCookies ? 
          `User has ${attributionType} attribution${isOrganic ? ' (can be overridden)' : ' (protected)'}` : 
          'No attribution data found'
      });

    } catch (error) {
      console.error('Error getting UTM cookies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get UTM cookies',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Internal server error'
      });
    }
  };

  /**
   * Clear all UTM cookies
   */
  public clearUTMCookies = async (req: Request, res: Response): Promise<void> => {
    try {
      const cookieNames = ['utmcampaign', 'utmmedium', 'utmsource', 'utmterm', 'utmcontent', 'srd'];
      
      const clearOptions = {
        domain: process.env.NODE_ENV === 'production' ? '.aparnaconstructions.com' : undefined,
        path: '/'
      };

      cookieNames.forEach(cookieName => {
        res.clearCookie(cookieName, clearOptions);
      });

      res.json({
        success: true,
        message: 'All UTM cookies cleared - user reset for new attribution cycle',
        clearedCookies: cookieNames,
        note: 'User can now receive fresh attribution (organic or campaign)'
      });

    } catch (error) {
      console.error('Error clearing UTM cookies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear UTM cookies',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Internal server error'
      });
    }
  };
}