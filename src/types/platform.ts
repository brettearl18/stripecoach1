export interface RegionalSettings {
  id: string;
  language: {
    default: string;
    available: string[];
    fallback: string;
  };
  timezone: {
    default: string;
    format: string;
    available: string[];
  };
  dateFormat: {
    short: string;
    long: string;
    time: string;
  };
  currency: {
    code: string;
    symbol: string;
    format: string;
  };
  compliance: {
    gdpr: boolean;
    ccpa: boolean;
    hipaa: boolean;
    custom: Record<string, boolean>;
  };
  localization: {
    enabled: boolean;
    defaultLocale: string;
    availableLocales: string[];
    autoDetect: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WhiteLabelSettings {
  id: string;
  branding: {
    logo: {
      primary: string;
      secondary: string;
      favicon: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      fontFamily: string;
      headingFont: string;
      bodyFont: string;
    };
  };
  domain: {
    customDomain: string;
    subdomain: string;
    sslEnabled: boolean;
  };
  email: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    signature: string;
  };
  content: {
    companyName: string;
    tagline: string;
    footer: string;
    termsUrl: string;
    privacyUrl: string;
  };
  features: {
    customLogin: boolean;
    customDashboard: boolean;
    customReports: boolean;
    customBranding: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
} 