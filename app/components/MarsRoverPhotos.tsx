'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Rocket } from 'lucide-react'
import Image from 'next/image'

interface RoverPhoto {
    id: number
    img_src: string
    earth_date: string
    rover: {
        name: string
    }
    camera: {
        full_name: string
    }
}

const rovers = ['Curiosity', 'Opportunity', 'Spirit']
const cameras = [
    { value: 'FHAZ', label: 'Front Hazard Avoidance Camera' },
    { value: 'RHAZ', label: 'Rear Hazard Avoidance Camera' },
    { value: 'MAST', label: 'Mast Camera' },
    { value: 'CHEMCAM', label: 'Chemistry and Camera Complex' },
    { value: 'MAHLI', label: 'Mars Hand Lens Imager' },
    { value: 'MARDI', label: 'Mars Descent Imager' },
    { value: 'NAVCAM', label: 'Navigation Camera' },
    { value: 'PANCAM', label: 'Panoramic Camera' },
    { value: 'MINITES', label: 'Miniature Thermal Emission Spectrometer (Mini-TES)' },
]

interface MarsRoverPhotosProps {
    API_KEY: string
}

export default function MarsRoverPhotos({ API_KEY }: MarsRoverPhotosProps) {
    const [photos, setPhotos] = useState<RoverPhoto[]>([])
    const [rover, setRover] = useState('Curiosity')
    const [sol, setSol] = useState('')
    const [camera, setCamera] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)



    async function fetchPhotos() {
        setLoading(true)
        setError(null)
        setPhotos([]) // Clear previous photos
        let url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?api_key=${API_KEY}`

        if (sol) {
            url += `&sol=${sol}`
        } else {
            setError('Please enter a sol value.')
            setLoading(false)
            return
        }

        if (camera) {
            url += `&camera=${camera}`
        }

        try {
            const res = await fetch(url)
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            const data = await res.json()
            if (data.photos && Array.isArray(data.photos)) {
                setPhotos(data.photos)
                if (data.photos.length === 0) {
                    setError('No photos found for the given parameters.')
                }
            } else {
                throw new Error('Invalid data structure received from API')
            }
        } catch (error) {
            console.error('Error fetching Mars Rover photos:', error)
            setError('Failed to fetch Mars Rover photos. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-3/4 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Rocket className="mr-2 size-4" />
                            Mars Rover Photos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px]">
                            {photos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {photos.map((photo) => (
                                        <Card key={photo.id} className="overflow-hidden">
                                            <Image
                                                src={photo.img_src}
                                                alt={`Mars Rover Photo ${photo.id}`}
                                                width={400}
                                                height={400}
                                                className="w-full h-48 object-cover"
                                            />
                                            <CardContent className="p-4">
                                                <p className="font-semibold">{photo.camera.full_name}</p>
                                                <p className="text-sm text-gray-500">{photo.earth_date}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-4">
                                    {loading ? 'Loading...' : 'No photos available. Please select parameters and fetch Mars Rover photos.'}
                                </p>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
                {error && <p className="text-red-500">{error}</p>}
            </div>
            <div className="w-full lg:w-1/4">
                <Card className="sticky top-4">
                    <CardHeader>
                        <CardTitle>Mars Rover Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rover">Rover</Label>
                            <Select onValueChange={setRover} defaultValue={rover}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Rover" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rovers.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sol">Sol</Label>
                            <Input
                                id="sol"
                                type="number"
                                value={sol}
                                onChange={(e) => setSol(e.target.value)}
                                placeholder="Enter Sol (e.g., 1000)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="camera">Camera (Optional)</Label>
                            <Select onValueChange={setCamera}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Camera" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cameras.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={fetchPhotos} disabled={loading} className="w-full">
                            {loading ? 'Loading...' : 'Fetch Mars Rover Photos'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}