"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Clock, Plus, X, ArrowUpRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getPartnershipsByUserId } from "@/lib/supabase/partnerships"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

export default function PartnershipsPage() {
  const { user, loading: authLoading } = useAuth()
  const [activePartnerships, setActivePartnerships] = useState<any[]>([])
  const [pendingPartnerships, setPendingPartnerships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadPartnerships() {
      if (!user) return

      try {
        const { data, error } = await getPartnershipsByUserId(user.id, user.user_type as "wholesaler" | "dropshipper")

        if (error) throw error

        // Split partnerships by status
        const active = data?.filter((p) => p.status === "active") || []
        const pending = data?.filter((p) => p.status === "pending") || []

        setActivePartnerships(active)
        setPendingPartnerships(pending)
      } catch (err) {
        console.error("Error loading partnerships:", err)
        toast({
          title: "Failed to load partnerships",
          description: "There was an error loading your partnerships",
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

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Partnerships</h1>
        <p className="text-muted-foreground">
          {user?.user_type === "dropshipper"
            ? "Manage your partnerships with wholesalers"
            : "Manage your partnerships with dropshippers"}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Partnerships</h2>
          <p className="text-sm text-muted-foreground">
            You have {activePartnerships.length} active partnerships and {pendingPartnerships.length} pending requests.
          </p>
        </div>
        <div className="flex gap-2">
          {user?.user_type === "dropshipper" && (
            <Button variant="outline" asChild>
              <Link href="/dashboard/partnerships/status">View Request Status</Link>
            </Button>
          )}
          <Button asChild>
            <Link
              href={
                user?.user_type === "dropshipper" ? "/dashboard/partnerships/find" : "/dashboard/partnerships/requests"
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              {user?.user_type === "dropshipper" ? "Find New Partners" : "View Partnership Requests"}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Partnerships</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {activePartnerships.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-muted-foreground">You don't have any active partnerships yet</p>
                <Button className="mt-4" asChild>
                  <Link
                    href={
                      user?.user_type === "dropshipper"
                        ? "/dashboard/partnerships/find"
                        : "/dashboard/partnerships/requests"
                    }
                  >
                    {user?.user_type === "dropshipper" ? "Find Partners" : "View Requests"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activePartnerships.map((partner) => (
                <Card key={partner.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage
                        src={
                          user?.user_type === "dropshipper"
                            ? partner.wholesaler?.avatar_url
                            : partner.dropshipper?.avatar_url
                        }
                      />
                      <AvatarFallback>
                        {(user?.user_type === "dropshipper"
                          ? partner.wholesaler?.full_name
                          : partner.dropshipper?.full_name
                        )
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {user?.user_type === "dropshipper"
                          ? partner.wholesaler?.full_name
                          : partner.dropshipper?.full_name}
                      </CardTitle>
                      <CardDescription>
                        Partner since {new Date(partner.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                      </div>
                      {partner.commission_rate && (
                        <div className="flex justify-between">
                          <span className="text-sm">Commission Rate:</span>
                          <span className="font-medium">{partner.commission_rate}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/partnerships/${partner.id}`}>View Details</Link>
                    </Button>
                    {user?.user_type === "dropshipper" && (
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/partnerships/${partner.id}/products`}>Browse Products</Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          {pendingPartnerships.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-muted-foreground">You don't have any pending partnership requests</p>
                <Button className="mt-4" asChild>
                  <Link
                    href={
                      user?.user_type === "dropshipper"
                        ? "/dashboard/partnerships/find"
                        : "/dashboard/partnerships/requests"
                    }
                  >
                    {user?.user_type === "dropshipper" ? "Find Partners" : "View Requests"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pendingPartnerships.map((partner) => (
                <Card key={partner.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage
                        src={
                          user?.user_type === "dropshipper"
                            ? partner.wholesaler?.avatar_url
                            : partner.dropshipper?.avatar_url
                        }
                      />
                      <AvatarFallback>
                        {(user?.user_type === "dropshipper"
                          ? partner.wholesaler?.full_name
                          : partner.dropshipper?.full_name
                        )
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {user?.user_type === "dropshipper"
                          ? partner.wholesaler?.full_name
                          : partner.dropshipper?.full_name}
                      </CardTitle>
                      <CardDescription>Requested {new Date(partner.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Pending
                        </Badge>
                      </div>
                      {partner.commission_rate && (
                        <div className="flex justify-between">
                          <span className="text-sm">Proposed Commission:</span>
                          <span className="font-medium">{partner.commission_rate}%</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {user?.user_type === "dropshipper"
                            ? "Awaiting approval from wholesaler"
                            : "Awaiting your approval"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link
                        href={
                          user?.user_type === "dropshipper"
                            ? "/dashboard/partnerships/status"
                            : `/dashboard/partnerships/requests`
                        }
                      >
                        {user?.user_type === "dropshipper" ? "Check Status" : "Review Request"}
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {user?.user_type === "wholesaler" && (
        <Card>
          <CardHeader>
            <CardTitle>Partnership Requests</CardTitle>
            <CardDescription>Requests from dropshippers to partner with you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPartnerships.length > 0 ? (
                pendingPartnerships.slice(0, 2).map((request) => (
                  <div key={request.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.dropshipper?.avatar_url} />
                      <AvatarFallback>
                        {request.dropshipper?.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{request.dropshipper?.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Requested {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="sr-only">Accept</span>
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Decline</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No pending partnership requests</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/partnerships/requests">View All Requests</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

