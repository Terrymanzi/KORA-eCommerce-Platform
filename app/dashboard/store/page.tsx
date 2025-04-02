"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, ExternalLink, Settings, Share, Upload, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getStoreByOwnerId, createStore, updateStore, uploadStoreLogo, deleteStore } from "@/lib/supabase/stores"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function StorePage() {
  const { user, loading: authLoading } = useAuth()
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoFile: null as File | null,
    logoPreview: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false) // State for delete confirmation dialog

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }

    if (user && user.user_type !== "dropshipper" && user.user_type !== "wholesaler" && user.user_type !== "admin") {
      toast({
        title: "Access denied",
        description: "Only dropshippers and wholesalers can manage stores",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    async function loadStore() {
      if (!user) return

      try {
        const { data, error } = await getStoreByOwnerId(user.id)

        if (error) throw error

        setStore(data)

        if (data) {
          setFormData({
            name: data.name,
            description: data.description || "",
            logoFile: null,
            logoPreview: data.logo_url || "",
          })
        }
      } catch (err) {
        console.error("Error loading store:", err)
        toast({
          title: "Failed to load store",
          description: "There was an error loading your store information",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadStore()
    }
  }, [user, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData((prev) => ({
        ...prev,
        logoFile: file,
        logoPreview: URL.createObjectURL(file),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      let logoUrl = store?.logo_url || null

      // Upload logo if a new one was selected
      if (formData.logoFile) {
        const filePath = `${user.id}/store-logo/${Date.now()}-${formData.logoFile.name}`
        const { data: uploadedUrl, error: uploadError } = await uploadStoreLogo(formData.logoFile, filePath)

        if (uploadError) throw uploadError

        if (uploadedUrl) {
          logoUrl = uploadedUrl
        }
      }

      // Map user_type to store_type correctly
      const storeType = user.user_type === "wholesaler" ? "wholesale" : "dropshipping"

      const storeData = {
        name: formData.name,
        description: formData.description || null,
        owner_id: user.id,
        logo_url: logoUrl,
        is_verified: false,
        store_type: storeType,
      }

      if (store) {
        // Update existing store
        const { data, error } = await updateStore(store.id, storeData)

        if (error) throw error

        setStore(data)
        toast({
          title: "Store updated",
          description: "Your store has been updated successfully",
        })
      } else {
        // Create new store
        const { data, error } = await createStore(storeData)

        if (error) throw error

        setStore(data)
        toast({
          title: "Store created",
          description: "Your store has been created successfully",
        })
      }

      setIsEditing(false)
    } catch (err) {
      console.error("Error saving store:", err)
      toast({
        title: "Failed to save store",
        description: "There was an error saving your store information",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle store deletion
  const handleDeleteStore = async () => {
    if (!store) return

    setIsSubmitting(true)

    try {
      const { error } = await deleteStore(store.id)

      if (error) throw error

      setStore(null)
      setDeleteDialogOpen(false)

      toast({
        title: "Store deleted",
        description: "Your store has been deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting store:", err)
      toast({
        title: "Failed to delete store",
        description: "There was an error deleting your store",
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

  // If no store exists and not in editing mode, show create store UI
  if (!store && !isEditing) {
    return (
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create Your Store</h1>
          <p className="text-muted-foreground">Set up your online store to start selling products</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Enter the details of your store</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="mb-4 text-muted-foreground">You haven't created a store yet</p>
            <Button onClick={() => setIsEditing(true)}>Create Store</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If in editing mode, show the edit form
  if (isEditing) {
    return (
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{store ? "Edit Your Store" : "Create Your Store"}</h1>
          <p className="text-muted-foreground">
            {store ? "Update your store information" : "Set up your online store to start selling products"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Enter the details of your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Store Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Store Logo</Label>
                <div className="flex items-center gap-4">
                  {formData.logoPreview && (
                    <div className="h-20 w-20 overflow-hidden rounded-md">
                      <img
                        src={formData.logoPreview || "/placeholder.svg"}
                        alt="Store Logo Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <label
                    htmlFor="logo-upload"
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 hover:bg-muted"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{formData.logoPreview ? "Change Logo" : "Upload Logo"}</span>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : store ? "Update Store" : "Create Store"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    )
  }

  // Show store details if store exists and not in editing mode
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Store</h1>
        <p className="text-muted-foreground">Manage your online store and track performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Basic information about your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {store.logo_url ? (
                <div className="h-20 w-20 overflow-hidden rounded-md">
                  <img
                    src={store.logo_url || "/placeholder.svg"}
                    alt={store.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-muted">
                  <span className="text-2xl font-bold text-muted-foreground">{store.name.charAt(0)}</span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium">{store.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {store.store_type === "wholesale" ? "Wholesale Store" : "Dropshipping Store"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">{store.description || "No description provided"}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Store URL</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">{`${store.name.toLowerCase().replace(/\s+/g, "-")}.kora.rw`}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Visit store</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Verification Status</h4>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    store.is_verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {store.is_verified ? "Verified" : "Pending Verification"}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/store/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Store
              </Button>
              {/* Only show delete button for dropshippers */}
              {user?.user_type === "dropshipper" && (
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Store
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Performance</CardTitle>
            <CardDescription>Overview of your store's performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Total Orders</div>
              <div>0</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium">Total Revenue</div>
              <div>RWF 0</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium">Store Views</div>
              <div>0</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium">Conversion Rate</div>
              <div>0%</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/analytics">View Detailed Analytics</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Share Your Store</CardTitle>
            <CardDescription>Promote your store on social media and other platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 rounded-lg border p-4">
                <div className="mb-2 font-medium">Store URL</div>
                <div className="flex items-center gap-2">
                  <Input value={`https://${store.name.toLowerCase().replace(/\s+/g, "-")}.kora.rw`} readOnly />
                  <Button variant="outline" size="icon">
                    <Share className="h-4 w-4" />
                    <span className="sr-only">Copy URL</span>
                  </Button>
                </div>
              </div>
              <div className="flex-1 rounded-lg border p-4">
                <div className="mb-2 font-medium">QR Code</div>
                <div className="flex items-center justify-center">
                  <div className="h-24 w-24 rounded bg-muted">
                    <img
                      src="/placeholder.svg?height=96&width=96&text=QR+Code"
                      alt="QR Code"
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Download Marketing Materials
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Delete Store Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your store? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStore} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Store"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

