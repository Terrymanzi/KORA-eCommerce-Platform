"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getPartnershipsByUserId, updatePartnership } from "@/lib/supabase/partnerships"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export default function PartnershipRequestsPage() {
  const { user, loading: authLoading } = useAuth()
  const [partnerships, setPartnerships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }

    if (user && user.user_type !== "wholesaler" && user.user_type !== "admin") {
      toast({
        title: "Access denied",
        description: "Only wholesalers can view partnership requests",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    async function loadPartnerships() {
      if (!user) return

      try {
        const { data, error } = await getPartnershipsByUserId(user.id, "wholesaler")

        if (error) throw error

        // Filter to only show pending requests
        const pendingPartnerships = data?.filter((p) => p.status === "pending") || []
        setPartnerships(pendingPartnerships)
      } catch (err) {
        console.error("Error loading partnerships:", err)
        toast({
          title: "Failed to load requests",
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

  const handleUpdatePartnership = async (id: string, status: "active" | "rejected") => {
    try {
      const { error } = await updatePartnership(id, { status })

      if (error) throw error

      // Update local state
      setPartnerships((prev) => prev.filter((p) => p.id !== id))

      toast({
        title: status === "active" ? "Partnership accepted" : "Partnership rejected",
        description:
          status === "active"
            ? "You have successfully accepted the partnership request"
            : "You have rejected the partnership request",
      })
    } catch (err) {
      console.error("Error updating partnership:", err)
      toast({
        title: "Failed to update partnership",
        description: "There was an error updating the partnership status",
        variant: "destructive",
      })
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
        <p className="text-muted-foreground">Manage incoming partnership requests from dropshippers</p>
      </div>

      {partnerships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-muted-foreground">You have no pending partnership requests</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {partnerships.map((partnership) => (
            <Card key={partnership.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={partnership.dropshipper.avatar_url} />
                      <AvatarFallback>
                        {partnership.dropshipper.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{partnership.dropshipper.full_name}</CardTitle>
                      <CardDescription>{partnership.dropshipper.email}</CardDescription>
                    </div>
                  </div>
                  <Badge>Pending</Badge>
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleUpdatePartnership(partnership.id, "rejected")}>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={() => handleUpdatePartnership(partnership.id, "active")}>
                  <Check className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

