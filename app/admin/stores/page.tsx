"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Search, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getStores, updateStore } from "@/lib/supabase/stores"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminStoresPage() {
  const { user, loading: authLoading } = useAuth()
  const [stores, setStores] = useState<any[]>([])
  const [filteredStores, setFilteredStores] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [storeTypeFilter, setStoreTypeFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }

    if (user && user.user_type !== "admin") {
      toast({
        title: "Access denied",
        description: "Only administrators can access this page",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    async function loadStores() {
      if (!user || user.user_type !== "admin") return

      try {
        const { data, error } = await getStores()

        if (error) throw error

        setStores(data || [])
        setFilteredStores(data || [])
      } catch (error) {
        console.error("Error loading stores:", error)
        toast({
          title: "Failed to load stores",
          description: "There was an error loading the stores",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadStores()
  }, [user, toast])

  useEffect(() => {
    // Filter stores based on search term and filters
    const filtered = stores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.owner?.full_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = storeTypeFilter === "all" || store.store_type === storeTypeFilter

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && store.is_verified) ||
        (verificationFilter === "pending" && !store.is_verified)

      return matchesSearch && matchesType && matchesVerification
    })

    setFilteredStores(filtered)
  }, [searchTerm, storeTypeFilter, verificationFilter, stores])

  const handleVerifyStore = async (storeId: string, isVerified: boolean) => {
    const store = stores.find((s) => s.id === storeId)
    setSelectedStore(store)
    setIsDialogOpen(true)
  }

  const confirmVerification = async (isVerified: boolean) => {
    if (!selectedStore) return

    setIsSubmitting(true)

    try {
      const { data, error } = await updateStore(selectedStore.id, {
        is_verified: isVerified,
      })

      if (error) throw error

      // Update local state
      setStores((prevStores) =>
        prevStores.map((store) => (store.id === selectedStore.id ? { ...store, is_verified: isVerified } : store)),
      )

      toast({
        title: isVerified ? "Store verified" : "Store verification removed",
        description: `${selectedStore.name} has been ${isVerified ? "verified" : "unverified"} successfully.`,
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating store verification:", error)
      toast({
        title: "Failed to update store",
        description: "There was an error updating the store verification status",
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
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Manage Stores</h1>
        <p className="text-muted-foreground">
          View and manage all stores on the platform. Verify stores to allow them to operate.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stores or owners..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={storeTypeFilter} onValueChange={setStoreTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Store Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="dropshipping">Dropshipping</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending Verification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stores</CardTitle>
            <CardDescription>
              {filteredStores.length} {filteredStores.length === 1 ? "store" : "stores"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.owner?.full_name}</TableCell>
                    <TableCell>
                      <span className="capitalize">{store.store_type}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          store.is_verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {store.is_verified ? "Verified" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(store.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/stores/${store.id}`}>View</Link>
                        </Button>
                        {store.is_verified ? (
                          <Button variant="destructive" size="sm" onClick={() => handleVerifyStore(store.id, false)}>
                            <X className="mr-1 h-4 w-4" />
                            Unverify
                          </Button>
                        ) : (
                          <Button variant="default" size="sm" onClick={() => handleVerifyStore(store.id, true)}>
                            <Check className="mr-1 h-4 w-4" />
                            Verify
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No stores found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Verification Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStore?.is_verified ? "Remove Verification" : "Verify Store"}</DialogTitle>
            <DialogDescription>
              {selectedStore?.is_verified
                ? `Are you sure you want to remove verification from ${selectedStore?.name}? This will restrict their ability to operate on the platform.`
                : `Are you sure you want to verify ${selectedStore?.name}? This will allow them to fully operate on the platform.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant={selectedStore?.is_verified ? "destructive" : "default"}
              onClick={() => confirmVerification(!selectedStore?.is_verified)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : selectedStore?.is_verified ? "Remove Verification" : "Verify Store"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

