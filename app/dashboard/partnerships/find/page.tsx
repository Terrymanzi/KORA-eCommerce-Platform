"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Search, Store, UserPlus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getProfiles } from "@/lib/supabase/auth"
import { checkPartnershipExists, createPartnership } from "@/lib/supabase/partnerships"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function FindPartnershipsPage() {
  const { user, loading: authLoading } = useAuth()
  const [wholesalers, setWholesalers] = useState<any[]>([])
  const [filteredWholesalers, setFilteredWholesalers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedWholesaler, setSelectedWholesaler] = useState<any>(null)
  const [partnershipTerms, setPartnershipTerms] = useState("")
  const [commissionRate, setCommissionRate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }

    if (user && user.user_type !== "dropshipper" && user.user_type !== "admin") {
      toast({
        title: "Access denied",
        description: "Only dropshippers can find partnerships",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    async function loadWholesalers() {
      if (!user) return

      try {
        const { data, error } = await getProfiles("wholesaler")

        if (error) throw error

        // Filter out wholesalers that already have partnerships with this user
        const filteredData = await Promise.all(
          data?.map(async (wholesaler) => {
            const { exists } = await checkPartnershipExists(wholesaler.id, user.id)
            return { ...wholesaler, hasPartnership: exists }
          }) || [],
        )

        setWholesalers(filteredData)
        setFilteredWholesalers(filteredData)
      } catch (err) {
        console.error("Error loading wholesalers:", err)
        toast({
          title: "Failed to load wholesalers",
          description: "There was an error loading the list of wholesalers",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadWholesalers()
    }
  }, [user, toast])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredWholesalers(wholesalers)
    } else {
      const filtered = wholesalers.filter(
        (wholesaler) =>
          wholesaler.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (wholesaler.bio && wholesaler.bio.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredWholesalers(filtered)
    }
  }, [searchTerm, wholesalers])

  const handleRequestPartnership = (wholesaler: any) => {
    setSelectedWholesaler(wholesaler)
    setDialogOpen(true)
  }

  const handleSubmitRequest = async () => {
    if (!user || !selectedWholesaler) return

    setIsSubmitting(true)

    try {
      const partnershipData = {
        wholesaler_id: selectedWholesaler.id,
        dropshipper_id: user.id,
        status: "pending",
        terms: partnershipTerms || null,
        commission_rate: commissionRate ? Number.parseFloat(commissionRate) : null,
      }

      const { error } = await createPartnership(partnershipData)

      if (error) throw error

      toast({
        title: "Partnership requested",
        description: `Your partnership request has been sent to ${selectedWholesaler.full_name}`,
      })

      // Update local state
      setWholesalers((prev) => prev.map((w) => (w.id === selectedWholesaler.id ? { ...w, hasPartnership: true } : w)))

      // Close dialog and reset form
      setDialogOpen(false)
      setPartnershipTerms("")
      setCommissionRate("")
      setSelectedWholesaler(null)
    } catch (err) {
      console.error("Error requesting partnership:", err)
      toast({
        title: "Failed to request partnership",
        description: "There was an error sending your partnership request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
        <h1 className="text-3xl font-bold">Find Wholesalers</h1>
        <p className="text-muted-foreground">Discover and connect with wholesalers to expand your product offerings</p>
      </div>

      <div className="mb-6 flex w-full max-w-sm items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search wholesalers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredWholesalers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-muted-foreground">No wholesalers found</p>
            <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
              Clear search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWholesalers.map((wholesaler) => (
            <Card key={wholesaler.id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={wholesaler.avatar_url} />
                    <AvatarFallback>
                      {wholesaler.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{wholesaler.full_name}</CardTitle>
                    <CardDescription>{wholesaler.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {wholesaler.bio && <p className="text-sm">{wholesaler.bio}</p>}
                  {wholesaler.city && wholesaler.country && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Store className="mr-2 h-4 w-4" />
                      {wholesaler.city}, {wholesaler.country}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={wholesaler.hasPartnership}
                  onClick={() => handleRequestPartnership(wholesaler)}
                >
                  {wholesaler.hasPartnership ? (
                    "Partnership Requested"
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Request Partnership
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Partnership</DialogTitle>
            <DialogDescription>Send a partnership request to {selectedWholesaler?.full_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="terms">Partnership Terms (Optional)</Label>
              <Textarea
                id="terms"
                placeholder="Describe your proposed terms for this partnership..."
                value={partnershipTerms}
                onChange={(e) => setPartnershipTerms(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Proposed Commission Rate % (Optional)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g., 10"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

