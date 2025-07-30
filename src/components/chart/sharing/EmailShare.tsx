import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateChartDescription } from '../utils/chartDescriptionGenerator';
import { exportChart3D } from '../utils/chart3DExporter';

interface EmailShareProps {
  chartType: string;
  chartTitle: string;
  chartData: any;
  chartRef?: React.RefObject<HTMLElement>;
  is3D?: boolean;
  onClose: () => void;
}

export const EmailShare: React.FC<EmailShareProps> = ({
  chartType,
  chartTitle,
  chartData,
  chartRef,
  is3D,
  onClose
}) => {
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [subject, setSubject] = useState(`Chart Analysis: ${chartTitle}`);
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const emailTemplates = {
    professional: {
      name: 'Professional',
      subject: 'Data Analysis Report: {{title}}',
      greeting: 'Dear Colleague,',
      closing: 'Best regards,\n[Your Name]'
    },
    casual: {
      name: 'Casual',
      subject: 'Check out this chart: {{title}}',
      greeting: 'Hi there!',
      closing: 'Cheers,\n[Your Name]'
    },
    executive: {
      name: 'Executive Summary',
      subject: 'Executive Briefing: {{title}}',
      greeting: 'Dear Executive Team,',
      closing: 'Respectfully,\n[Your Name]'
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, value: string) => {
    const updated = [...recipients];
    updated[index] = value;
    setRecipients(updated);
  };

  const generateEmailContent = async () => {
    setIsGenerating(true);
    try {
      const selectedTemplate = emailTemplates[template as keyof typeof emailTemplates];
      const generatedContent = await generateChartDescription(
        chartType, 
        chartTitle, 
        chartData, 
        'email',
        template
      );
      
      setSubject(selectedTemplate.subject.replace('{{title}}', chartTitle));
      setMessage(`${selectedTemplate.greeting}\n\n${generatedContent}\n\n${selectedTemplate.closing}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate email content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    setIsSending(true);
    try {
      const validRecipients = recipients.filter(email => 
        email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      );

      if (validRecipients.length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one valid email address",
          variant: "destructive"
        });
        return;
      }

      let chartImageBase64 = '';
      
      if (chartRef?.current) {
        if (is3D) {
          const imageBlob = await exportChart3D(chartRef.current, { width: 800, height: 600 });
          const reader = new FileReader();
          chartImageBase64 = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(imageBlob);
          });
        } else {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(chartRef.current);
          chartImageBase64 = canvas.toDataURL('image/png');
        }
      }

      // Create mailto link with encoded content
      const mailtoLink = `mailto:${validRecipients.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message + '\n\n[Chart image attached separately]')}`;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      // Also download the chart image for manual attachment
      if (chartImageBase64) {
        const link = document.createElement('a');
        link.href = chartImageBase64;
        link.download = `${chartTitle.toLowerCase().replace(/\s+/g, '-')}-chart.png`;
        link.click();
      }

      toast({
        title: "Email Prepared",
        description: `Email client opened with ${validRecipients.length} recipient(s). Chart image downloaded for attachment.`
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to prepare email",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={template} onValueChange={setTemplate}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(emailTemplates).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={generateEmailContent} 
          disabled={isGenerating}
          variant="outline"
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Recipients</label>
          {recipients.map((recipient, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                type="email"
                value={recipient}
                onChange={(e) => updateRecipient(index, e.target.value)}
                placeholder="email@example.com"
                className="flex-1"
              />
              {recipients.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRecipient(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addRecipient}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Recipient
          </Button>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Email message..."
            className="min-h-40"
          />
        </div>
      </Card>

      <Button 
        onClick={sendEmail} 
        disabled={!subject.trim() || !message.trim() || isSending}
        className="w-full"
      >
        <Mail className="h-4 w-4 mr-2" />
        {isSending ? 'Preparing Email...' : 'Open Email Client'}
      </Button>
    </div>
  );
};