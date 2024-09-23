'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Calendar, Image as ImageIcon, Loader, Info, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Image from 'next/image'

interface EPICImageryProps {
  API_KEY: string
}

interface ImageMetadata {
  identifier: string
  caption: string
  image: string
  version: string
  centroid_coordinates: {
    lat: number
    lon: number
  }
  date: string
}

export default function EPICImagery({ API_KEY }: EPICImageryProps) {
  const [imageType, setImageType] = useState<'natural' | 'enhanced'>('natural')
  const [date, setDate] = useState<string>('')
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [images, setImages] = useState<ImageMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAvailableDates()
  }, [imageType])

  const fetchAvailableDates = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`https://api.nasa.gov/EPIC/api/${imageType}/all?api_key=${API_KEY}`)
      if (!response.ok) throw new Error('Failed to fetch available dates')
      const dates = await response.json()
      setAvailableDates(dates)
      if (dates.length > 0) {
        setDate(dates[0])
      }
    } catch (error) {
      setError('Error fetching available dates')
      console.error('Error fetching available dates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchImagesForDate = async () => {
    if (!date) {
      setError('Please select a date')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`https://api.nasa.gov/EPIC/api/${imageType}/date/${date}?api_key=${API_KEY}`)
      if (!response.ok) throw new Error('Failed to fetch images')
      const imagesData = await response.json()
      setImages(imagesData)
      setCurrentImageIndex(0)
    } catch (error) {
      setError('Error fetching images for the selected date')
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const getImageUrl = (image: ImageMetadata) => {
    const [year, month, day] = image.date.split(' ')[0].split('-')
    return `https://epic.gsfc.nasa.gov/archive/${imageType}/${year}/${month}/${day}/png/${image.image}.png`
  }

  const formatDate = (dateString: string) => {
    const [datePart, timePart] = dateString.split(' ')
    const [year, month, day] = datePart.split('-')
    return `${month}-${day}-${year} ${timePart}`
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-6 w-6" />
          NASA EPIC Imagery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            {images.length > 0 ? (
              <div className="relative">
                <Image
                  src={getImageUrl(images[currentImageIndex])}
                  alt={images[currentImageIndex].caption}
                  width={800}
                  height={800}
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2">
                  <Button variant="outline" size="icon" onClick={handlePrevImage} className="rounded-full">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNextImage} className="rounded-full">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
            {images.length > 0 && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Image Information
                </h3>
                <p>Date: {formatDate(images[currentImageIndex].date)}</p>
                <p>Caption: {images[currentImageIndex].caption}</p>
                <p>Coordinates: Lat {images[currentImageIndex].centroid_coordinates.lat.toFixed(2)}, Lon {images[currentImageIndex].centroid_coordinates.lon.toFixed(2)}</p>
              </div>
            )}
          </div>
          <div className="w-full md:w-1/3 space-y-6">
            <div>
              <Label htmlFor="imageType" className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4" />
                Image Type
              </Label>
              <Select value={imageType} onValueChange={(value: 'natural' | 'enhanced') => setImageType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select image type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={handleDateChange}
                max={availableDates[0]}
                min={availableDates[availableDates.length - 1]}
              />
            </div>
            <Button onClick={fetchImagesForDate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Images...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Images
                </>
              )}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}