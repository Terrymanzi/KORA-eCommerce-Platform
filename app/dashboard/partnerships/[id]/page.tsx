"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Edit, Trash, UserCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  getPartnershipById,
  updateCommissionRate,
  terminatePartnership,
  respondToPartnershipRequest,
} from "@/lib/supabase/partnerships"
import { getUserProfile } from "@/lib/supabase/auth"

export default function PartnershipDetailsPage({ params }: { params: { id: string } }) {
  const [partnership, setPartnership] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newCommissionRate, setNewCommissionRate] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isTerminating, setIsTerminating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profile = await getUserProfile()
        setUserProfile(profile)

        // Fetch partnership details
        const partnershipData = await getPartnershipById(params.id)
        setPartnership(partnershipData)
        setNewCommissionRate(partnershipData.commission_rate.toString())
      } catch (error) {
        console.error("Error fetching partnership:", error)
        toast({
          title: "Error",
          description: "Failed to load partnership details. Please try again.",
          variant: "destructive",
        })
        router.push("/dashboard/partnerships")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router, toast])

  const handleUpdateCommission = async () => {
    setIsUpdating(true)
    try {
      const rate = Number.parseFloat(newCommissionRate)
      if (isNaN(rate) || rate <= 0 || rate > 100) {
        throw new Error("Commission rate must be between 0 and 100")
      }

      await updateCommissionRate(partnership.id, rate)

      // Update local state
      setPartnership({
        ...partnership,
        commission_rate: rate,
      })

      setIsEditing(false)

      toast({
        title: "Commission updated",
        description: "The commission rate has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update commission rate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTerminatePartnership = async () => {
    setIsTerminating(true)
    try {
      await terminatePartnership(partnership.id)

      toast({
        title: "Partnership terminated",
        description: "The partnership has been terminated successfully.",
      })

      router.push("/dashboard/partnerships")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to terminate partnership. Please try again.",
        variant: "destructive",
      })
      setIsTerminating(false)
    }
  }

  const handleAcceptPartnership = async () => {
    setIsUpdating(true)
    try {
      await respondToPartnershipRequest(partnership.id, true)

      // Update local state
      setPartnership({
        ...partnership,
        status: "active",
      })

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
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRejectPartnership = async () => {
    setIsUpdating(true)
    try {
      await respondToPartnershipRequest(partnership.id, false)

      toast({
        title: "Partnership rejected",
        description: "You have rejected the partnership request.",
      })

      router.push("/dashboard/partnerships")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject partnership. Please try again.",
        variant: "destructive",
      })
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!partnership) {
    return (
      <div className="flex flex-col gap-6">
        <div className="mb-4">
          <Link
            href="/dashboard/partnerships"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Partnerships
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Partnership not found</h1>
          <p className="mt-2 text-muted-foreground">
            The partnership you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/partnerships">Back to Partnerships</Link>
          </Button>
        </div>
      </div>
    )
  }

  const userType = userProfile?.user_type || "customer"
  const partnerData = userType === "dropshipper" ? partnership.wholesaler : partnership.dropshipper
  const isWholesaler = userType === "wholesaler"
  const isPending = partnership.status === "pending"
  const isActive = partnership.status === "active"

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-4">
        <Link
          href="/dashboard/partnerships"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Partnerships
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Partnership Details</h1>
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isPending
                ? "bg-yellow-100 text-yellow-800"
                : isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {partnership.status.charAt(0).toUpperCase() + partnership.status.slice(1)}
          </div>
        </div>
        <p className="text-muted-foreground">
          {isPending
            ? `Partnership request ${isWholesaler ? "from" : "to"} ${partnerData.full_name}`
            : `Your partnership with ${partnerData.full_name}`}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Partner Information</CardTitle>
            <CardDescription>{isWholesaler ? "Dropshipper details" : "Wholesaler details"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full">
                {partnerData.avatar_url ? (
                  <img
                    src={partnerData.avatar_url || "/placeholder.svg"}
                    alt={partnerData.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <span className="text-2xl font-bold text-muted-foreground">{partnerData.full_name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">{partnerData.full_name}</h3>
                <p className="text-muted-foreground capitalize">{isWholesaler ? "Dropshipper" : "Wholesaler"}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{partnerData.email || "Not available"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{partnerData.phone || "Not available"}</span>
              </div>
            </div>

            {partnerData.bio && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Bio:</h3>
                  <p className="text-sm">{partnerData.bio}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partnership Details</CardTitle>
            <CardDescription>
              {isPending ? "Details of the partnership request" : "Details of your active partnership"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span
                  className={`${
                    isPending ? "text-yellow-500" : isActive ? "text-green-500" : "text-red-500"
                  } font-medium`}
                >
                  {partnership.status.charAt(0).toUpperCase() + partnership.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(partnership.created_at).toLocaleDateString()}</span>
              </div>
              {isActive && (
                <div className="flex justify-between">
                  <span className="font-medium">Last Updated:</span>
                  <span>{new Date(partnership.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Commission Rate:</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newCommissionRate}
                      onChange={(e) => setNewCommissionRate(e.target.value)}
                      className="w-20"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span>%</span>
                  </div>
                ) : (
                  <span>{partnership.commission_rate}%</span>
                )}
              </div>
              {isActive && !isEditing && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-3 w-3" />
                    Edit Rate
                  </Button>
                </div>
              )}
              {isEditing && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleUpdateCommission} disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Save"}
                  </Button>
                </div>
              )}
            </div>

            {isPending && (
              <>
                <Separator />
                <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {isWholesaler
                      ? "This dropshipper has requested to partner with you. You can accept or reject this request."
                      : "Your partnership request is pending approval from the wholesaler."}
                  </span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            {isPending && isWholesaler && (
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={handleRejectPartnership} disabled={isUpdating}>
                  Reject Request
                </Button>
                <Button className="flex-1" onClick={handleAcceptPartnership} disabled={isUpdating}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Accept Request
                </Button>
              </div>
            )}

            {isActive && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash className="mr-2 h-4 w-4" />
                    Terminate Partnership
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Terminate Partnership</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to terminate this partnership? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleTerminatePartnership} disabled={isTerminating}>
                      {isTerminating ? "Terminating..." : "Terminate Partnership"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>
      </div>

      {isActive && userType === "dropshipper" && (
        <Card>
          <CardHeader>
            <CardTitle>Partner Products</CardTitle>
            <CardDescription>Browse and add products from this wholesaler to your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-muted-foreground">View all products from this wholesaler to add to your store.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href={`/dashboard/partnerships/${partnership.id}/products`}>Browse Partner Products</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

