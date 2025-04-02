"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { createProduct, uploadProductImage, addProductImage } from "@/lib/supabase/products"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

// Predefined categories
const categories = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Toys & Games",
  "Books",
  "Automotive",
  "Health & Wellness",
  "Other",
]

export default function AddProductPage() {
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "",
    sku: "",
    weight: "",
    dimensions: "",
    isFeatured: false,
  })
  const [images, setImages] = useState<File[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }

    if (user && user.user_type !== "wholesaler" && user.user_type !== "admin") {
      toast({
        title: "Access denied",
        description: "Only wholesalers can add products",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    // Create preview URLs for the selected images
    const urls = images.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)

    // Cleanup function to revoke the URLs when component unmounts
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isFeatured: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      setImages((prev) => [...prev, ...fileArray])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))

    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0)
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex((prev) => prev - 1)
    }
  }

  const handleSetPrimary = (index: number) => {
    setPrimaryImageIndex(index)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      // Create the product
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        stock_quantity: Number.parseInt(formData.stockQuantity),
        category: formData.category,
        supplier_id: user.id,
        is_active: true,
        sku: formData.sku || null,
        weight: formData.weight ? Number.parseFloat(formData.weight) : null,
        dimensions: formData.dimensions || null,
        is_featured: formData.isFeatured,
      }

      const { data: product, error } = await createProduct(productData)

      if (error) throw error

      // Upload images
      if (images.length > 0 && product) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i]
          const isPrimary = i === primaryImageIndex

          // Generate a unique file path
          const filePath = `${user.id}/${product.id}/${Date.now()}-${file.name}`

          // Upload the image to storage
          const { data: imageUrl, error: uploadError } = await uploadProductImage(file, filePath)

          if (uploadError) throw uploadError

          // Add the image to the product_images table
          if (imageUrl) {
            const { error: imageError } = await addProductImage({
              product_id: product.id,
              url: imageUrl,
              is_primary: isPrimary,
            })

            if (imageError) throw imageError
          }
        }
      }

      toast({
        title: "Product added",
        description: "Your product has been added successfully",
      })

      router.push("/dashboard/products")
    } catch (err) {
      console.error("Error adding product:", err)
      toast({
        title: "Failed to add product",
        description: "There was an error adding your product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
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
          href="/dashboard/products"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product listing for your store</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Enter the details of your product</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (RWF) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Optional)</Label>
                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) (Optional)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions (Optional)</Label>
                  <Input
                    id="dimensions"
                    name="dimensions"
                    placeholder="e.g., 10x20x30 cm"
                    value={formData.dimensions}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="isFeatured">Feature this product</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Adding Product..." : "Add Product"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Upload images of your product (max 5 images)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className={`aspect-square w-full rounded-md object-cover ${
                      index === primaryImageIndex ? "ring-2 ring-primary" : ""
                    }`}
                  />
                  <div className="absolute bottom-2 right-2 flex space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetPrimary(index)}
                      disabled={index === primaryImageIndex}
                    >
                      {index === primaryImageIndex ? "Primary" : "Set Primary"}
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveImage(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              {previewUrls.length < 5 && (
                <div className="flex aspect-square w-full items-center justify-center rounded-md border-2 border-dashed">
                  <label
                    htmlFor="image-upload"
                    className="flex cursor-pointer flex-col items-center justify-center p-4 text-center"
                  >
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Click to upload</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      multiple={previewUrls.length < 4}
                    />
                  </label>
                </div>
              )}
            </div>

            {previewUrls.length === 0 && (
              <div className="text-center text-sm text-muted-foreground">
                No images uploaded yet. Please add at least one image.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

