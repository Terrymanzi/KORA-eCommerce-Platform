"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { requestPartnership } from "@/lib/supabase/partnerships"

export default function FindPartnersPage() {
  const [wholesalers, setWholesalers] = useState<any[]>([])
  const [filteredWholesalers, setFilteredWholesalers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchWholesalers = async () => {
      try {
        // Fetch all wholesalers
        const { data, error } = await supabase.from("profiles").select("*").eq("user_type", "wholesaler")

        if (error) throw error

        setWholesalers(data || [])
        setFilteredWholesalers(data || [])
      } catch (error) {
        console.error("Error fetching wholesalers:", error)
        toast({
          title: "Error",
          description: "Failed to load wholesalers. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWholesalers()
  }, [toast])

  useEffect(() => {
    // Filter wholesalers based on search term
    const filtered = wholesalers.filter((wholesaler) =>
      wholesaler.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredWholesalers(filtered)
  }, [searchTerm, wholesalers])

  const handleRequestPartnership = async (wholesalerId: string) => {
    setRequestingId(wholesalerId)
    try {
      // Default commission rate of 10%
      await requestPartnership(wholesalerId, 10)

      toast({
        title: "Request sent",
        description: "Your partnership request has been sent successfully.",
      })

      // Update UI to show request sent
      setWholesalers(wholesalers.map((w) => (w.id === wholesalerId ? { ...w, requestSent: true } : w)))
      setFilteredWholesalers(filteredWholesalers.map((w) => (w.id === wholesalerId ? { ...w, requestSent: true } : w)))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send partnership request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRequestingId(null)
    }
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Find Partners</h1>
        <p className="text-muted-foreground">Discover wholesalers to partner with for your dropshipping business.</p>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search wholesalers..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWholesalers.length > 0 ? (
            filteredWholesalers.map((wholesaler) => (
              <Card key={wholesaler.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-full">
                      {wholesaler.avatar_url ? (
                        <img
                          src={wholesaler.avatar_url || "/placeholder.svg"}
                          alt={wholesaler.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {wholesaler.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle>{wholesaler.full_name}</CardTitle>
                      <CardDescription>Wholesaler</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{wholesaler.bio || "No bio available."}</p>
                </CardContent>
                <CardFooter>
                  {wholesaler.requestSent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Request Sent
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleRequestPartnership(wholesaler.id)}
                      disabled={requestingId === wholesaler.id}
                    >
                      {requestingId === wholesaler.id ? (
                        "Sending Request..."
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Request Partnership
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="text-muted-foreground">No wholesalers found</div>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "There are no wholesalers available at the moment."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

