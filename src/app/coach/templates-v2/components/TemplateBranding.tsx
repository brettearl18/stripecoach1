import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PaintBrushIcon, PhotoIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  fontFamily: string;
  customCSS: string;
}

interface TemplateBrandingProps {
  initialBranding: BrandingConfig;
  onBrandingUpdate: (branding: BrandingConfig) => void;
}

const fontOptions = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Montserrat',
];

export function TemplateBranding({ initialBranding, onBrandingUpdate }: TemplateBrandingProps) {
  const [branding, setBranding] = useState<BrandingConfig>(initialBranding);

  useEffect(() => {
    onBrandingUpdate(branding);
  }, [branding, onBrandingUpdate]);

  const handleChange = (field: keyof BrandingConfig, value: string) => {
    setBranding((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newBranding = { ...branding, logo: e.target?.result as string };
      setBranding(newBranding);
      onBrandingUpdate(newBranding);
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Custom Branding</h2>
        <p className="text-gray-400">
          Customize the appearance of your templates
        </p>
      </div>

      <div className="space-y-8">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="flex-1"
                    placeholder="#4F46E5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="flex-1"
                    placeholder="#818CF8"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  type="text"
                  value={branding.logo}
                  onChange={(e) => handleChange('logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select
                  id="fontFamily"
                  value={branding.fontFamily}
                  onValueChange={(value) => handleChange('fontFamily', value)}
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <Label htmlFor="customCSS">Custom CSS</Label>
            <textarea
              id="customCSS"
              value={branding.customCSS}
              onChange={(e) => handleChange('customCSS', e.target.value)}
              className="w-full h-32 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Add custom CSS styles here..."
            />
          </div>
        </Card>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <Card className="p-6">
            <div
              className="space-y-4"
              style={{
                fontFamily: branding.fontFamily,
                '--primary-color': branding.primaryColor,
                '--secondary-color': branding.secondaryColor,
              } as React.CSSProperties}
            >
              {branding.logo && (
                <img
                  src={branding.logo}
                  alt="Template Logo"
                  className="h-12 object-contain"
                />
              )}
              <div className="space-y-2">
                <h4 className="text-xl font-semibold" style={{ color: branding.primaryColor }}>
                  Sample Template Header
                </h4>
                <p className="text-muted-foreground">
                  This is how your template will look with the selected branding.
                </p>
                <button
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Sample Button
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
} 