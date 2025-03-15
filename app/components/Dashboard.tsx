'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Copy, Cpu, Earth, Image, Orbit, Rocket, Satellite, TvMinimalPlay, Menu } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import APODDisplay from './APODDisplay'
import NEODisplay from './NEODisplay'
import TechTransfer from './TechTransfer'
import NASAMediaLibrary from './NASAMediaLibrary'
import MarsRoverPhotos from './MarsRoverPhotos'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import EarthImagery from './EarthImagery'
import EPICImagery from './EPICImagery'
import CustomButton from '@/components/AuthorButton'

const tabs = [
    { name: 'APOD', icon: Image },
    { name: 'NEO', icon: Rocket },
    { name: 'Tech Transfer', icon: Cpu },
    { name: 'Image and Videos', icon: TvMinimalPlay },
    { name: 'MARS Rover Photos', icon: Orbit },
    { name: 'Earth Imagery', icon: Earth },
    { name: 'EPIC Imagery', icon: Satellite },
]

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('APOD')
    const [apiKey, setApiKey] = useState('')
    const [inputApiKey, setInputApiKey] = useState('')
    const [isApiKeySet, setIsApiKeySet] = useState(false)
    const { toast } = useToast()
    const [isCopied, setIsCopied] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        const storedApiKey = localStorage.getItem('nasaApiKey')
        if (storedApiKey) {
            setApiKey(storedApiKey)
            setIsApiKeySet(true)
        }
    }, [])

    const handleApiKeySubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (inputApiKey) {
            localStorage.setItem('nasaApiKey', inputApiKey)
            setApiKey(inputApiKey)
            setIsApiKeySet(true)
            toast({
                title: "API Key Saved",
                description: "Your NASA API key has been successfully saved.",
            })
        }
    }

    const copyApiKey = () => {
        navigator.clipboard.writeText("gaCPPaW0CEkZK1lpls0CDBTbXOZz7eIxh06Rrd62")
        setIsCopied(true)
        toast({
            title: "API Key Copied",
            description: "The API key has been copied to your clipboard.",
        })
        setTimeout(() => setIsCopied(false), 2000)
    }

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputApiKey(e.target.value)
    }

    const handleClearApiKey = () => {
        localStorage.removeItem('nasaApiKey')
        setApiKey('')
        setInputApiKey('')
        setIsApiKeySet(false)
        toast({
            title: "API Key Cleared",
            description: "Your NASA API key has been removed.",
        })
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const renderContent = () => {
        if (!isApiKeySet) {
            return (
                <Card className="w-full max-w-md mx-auto mt-8">
                    <CardContent className="p-6">
                        <Alert className="mb-4">
                            <AlertDescription>
                                <p>You can use this API key:</p>
                                <div className='flex flex-wrap gap-2 items-center'>
                                    <Badge variant="secondary" className="mb-2 mt-2 break-all">
                                        gaCPPaW0CEkZK1lpls0CDBTbXOZz7eIxh06Rrd62
                                    </Badge>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 rounded-full"
                                        onClick={copyApiKey}
                                    >
                                        {isCopied ? (
                                            <Check className="h-3 w-3" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                        <span className="sr-only">
                                            {isCopied ? "Copied" : "Copy API Key"}
                                        </span>
                                    </Button>
                                </div>
                                <p>However, you may experience issues with daily request limits. To create your own key, visit: <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" className="underline">https://api.nasa.gov/</a></p>
                            </AlertDescription>
                        </Alert>
                        <form onSubmit={handleApiKeySubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="apiKey">NASA API Key</Label>
                                <Input
                                    id="apiKey"
                                    type="text"
                                    value={inputApiKey}
                                    onChange={handleApiKeyChange}
                                    placeholder="Enter your NASA API Key"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">Save API Key</Button>
                        </form>
                    </CardContent>
                </Card>
            )
        }

        return (
            <Card>
                <CardContent className="p-6">
                    {activeTab === 'APOD' && <APODDisplay API_KEY={apiKey} />}
                    {activeTab === 'NEO' && <NEODisplay API_KEY={apiKey} />}
                    {activeTab === 'Tech Transfer' && <TechTransfer API_KEY={apiKey} />}
                    {activeTab === 'Image and Videos' && <NASAMediaLibrary />}
                    {activeTab === 'MARS Rover Photos' && <MarsRoverPhotos API_KEY={apiKey} />}
                    {activeTab === 'Earth Imagery' && <EarthImagery API_KEY={apiKey} />}
                    {activeTab === 'EPIC Imagery' && <EPICImagery API_KEY={apiKey} />}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100">
            {/* Mobile menu button */}
            <div className="md:hidden p-4 bg-white shadow-md">
                <Button onClick={toggleSidebar} variant="outline" className="w-full flex justify-between items-center">
                    <span>Menu</span>
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white shadow-md h-screen flex flex-col`}>
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-gray-800">NASA Dashboard</h1>
                </div>
                <div className="flex-1 flex flex-col gap-2  h-[calc(100vh-200px)]  overflow-auto">
                    <nav className="mt-4">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.name}
                                variant={activeTab === tab.name ? 'default' : 'ghost'}
                                className={`w-full justify-start px-4 py-2 text-left ${activeTab === tab.name ? 'text-white' : 'text-gray-600'}`}
                                onClick={() => {
                                    setActiveTab(tab.name)
                                    setIsSidebarOpen(false)
                                }}
                            >
                                <tab.icon className={`mr-2 size-4 ${activeTab === tab.name ? 'text-white' : 'text-gray-600'}`} />
                                {tab.name}
                            </Button>
                        ))}
                    </nav>
                    {isApiKeySet && (
                        <div className="p-4">
                            <Button onClick={handleClearApiKey} variant="outline" className="w-full">
                                Clear API Key
                            </Button>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <CustomButton />
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-auto">
                {renderContent()}
            </div>
        </div>
    )
}

