'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, Image, Video, Music, Info } from 'lucide-react'

interface MediaItem {
  nasa_id: string
  title: string
  description: string
  media_type: string
  date_created: string
  center: string
  photographer?: string
  keywords: string[]
  href: string
}

interface NasaApiResponse {
  collection: {
    items: {
      data: [{
        nasa_id: string
        title: string
        description: string
        media_type: string
        date_created: string
        center: string
        photographer?: string
        keywords: string[]
      }]
      links: [{
        href: string
      }]
    }[]
  }
}

export default function NASAMediaLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [mediaType, setMediaType] = useState('image')
  const [results, setResults] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const searchMedia = async () => {
    if (!searchTerm) return

    setLoading(true)
    try {
      const response = await fetch(`https://images-api.nasa.gov/search?q=${searchTerm}&media_type=${mediaType}`)
      const data: NasaApiResponse = await response.json()

      const formattedResults: MediaItem[] = data.collection.items.map((item) => ({
        nasa_id: item.data[0].nasa_id,
        title: item.data[0].title,
        description: item.data[0].description,
        media_type: item.data[0].media_type,
        date_created: item.data[0].date_created,
        center: item.data[0].center,
        photographer: item.data[0].photographer,
        keywords: item.data[0].keywords,
        href: item.links[0].href
      }))

      setResults(formattedResults)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-6 h-6" />
      case 'video':
        return <Video className="w-6 h-6" />
      case 'audio':
        return <Music className="w-6 h-6" />
      default:
        return <Info className="w-6 h-6" />
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">NASA Image and Video Library</h1>
      <div className="flex space-x-2 mb-4">
        <Select value={mediaType} onValueChange={setMediaType}>
          <SelectTrigger className="w-[180px]">
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
          className="flex-grow"
        />
        <Button onClick={searchMedia} disabled={loading}>
          {loading ? 'Searching...' : <Search className="w-4 h-4 mr-2" />}
          Search
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((item) => (
            <Card key={item.nasa_id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video relative">
                  <img
                    src={item.href}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
                    {getMediaTypeIcon(item.media_type)}
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2 line-clamp-1">{item.title}</h2>
                  <p className="text-sm text-gray-500 mb-2">Center: {item.center}</p>
                  <p className="text-sm line-clamp-2">{item.description}</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      setSelectedItem(item)
                      setIsDialogOpen(true)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {selectedItem && (
              <div className="space-y-4">
                <img src={selectedItem.href} alt={selectedItem.title} className="w-full h-auto" />
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
        </DialogContent>
      </Dialog>
    </div>
  )
}