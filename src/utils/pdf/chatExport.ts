import jsPDF from 'jspdf';
import { createPDFConfig, addPDFFooter, checkPageBreak } from './pdfUtils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const exportAIChatToPDF = async (messages: Message[], fileName?: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const config = createPDFConfig(pdf);
  
  // Add header with logo and title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI Chat Conversation Export', config.margin, 25);
  
  // Add timestamp and file info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, config.margin, 35);
  if (fileName) {
    pdf.text(`Dataset: ${fileName}`, config.margin, 42);
  }
  
  // Add separator line
  pdf.setLineWidth(0.5);
  pdf.line(config.margin, 48, config.pageWidth - config.margin, 48);
  
  let yPosition = 60;
  const lineHeight = 6;
  const maxLineWidth = config.contentWidth - 20;
  
  // Filter out welcome messages and process chat
  const chatMessages = messages.filter(msg => msg.id !== 'welcome');
  
  chatMessages.forEach((message, index) => {
    // Check if we need a new page
    yPosition = checkPageBreak(pdf, config, yPosition);
    
    // Message header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const role = message.role === 'user' ? 'You' : 'AI Assistant';
    const timestamp = message.timestamp.toLocaleTimeString();
    pdf.text(`${role} - ${timestamp}`, config.margin + 5, yPosition);
    yPosition += 8;
    
    // Message content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(message.content, maxLineWidth);
    
    lines.forEach((line: string) => {
      yPosition = checkPageBreak(pdf, config, yPosition);
      pdf.text(line, config.margin + 10, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition += 5; // Space between messages
  });
  
  // Add footer
  addPDFFooter(pdf, config, 'Chartuvo AI Chat Export');
  
  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  const filePrefix = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'chat';
  pdf.save(`ai-chat-${filePrefix}-${timestamp}.pdf`);
};