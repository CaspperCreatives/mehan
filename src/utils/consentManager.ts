export interface ConsentData {
  hasConsented: boolean;
  consentDate: string | null;
  version: string;
}

export class ConsentManager {
  private static readonly CONSENT_KEY = 'linkedin-extension-consent';
  private static readonly CONSENT_DATE_KEY = 'linkedin-extension-consent-date';
  private static readonly CONSENT_VERSION_KEY = 'linkedin-extension-consent-version';
  private static readonly CURRENT_VERSION = '1.0';

  /**
   * Check if user has given consent
   */
  static hasConsent(): boolean {
    try {
      const consent = localStorage.getItem(this.CONSENT_KEY);
      const version = localStorage.getItem(this.CONSENT_VERSION_KEY);
      
      // If no consent or version mismatch, consider no consent
      if (!consent || version !== this.CURRENT_VERSION) {
        return false;
      }
      
      return consent === 'true';
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }

  /**
   * Get full consent data
   */
  static getConsentData(): ConsentData {
    try {
      const hasConsented = this.hasConsent();
      const consentDate = localStorage.getItem(this.CONSENT_DATE_KEY);
      const version = localStorage.getItem(this.CONSENT_VERSION_KEY) || 'unknown';
      
      return {
        hasConsented,
        consentDate,
        version
      };
    } catch (error) {
      console.error('Error getting consent data:', error);
      return {
        hasConsented: false,
        consentDate: null,
        version: 'unknown'
      };
    }
  }

  /**
   * Set user consent
   */
  static setConsent(consent: boolean): void {
    try {
      localStorage.setItem(this.CONSENT_KEY, consent.toString());
      localStorage.setItem(this.CONSENT_DATE_KEY, new Date().toISOString());
      localStorage.setItem(this.CONSENT_VERSION_KEY, this.CURRENT_VERSION);
    } catch (error) {
      console.error('Error setting consent:', error);
    }
  }

  /**
   * Revoke consent
   */
  static revokeConsent(): void {
    try {
      localStorage.removeItem(this.CONSENT_KEY);
      localStorage.removeItem(this.CONSENT_DATE_KEY);
      localStorage.removeItem(this.CONSENT_VERSION_KEY);
    } catch (error) {
      console.error('Error revoking consent:', error);
    }
  }

  /**
   * Check if consent is expired (older than 1 year)
   */
  static isConsentExpired(): boolean {
    try {
      const consentDate = localStorage.getItem(this.CONSENT_DATE_KEY);
      if (!consentDate) return true;
      
      const consentTime = new Date(consentDate).getTime();
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      
      return consentTime < oneYearAgo;
    } catch (error) {
      console.error('Error checking consent expiration:', error);
      return true;
    }
  }

  /**
   * Check if consent is valid (exists, not expired, and current version)
   */
  static isConsentValid(): boolean {
    return this.hasConsent() && !this.isConsentExpired();
  }
}
