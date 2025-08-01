import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, ExternalLink } from 'lucide-react';

interface MapboxConfigProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string;
}

export const MapboxConfig = ({ onApiKeySet, currentApiKey }: MapboxConfigProps) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndSetApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationError('Please enter a Mapbox API key');
      return;
    }

    if (!apiKey.startsWith('pk.')) {
      setValidationError('Mapbox public keys should start with "pk."');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Test the API key with a simple request
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${apiKey}&limit=1`
      );

      if (response.ok) {
        onApiKeySet(apiKey);
        localStorage.setItem('mapbox_api_key', apiKey);
      } else {
        setValidationError('Invalid Mapbox API key. Please check your key and try again.');
      }
    } catch (error) {
      setValidationError('Failed to validate API key. Please check your internet connection.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Mapbox Configuration</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="apiKey">Mapbox Public API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="pk.eyJ1IjoieW91ciIsImEiOiJhcGkta2V5In0..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1"
          />
        </div>

        {validationError && (
          <Alert variant="destructive">
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={validateAndSetApiKey}
          disabled={isValidating || !apiKey.trim()}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Set API Key'}
        </Button>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>Don't have a Mapbox API key?</p>
          <a 
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Get your free API key from Mapbox
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="text-xs">
            The free tier includes 50,000 map loads per month.
          </p>
        </div>
      </div>
    </Card>
  );
};