
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export const VideoModal = ({ isOpen, onClose, videoUrl, title = "Demo Video" }: VideoModalProps) => {
  // Convert Vimeo share URL to embed URL
  const getVimeoEmbedUrl = (url: string) => {
    // Extract video ID from Vimeo URL
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      const videoId = match[1];
      // Extract hash if present
      const hashMatch = url.match(/\/([a-f0-9]+)\?/);
      const hash = hashMatch ? hashMatch[1] : '';
      
      if (hash) {
        return `https://player.vimeo.com/video/${videoId}?h=${hash}&autoplay=1&title=0&byline=0&portrait=0`;
      }
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
    }
    return url;
  };

  const embedUrl = getVimeoEmbedUrl(videoUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-2">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={title}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
