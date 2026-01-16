"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, User, BookOpen, TrendingUp, Calendar, Globe, Award, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { authorsController } from "@/controllers/authorsController"
import Image from "next/image"

export default function AuthorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const authorId = params.id as string

  // Fetch author details
  const { data: author, isLoading: authorLoading } = useQuery({
    queryKey: ['author', authorId],
    queryFn: () => authorsController.getById(authorId),
  })

  // Fetch author stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['author-stats', authorId],
    queryFn: () => authorsController.getStats(authorId),
    enabled: !!author,
  })

  // Fetch author content
  const { data: content = [], isLoading: contentLoading } = useQuery({
    queryKey: ['author-content', authorId],
    queryFn: () => authorsController.getContent(authorId),
    enabled: !!author,
  })

  const isLoading = authorLoading || statsLoading || contentLoading

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-[300px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  if (!author) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Author not found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The author you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/authors')}>
              Back to Authors
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{author.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {author.nationality && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {author.nationality}
                  </span>
                )}
                {author.birthYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Born {author.birthYear}
                  </span>
                )}
                {author.isContributor && (
                  <Badge variant="default" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Contributor
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContent || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.publishedContent || 0} published, {stats?.draftContent || 0} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Years Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.yearsActive || 0}</div>
            <p className="text-xs text-muted-foreground">
              Years of contribution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Works</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.publishedContent || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available to students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content ? [...new Set(content.map((c: any) => c.category?.name).filter(Boolean))].length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Different subjects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Published Content</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Age Group</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.map((item: any) => (
                  <TableRow 
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/review-content/${item.id}`)}
                  >
                    <TableCell>
                      <div className="relative w-12 h-16 rounded overflow-hidden bg-muted flex items-center justify-center">
                        {item.coverImageUrl ? (
                          <Image
                            src={item.coverImageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category?.name || 'Uncategorized'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.ageGroup?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {content.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No content found for this author.
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {author.bio || 'No biography available.'}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Full Name</span>
                  <span className="text-sm font-medium">{author.name}</span>
                </div>
                {author.nationality && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nationality</span>
                    <span className="text-sm font-medium">{author.nationality}</span>
                  </div>
                )}
                {author.birthYear && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Birth Year</span>
                    <span className="text-sm font-medium">{author.birthYear}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Joined Date</span>
                  <span className="text-sm font-medium">
                    {new Date(author.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <Badge variant={author.isContributor ? 'default' : 'secondary'}>
                    {author.isContributor ? 'Contributor' : 'Author'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Publications</span>
                  <span className="text-sm font-medium">{stats?.publishedContent || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Works in Progress</span>
                  <span className="text-sm font-medium">{stats?.draftContent || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Years Active</span>
                  <span className="text-sm font-medium">{stats?.yearsActive || 0} years</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {content && [...new Set(content.map((c: any) => c.category?.name).filter(Boolean))].map((category: any) => (
                  <Badge key={category} variant="outline" className="text-sm">
                    {category}
                  </Badge>
                ))}
                {(!content || content.length === 0) && (
                  <p className="text-sm text-muted-foreground">No categories yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
