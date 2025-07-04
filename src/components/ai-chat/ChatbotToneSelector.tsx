import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Settings, Check } from 'lucide-react';
import { CHATBOT_TONES, ChatbotTone, DEFAULT_TONE_ID } from '@/lib/chatbotTones';

interface ChatbotToneSelectorProps {
  selectedToneId: string;
  onToneChange: (toneId: string) => void;
}

export const ChatbotToneSelector = ({ selectedToneId, onToneChange }: ChatbotToneSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTone = CHATBOT_TONES.find(tone => tone.id === selectedToneId);

  const handleToneSelect = (toneId: string) => {
    onToneChange(toneId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-3 w-3" />
          <span className="hidden sm:inline">Tone:</span>
          <span className="font-medium">{selectedTone?.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chatbot Tone Options</DialogTitle>
          <DialogDescription>
            Choose how the AI should communicate with you. Each tone is optimized for different use cases.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedToneId} onValueChange={handleToneSelect} className="space-y-4">
          {CHATBOT_TONES.map((tone) => (
            <div key={tone.id} className="flex items-start space-x-3">
              <RadioGroupItem value={tone.id} id={tone.id} className="mt-2" />
              <Label htmlFor={tone.id} className="flex-1 cursor-pointer">
                <Card className={`transition-colors ${
                  selectedToneId === tone.id 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                    : 'hover:bg-muted/50'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{tone.name}</CardTitle>
                        {tone.id === DEFAULT_TONE_ID && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                        {selectedToneId === tone.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {tone.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Best for:</p>
                        <p className="text-sm">{tone.useCase}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Characteristics:</p>
                        <div className="flex flex-wrap gap-1">
                          {tone.characteristics.map((characteristic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {characteristic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
};