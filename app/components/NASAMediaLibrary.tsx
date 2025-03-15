import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; 
import Image from 'next/image';
import { ImageIcon, Video, Music, File, Search } from 'lucide-react';

interface MediaItem {
  nasa_id: string;
  title: string;
  description: string;
  media_type: 'image' | 'video' | 'audio';
  date_created: string;
  center: string;
  photographer?: string;
  keywords: string[];
  thumbnailHref: string;
  mediaHref?: string;
}

interface NasaApiResponse {
  collection: {
    items: {
      data: {
        nasa_id: string;
        title: string;
        description?: string;
        media_type: 'image' | 'video' | 'audio';
        date_created: string;
        center: string;
        photographer?: string;
        keywords?: string[];
      }[];
      links?: { rel: string; href: string }[];
    }[];
  };
}

const SearchGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  const searchMedia = async () => {
    if (!searchTerm) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://images-api.nasa.gov/search?q=${searchTerm}&media_type=${mediaType}`
      );
      const data: NasaApiResponse = await response.json();

      const formattedResults: MediaItem[] = data.collection.items.map((item) => {
        const thumbnailHref = item.links?.find((link) => link.rel === 'preview')?.href || '';
        let mediaHref: string | undefined;

        if (item.data[0].media_type === 'image') {
          mediaHref =
            item.links?.find((link) => link.href.includes('~large'))?.href ||
            thumbnailHref ||
            item.links?.[0]?.href ||
            '';
        } else {
          mediaHref = undefined;
        }

        return {
          nasa_id: item.data[0].nasa_id,
          title: item.data[0].title,
          description: item.data[0].description || 'No description available',
          media_type: item.data[0].media_type,
          date_created: item.data[0].date_created,
          center: item.data[0].center,
          photographer: item.data[0].photographer,
          keywords: item.data[0].keywords || [],
          thumbnailHref: thumbnailHref || '',
          mediaHref,
        };
      });

      setResults(formattedResults);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaUrl = async (item: MediaItem) => {
    if (item.media_type === 'image' || item.mediaHref) return;

    setMediaLoading(true);
    try {
      const response = await fetch(`https://images-api.nasa.gov/asset/${item.nasa_id}`);
      const assetData = await response.json();
      const mediaUrl = assetData.collection.items.find((asset: { href: string }) =>
        item.media_type === 'audio'
          ? asset.href.endsWith('.mp3') || asset.href.endsWith('.m4a')
          : item.media_type === 'video'
            ? asset.href.endsWith('.mp4')
            : false
      )?.href || '';
      setSelectedItem({ ...item, mediaHref: mediaUrl });
    } catch (error) {
      console.error('Error fetching media URL:', error);
      setSelectedItem({ ...item, mediaHref: '' });
    } finally {
      setMediaLoading(false);
    }
  };

  const handleViewDetails = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
    if (item.media_type !== 'image' && !item.mediaHref) {
      fetchMediaUrl(item);
    }
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'audio':
        return <Music className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">NASA Image and Video Library</h1>
      <div className="grid grid-cols-6 gap-1 mb-4 ">
        <Select value={mediaType} onValueChange={setMediaType}>
          <SelectTrigger className="col-span-2 md:col-span-1 rounded-md">
            <SelectValue placeholder="Media type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Enter search term"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow rounded-md col-span-4 md:col-span-4 "
        />
        <Button onClick={searchMedia} disabled={loading} className="rounded-md col-span-6 md:col-span-1">
          {loading ? 'Searching...' : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>

      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((item) => (
          <Card key={item.nasa_id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video relative w-full bg-gray-200 flex items-center justify-center">
                {item.thumbnailHref ? (
                  <Image
                    src={item.thumbnailHref}
                    alt={item.title}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500">{getMediaTypeIcon(item.media_type)}</div>
                )}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
                  {getMediaTypeIcon(item.media_type)}
                </div>
              </div>
              <div className="p-4">
                <h1 className="text-lg font-semibold mb-2 line-clamp-1">{item.title}</h1>
                <p className="text-sm text-gray-500 mb-2">Center: {item.center}</p>
                <p className="text-sm line-clamp-2">{item.description}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => handleViewDetails(item)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl w-full max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-auto">
            <DialogDescription className="p-4">
              {selectedItem && (
                <div className="space-y-4">
                  {selectedItem.media_type === 'image' && (
                    <Image
                      src={selectedItem.mediaHref || selectedItem.thumbnailHref}
                      alt={selectedItem.title}
                      width={500}
                      height={500}
                      className="w-full h-auto"
                    />
                  )}
                  {selectedItem.media_type === 'video' && (
                    mediaLoading ? (
                      <p>Loading video...</p>
                    ) : selectedItem.mediaHref ? (
                      <video src={selectedItem.mediaHref} controls className="w-full" />
                    ) : (
                      <p>Video not available</p>
                    )
                  )}
                  {selectedItem.media_type === 'audio' && (
                    mediaLoading ? (
                      <p>Loading audio...</p>
                    ) : selectedItem.mediaHref ? (
                      <audio src={selectedItem.mediaHref} controls className="w-full" />
                    ) : (
                      <p>Audio not available</p>
                    )
                  )}
                  <p><strong>Date Created:</strong> {new Date(selectedItem.date_created).toLocaleDateString()}</p>
                  <p><strong>Center:</strong> {selectedItem.center}</p>
                  {selectedItem.photographer && <p><strong>Photographer:</strong> {selectedItem.photographer}</p>}
                  <p><strong>Description:</strong> {selectedItem.description}</p>
                  <div>
                    <strong>Keywords:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedItem.keywords.map((keyword, index) => (
                        <span key={index} className="bg-gray-200 px-2 py-1 rounded text-sm">{keyword}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchGrid;