"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, Clock, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getPartnerships, respondToPartnershipRequest } from "@/lib/supabase/partnerships"
import { getUserProfile } from "@/lib/supabase/auth"

export default function PartnershipsPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activePartnerships, setActivePartnerships] = useState<any[]>([])
  const [pendingPartnerships, setPendingPartnerships] = useState<any[]>([])
  const [incomingRequests, setIncomingRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profile = await getUserProfile()
        setUserProfile(profile)

        // Fetch active partnerships
        const activeData = await getPartnerships({
          status: "active",
          role: profile.user_type as "dropshipper" | "wholesaler",
        })
        setActivePartnerships(activeData || [])

        // Fetch pending partnerships (outgoing requests)
        const pendingData = await getPartnerships({
          status: "pending",
          role: profile.user_type as "dropshipper" | "wholesaler",
        })
        setPendingPartnerships(pendingData || [])

        // Fetch incoming requests (for wholesalers only)
        if (profile.user_type === "wholesaler") {
          const incomingData = await getPartnerships({
            status: "pending",
            role: "wholesaler",
          })
          setIncomingRequests(incomingData || [])
        }
      } catch (error) {
        console.error("Error fetching partnerships:", error)
        toast({
          title: "Error",
          description: "Failed to load partnerships. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleAcceptRequest = async (partnershipId: string) => {
    try {
      await respondToPartnershipRequest(partnershipId, true)

      // Update local state
      const updatedRequest = incomingRequests.find((req) => req.id === partnershipId)
      if (updatedRequest) {
        setIncomingRequests(incomingRequests.filter((req) => req.id !== partnershipId))
        setActivePartnerships([...activePartnerships, { ...updatedRequest, status: "active" }])
      }

      toast({
        title: "Partnership accepted",
        description: "You have successfully accepted the partnership request.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept partnership. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRejectRequest = async (partnershipId: string) => {
    try {
      await respondToPartnershipRequest(partnershipId, false)

      // Update local state
      setIncomingRequests(incomingRequests.filter((req) => req.id !== partnershipId))

      toast({
        title: "Partnership rejected",
        description: "You have rejected the partnership request.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject partnership. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const userType = userProfile?.user_type || "customer"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Partnerships</h1>
        <p className="text-muted-foreground">
          {userType === "dropshipper"
            ? "Manage your partnerships with wholesalers."
            : "Manage your partnerships with dropshippers."}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Partnerships</h2>
          <p className="text-sm text-muted-foreground">
            You have {activePartnerships.length} active partnerships and {pendingPartnerships.length} pending requests.
          </p>
        </div>
        {userType === "dropshipper" && (
          <Button asChild>
            <Link href="/dashboard/partnerships/find">
              <Plus className="mr-2 h-4 w-4" />
              Find New Partners
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Partnerships</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {activePartnerships.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activePartnerships.map((partner) => {
                const partnerData = userType === "dropshipper" ? partner.wholesaler : partner.dropshipper

                return (
                  <Card key={partner.id}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-md">
                        {partnerData.avatar_url ? (
                          <img
                            src={partnerData.avatar_url || "/placeholder.svg"}
                            alt={partnerData.full_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <span className="text-2xl font-bold text-muted-foreground">
                              {partnerData.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle>{partnerData.full_name}</CardTitle>
                        <CardDescription>
                          Partner since {new Date(partner.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Commission Rate:</span>
                          <span className="font-medium">{partner.commission_rate}%</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/partnerships/${partner.id}`}>View Details</Link>
                      </Button>
                      {userType === "dropshipper" && (
                        <Button variant="outline" asChild>
                          <Link href={`/dashboard/partnerships/${partner.id}/products`}>Browse Products</Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="text-muted-foreground">No active partnerships</div>
              <p className="text-sm text-muted-foreground">
                {userType === "dropshipper"
                  ? "Start by finding wholesalers to partner with."
                  : "Wait for dropshippers to request partnerships with you."}
              </p>
              {userType === "dropshipper" && (
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/partnerships/find">Find Partners</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          {pendingPartnerships.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pendingPartnerships.map((partner) => {
                const partnerData = userType === "dropshipper" ? partner.wholesaler : partner.dropshipper

                return (
                  <Card key={partner.id}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-md">
                        {partnerData.avatar_url ? (
                          <img
                            src={partnerData.avatar_url || "/placeholder.svg"}
                            alt={partnerData.full_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <span className="text-2xl font-bold text-muted-foreground">
                              {partnerData.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle>{partnerData.full_name}</CardTitle>
                        <CardDescription>Requested {new Date(partner.created_at).toLocaleDateString()}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Proposed Commission:</span>
                          <span className="font-medium">{partner.commission_rate}%</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {userType === "dropshipper"
                              ? "Awaiting approval from wholesaler"
                              : "Awaiting your approval"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/dashboard/partnerships/${partner.id}`}>View Request</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="text-muted-foreground">No pending requests</div>
              <p className="text-sm text-muted-foreground">
                {userType === "dropshipper"
                  ? "You have not sent any partnership requests."
                  : "You have no pending partnership requests to review."}
              </p>
              {userType === "dropshipper" && (
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/partnerships/find">Find Partners</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {userType === "wholesaler" && incomingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Partnership Requests</CardTitle>
            <CardDescription>Requests from dropshippers to partner with you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incomingRequests.map((request) => (
                <div key={request.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="h-16 w-16 overflow-hidden rounded-md">
                    {request.dropshipper.avatar_url ? (
                      <img
                        src={request.dropshipper.avatar_url || "/placeholder.svg"}
                        alt={request.dropshipper.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-2xl font-bold text-muted-foreground">
                          {request.dropshipper.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{request.dropshipper.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Commission Rate: {request.commission_rate}%</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="sr-only">Accept</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Decline</span>
                    </Button>
                  </div>
                </div>
              ))}
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

