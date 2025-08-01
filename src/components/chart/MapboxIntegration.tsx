import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink, Key, CheckCircle, AlertCircle } from 'lucide-react';

interface MapboxIntegrationProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string;
  isRequired?: boolean;
}

export const MapboxIntegration = ({ 
  onApiKeySet, 
  currentApiKey,
  isRequired = false 
}: MapboxIntegrationProps) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('mapbox_api_key');
    if (storedKey && !currentApiKey) {
      setApiKey(storedKey);
      validateApiKey(storedKey);
    }
  }, [currentApiKey]);

  const validateApiKey = async (key: string) => {
    if (!key || !key.startsWith('pk.')) {
      setValidationError('Mapbox API key must start with "pk."');
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await fetch(
        `https://api.mapbox.com/styles/v1/mapbox/light-v11?access_token=${key}`,
        { method: 'HEAD' }
      );

      if (response.ok) {
        setIsValid(true);
        localStorage.setItem('mapbox_api_key', key);
        onApiKeySet(key);
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      setValidationError('Invalid Mapbox API key. Please check your key and try again.');
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSetApiKey = () => {
    validateApiKey(apiKey);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    setIsValid(false);
    setValidationError(null);
    localStorage.removeItem('mapbox_api_key');
  };

  if (isValid && !isRequired) {
    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Mapbox configured successfully
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearApiKey}
              className="ml-auto"
            >
              Change Key
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isRequired ? "border-orange-200 dark:border-orange-800" : ""}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <CardTitle className="text-lg">Mapbox Configuration</CardTitle>
          {isRequired && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Required
            </Badge>
          )}
        </div>
        <CardDescription>
          Configure your Mapbox API key to enable map visualizations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Mapbox Public Token</label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <Button 
              onClick={handleSetApiKey}
              disabled={!apiKey || isValidating}
              className="shrink-0"
            >
              <Key className="h-4 w-4 mr-2" />
              {isValidating ? 'Validating...' : 'Set Key'}
            </Button>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm font-medium">Get your Mapbox API key:</span>
          </div>
          
          <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
            <li>Visit <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a></li>
            <li>Create a free account or sign in</li>
            <li>Go to your Account dashboard</li>
            <li>Copy your "Default public token"</li>
          </ol>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Free tier includes:</strong> 50,000 free map loads per month
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};