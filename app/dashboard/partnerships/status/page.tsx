"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Clock, Store, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getPartnershipsByUserId } from "@/lib/supabase/partnerships"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

export default function PartnershipStatusPage() {
  const { user, loading: authLoading } = useAuth()
  const [partnerships, setPartnerships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }

    if (user && user.user_type !== "dropshipper" && user.user_type !== "admin") {
      toast({
        title: "Access denied",
        description: "Only dropshippers can view partnership status",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    async function loadPartnerships() {
      if (!user) return

      try {
        const { data, error } = await getPartnershipsByUserId(user.id, "dropshipper")

        if (error) throw error

        // Sort partnerships by status and date
        const sortedPartnerships =
          data?.sort((a, b) => {
            // First sort by status priority
            const statusPriority = { pending: 0, active: 1, rejected: 2, terminated: 3 }
            const statusDiff =
              statusPriority[a.status as keyof typeof statusPriority] -
              statusPriority[b.status as keyof typeof statusPriority]

            if (statusDiff !== 0) return statusDiff

            // Then sort by date (newest first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }) || []

        setPartnerships(sortedPartnerships)
      } catch (err) {
        console.error("Error loading partnerships:", err)
        toast({
          title: "Failed to load partnerships",
          description: "There was an error loading your partnership requests",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadPartnerships()
    }
  }, [user, toast])

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        )
      case "terminated":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Terminated
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center">
        <Link
          href="/dashboard/partnerships"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Partnerships
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Partnership Requests</h1>
        <p className="text-muted-foreground">Track the status of your partnership requests with wholesalers</p>
      </div>

      {partnerships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground">You haven't requested any partnerships yet</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/partnerships/find">Find Wholesalers</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {partnerships.filter((p) => p.status === "pending").length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {partnerships
                  .filter((p) => p.status === "pending")
                  .map((partnership) => (
                    <Card key={partnership.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={partnership.wholesaler.avatar_url} />
                              <AvatarFallback>
                                {partnership.wholesaler.full_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{partnership.wholesaler.full_name}</CardTitle>
                              <CardDescription>{partnership.wholesaler.email}</CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(partnership.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Requested on:</span>
                            <span className="text-sm">{new Date(partnership.created_at).toLocaleDateString()}</span>
                          </div>
                          {partnership.terms && (
                            <div>
                              <span className="text-sm font-medium">Proposed Terms:</span>
                              <p className="mt-1 text-sm">{partnership.terms}</p>
                            </div>
                          )}
                          {partnership.commission_rate && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Proposed Commission:</span>
                              <span className="text-sm">{partnership.commission_rate}%</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm mt-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Awaiting response from wholesaler</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {partnerships.filter((p) => p.status === "active").length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Partnerships</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {partnerships
                  .filter((p) => p.status === "active")
                  .map((partnership) => (
                    <Card key={partnership.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={partnership.wholesaler.avatar_url} />
                              <AvatarFallback>
                                {partnership.wholesaler.full_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{partnership.wholesaler.full_name}</CardTitle>
                              <CardDescription>{partnership.wholesaler.email}</CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(partnership.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Approved on:</span>
                            <span className="text-sm">{new Date(partnership.updated_at).toLocaleDateString()}</span>
                          </div>
                          {partnership.commission_rate && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Commission Rate:</span>
                              <span className="text-sm">{partnership.commission_rate}%</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-sm mt-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-green-700">Partnership active</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/dashboard/partnerships/${partnership.id}`}>
                            <Store className="mr-2 h-4 w-4" />
                            Browse Products
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {partnerships.filter((p) => p.status === "rejected" || p.status === "terminated").length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Rejected/Terminated Partnerships</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {partnerships
                  .filter((p) => p.status === "rejected" || p.status === "terminated")
                  .map((partnership) => (
                    <Card key={partnership.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={partnership.wholesaler.avatar_url} />
                              <AvatarFallback>
                                {partnership.wholesaler.full_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{partnership.wholesaler.full_name}</CardTitle>
                              <CardDescription>{partnership.wholesaler.email}</CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(partnership.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Updated on:</span>
                            <span className="text-sm">{new Date(partnership.updated_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm mt-2">
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-red-700">
                              {partnership.status === "rejected"
                                ? "Partnership request was rejected"
                                : "Partnership was terminated"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/dashboard/partnerships/find">Find Other Wholesalers</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button asChild>
          <Link href="/dashboard/partnerships/find">Find More Wholesalers</Link>
        </Button>
      </div>
    </div>
  )
}

