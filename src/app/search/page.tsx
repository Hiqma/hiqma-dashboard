"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Search, FileText, ArrowLeft, Filter, Tag, User, Users, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

interface SearchResult {
  id: number | string
  title: string
  type: 'content' | 'category' | 'author' | 'user' | 'hub'
  description?: string
  subtitle?: string
  status?: string
  metadata?: string
}

// Mock global search - in real app, this would call your API
const useGlobalSearch = (query: string, filters: { type?: string; status?: string }) => {
  return useQuery({
    queryKey: ['global-search', query, filters],
    queryFn: async () => {
      if (!query || query.length < 2) return []
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const q = query.toLowerCase()
      
      // Mock data for all types
      const mockContent = [
        { id: 1, title: "Introduction to Mathematics", type: "content" as const, description: "A comprehensive guide to basic mathematical concepts", subtitle: "Math • Dr. Smith", status: "published" },
        { id: 2, title: "Basic English Grammar", type: "content" as const, description: "Essential grammar rules for beginners", subtitle: "English • Prof. Johnson", status: "draft" },
        { id: 3, title: "Science Fundamentals", type: "content" as const, description: "Core scientific principles explained", subtitle: "Science • Dr. Brown", status: "published" },
        { id: 4, title: "History of Africa", type: "content" as const, description: "Exploring African historical events", subtitle: "History • Prof. Davis", status: "review" },
      ]
      
      const mockCategories = [
        { id: 1, title: "Mathematics", type: "category" as const, description: "Mathematical concepts and problem solving", subtitle: "15 content items", metadata: "Active" },
        { id: 2, title: "English Language", type: "category" as const, description: "Language arts and literature", subtitle: "23 content items", metadata: "Active" },
        { id: 3, title: "Science", type: "category" as const, description: "Natural sciences and experiments", subtitle: "18 content items", metadata: "Active" },
        { id: 4, title: "History", type: "category" as const, description: "World and regional history", subtitle: "12 content items", metadata: "Active" },
      ]
      
      const mockAuthors = [
        { id: 1, title: "Dr. Smith", type: "author" as const, description: "Specializes in mathematics education with 15 years of experience", subtitle: "Mathematics Specialist", metadata: "6 publications" },
        { id: 2, title: "Prof. Johnson", type: "author" as const, description: "Expert in English literature and creative writing", subtitle: "English Literature", metadata: "12 publications" },
        { id: 3, title: "Dr. Brown", type: "author" as const, description: "Science educator focused on hands-on learning", subtitle: "Science Educator", metadata: "8 publications" },
      ]
      
      const mockUsers = [
        { id: 1, title: "John Admin", type: "user" as const, description: "System administrator with full access", subtitle: "admin@example.com", metadata: "Super Admin" },
        { id: 2, title: "Sarah Manager", type: "user" as const, description: "Manages content creation and review process", subtitle: "sarah@example.com", metadata: "Content Manager" },
        { id: 3, title: "Mike Contributor", type: "user" as const, description: "Creates educational content", subtitle: "mike@example.com", metadata: "Contributor" },
      ]
      
      const mockHubs = [
        { id: "hub-1", title: "Kampala Primary School", type: "hub" as const, description: "Primary education hub serving 500+ students", subtitle: "Uganda", metadata: "Online • 45 devices" },
        { id: "hub-2", title: "Nairobi Learning Center", type: "hub" as const, description: "Community learning center with digital resources", subtitle: "Kenya", metadata: "Online • 32 devices" },
        { id: "hub-3", title: "Lagos Education Hub", type: "hub" as const, description: "Urban education center with offline capabilities", subtitle: "Nigeria", metadata: "Offline • 28 devices" },
      ]
      
      // Filter all types
      let results: SearchResult[] = [
        ...mockContent.filter(item => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)),
        ...mockCategories.filter(item => item.title.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)),
        ...mockAuthors.filter(item => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)),
        ...mockUsers.filter(item => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)),
        ...mockHubs.filter(item => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)),
      ]

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        results = results.filter(item => item.type === filters.type)
      }
      if (filters.status && filters.status !== 'all') {
        results = results.filter(item => item.status === filters.status)
      }

      return results
    },
    enabled: query.length >= 2,
  })
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: searchResults = [], isLoading } = useGlobalSearch(query, {
    type: typeFilter,
    status: statusFilter,
  })

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    if (newQuery) {
      router.push(`/search?q=${encodeURIComponent(newQuery)}`)
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    switch (result.type) {
      case 'content':
        router.push(`/review-content/${result.id}`)
        break
      case 'category':
        router.push(`/categories`)
        break
      case 'author':
        router.push(`/authors/${result.id}`)
        break
      case 'user':
        router.push(`/users`)
        break
      case 'hub':
        router.push(`/edge-hubs/${result.id}`)
        break
    }
  }
  
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'content':
        return FileText
      case 'category':
        return Tag
      case 'author':
        return User
      case 'user':
        return Users
      case 'hub':
        return Server
      default:
        return FileText
    }
  }
  
  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'content':
        return 'Content'
      case 'category':
        return 'Category'
      case 'author':
        return 'Author'
      case 'user':
        return 'User'
      case 'hub':
        return 'Edge Hub'
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'review':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const types = ['all', 'content', 'category', 'author', 'user', 'hub']
  const statuses = ['all', 'published', 'draft', 'review']

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Search Results</h1>
          <p className="text-sm text-muted-foreground">
            {query ? `Showing results for "${query}"` : 'Enter a search query'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search content, categories, authors, users, edge hubs..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : getResultTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setTypeFilter('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {query.length >= 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isLoading ? 'Searching...' : `${searchResults.length} results found`}
            </h2>
          </div>

          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              Searching...
            </div>
          )}

          {!isLoading && searchResults.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search query or filters
                </p>
              </CardContent>
            </Card>
          )}

          {!isLoading && searchResults.length > 0 && (
            <div className="grid gap-4">
              {searchResults.map((item) => {
                const Icon = getResultIcon(item.type)
                return (
                  <Card
                    key={`${item.type}-${item.id}`}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleResultSelect(item)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="mt-1">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-semibold">{item.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {getResultTypeLabel(item.type)}
                              </Badge>
                              {item.status && (
                                <Badge variant={getStatusColor(item.status)} className="text-xs">
                                  {item.status}
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              {item.subtitle && (
                                <span className="flex items-center gap-1">
                                  {item.subtitle}
                                </span>
                              )}
                              {item.metadata && (
                                <span className="flex items-center gap-1">
                                  {item.metadata}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {query.length < 2 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start searching</h3>
            <p className="text-sm text-muted-foreground">
              Type at least 2 characters to search across all content, categories, authors, users, and edge hubs
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
