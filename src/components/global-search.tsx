"use client"

import * as React from "react"
import { Search, FileText, ArrowRight, Tag, User, Users, Server } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  id: number | string
  title: string
  type: 'content' | 'category' | 'author' | 'user' | 'hub'
  subtitle?: string
  status?: string
  metadata?: string
}

// Mock global search - in real app, this would call your API
const useGlobalSearch = (query: string) => {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return []
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const q = query.toLowerCase()
      
      // Mock data for all types
      const mockContent = [
        { id: 1, title: "Introduction to Mathematics", type: "content" as const, subtitle: "Math • Dr. Smith", status: "published" },
        { id: 2, title: "Basic English Grammar", type: "content" as const, subtitle: "English • Prof. Johnson", status: "draft" },
        { id: 3, title: "Science Fundamentals", type: "content" as const, subtitle: "Science • Dr. Brown", status: "published" },
        { id: 4, title: "History of Africa", type: "content" as const, subtitle: "History • Prof. Davis", status: "review" },
      ]
      
      const mockCategories = [
        { id: 1, title: "Mathematics", type: "category" as const, subtitle: "15 content items", metadata: "Active" },
        { id: 2, title: "English Language", type: "category" as const, subtitle: "23 content items", metadata: "Active" },
        { id: 3, title: "Science", type: "category" as const, subtitle: "18 content items", metadata: "Active" },
        { id: 4, title: "History", type: "category" as const, subtitle: "12 content items", metadata: "Active" },
      ]
      
      const mockAuthors = [
        { id: 1, title: "Dr. Smith", type: "author" as const, subtitle: "Mathematics Specialist", metadata: "6 publications" },
        { id: 2, title: "Prof. Johnson", type: "author" as const, subtitle: "English Literature", metadata: "12 publications" },
        { id: 3, title: "Dr. Brown", type: "author" as const, subtitle: "Science Educator", metadata: "8 publications" },
      ]
      
      const mockUsers = [
        { id: 1, title: "John Admin", type: "user" as const, subtitle: "admin@example.com", metadata: "Super Admin" },
        { id: 2, title: "Sarah Manager", type: "user" as const, subtitle: "sarah@example.com", metadata: "Content Manager" },
        { id: 3, title: "Mike Contributor", type: "user" as const, subtitle: "mike@example.com", metadata: "Contributor" },
      ]
      
      const mockHubs = [
        { id: "hub-1", title: "Kampala Primary School", type: "hub" as const, subtitle: "Uganda", metadata: "Online • 45 devices" },
        { id: "hub-2", title: "Nairobi Learning Center", type: "hub" as const, subtitle: "Kenya", metadata: "Online • 32 devices" },
        { id: "hub-3", title: "Lagos Education Hub", type: "hub" as const, subtitle: "Nigeria", metadata: "Offline • 28 devices" },
      ]
      
      // Filter all types
      const results: SearchResult[] = [
        ...mockContent.filter(item => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)),
        ...mockCategories.filter(item => item.title.toLowerCase().includes(q)),
        ...mockAuthors.filter(item => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)),
        ...mockUsers.filter(item => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)),
        ...mockHubs.filter(item => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)),
      ]
      
      return results
    },
    enabled: query.length >= 2,
  })
}

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const { data: searchResults = [], isLoading } = useGlobalSearch(query)

  const handleResultSelect = (result: SearchResult) => {
    setOpen(false)
    setQuery("")
    
    // Navigate based on type
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
  
  // Group results by type
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  const handleViewAllResults = () => {
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.length >= 2) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === "Escape") {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

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

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.length >= 2) {
              handleViewAllResults()
            }
          }}
          placeholder="Search everything..."
          className="h-9 pl-9 pr-16 rounded-[0.5rem] bg-background text-sm"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      
      {open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpen(false)}
        />
      )}
      
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 w-full min-w-[600px] rounded-md border bg-popover shadow-md">
          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
            {query.length >= 2 && (
              <>
                {/* Grouped Results */}
                {searchResults.length > 0 && (
                  <div className="p-2">
                    {Object.entries(groupedResults).map(([type, results]) => {
                      const Icon = getResultIcon(type)
                      const displayResults = results.slice(0, 3)
                      
                      return (
                        <div key={type} className="mb-3 last:mb-0">
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Icon className="h-3 w-3" />
                            {getResultTypeLabel(type)} ({results.length})
                          </div>
                          {displayResults.map((item) => (
                            <button
                              key={`${item.type}-${item.id}`}
                              className="flex w-full items-center justify-between rounded-sm px-2 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground"
                              onClick={() => handleResultSelect(item)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="text-left min-w-0 flex-1">
                                  <div className="font-medium truncate">{item.title}</div>
                                  {item.subtitle && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      {item.subtitle}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {item.status && (
                                <Badge variant={getStatusColor(item.status)} className="text-xs ml-2 flex-shrink-0">
                                  {item.status}
                                </Badge>
                              )}
                              {item.metadata && !item.status && (
                                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                  {item.metadata}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                    {searchResults.length > 9 && (
                      <Button
                        variant="ghost"
                        className="w-full justify-between mt-2"
                        onClick={handleViewAllResults}
                      >
                        <span className="text-sm">View all {searchResults.length} results</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                
                {isLoading && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                )}
                
                {!isLoading && searchResults.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found for "{query}".
                  </div>
                )}
              </>
            )}
          </div>
          
          {query.length >= 2 && searchResults.length > 0 && (
            <div className="border-t p-2 bg-muted/50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={handleViewAllResults}
              >
                Press Enter or click to view full search results
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}