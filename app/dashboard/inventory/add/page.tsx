"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash, Upload } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createProduct } from "@/lib/supabase/products"

export default function AddProductPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState("")
  const [features, setFeatures] = useState<string[]>([""])
  const [specifications, setSpecifications] = useState<{ name: string; value: string }[]>([{ name: "", value: "" }])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAddFeature = () => {
    setFeatures([...features, ""])
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...features]
    newFeatures.splice(index, 1)
    setFeatures(newFeatures)
  }

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { name: "", value: "" }])
  }

  const handleSpecificationChange = (index: number, field: "name" | "value", value: string) => {
    const newSpecifications = [...specifications]
    newSpecifications[index][field] = value
    setSpecifications(newSpecifications)
  }

  const handleRemoveSpecification = (index: number) => {
    const newSpecifications = [...specifications]
    newSpecifications.splice(index, 1)
    setSpecifications(newSpecifications)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      const newImages = [...images, ...filesArray]
      setImages(newImages)

      // Create preview URLs
      const newImagePreviewUrls = newImages.map((file) => URL.createObjectURL(file))
      setImagePreviewUrls(newImagePreviewUrls)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)

    const newImagePreviewUrls = [...imagePreviewUrls]
    URL.revokeObjectURL(newImagePreviewUrls[index])
    newImagePreviewUrls.splice(index, 1)
    setImagePreviewUrls(newImagePreviewUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!name || !description || !price || !category || !stock || !images.length) {
        throw new Error("Please fill in all required fields and add at least one image")
      }

      // Filter out empty features and specifications
      const filteredFeatures = features.filter((feature) => feature.trim() !== "")
      const filteredSpecifications = specifications
        .filter((spec) => spec.name.trim() !== "" && spec.value.trim() !== "")
        .reduce(
          (acc, { name, value }) => {
            acc[name] = value
            return acc
          },
          {} as Record<string, string>,
        )

      // Create product
      await createProduct(
        {
          name,
          description,
          long_description: longDescription,
          price: Number.parseFloat(price),
          category,
          stock: Number.parseInt(stock),
          features: filteredFeatures,
          specifications: filteredSpecifications,
        },
        images,
      )

      toast({
        title: "Product created",
        description: "Your product has been created successfully.",
      })

      router.push("/dashboard/inventory")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/dashboard/inventory"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product to sell in your store.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">A brief description that appears in product listings.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longDescription">Full Description</Label>
                  <Textarea
                    id="longDescription"
                    value={longDescription}
                    onChange={(e) => setLongDescription(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    A detailed description that appears on the product page.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (RWF) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>Add key features of your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveFeature(index)}
                      disabled={features.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddFeature} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
                <CardDescription>Add technical specifications of your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {specifications.map((spec, index) => (
                  <div key={index} className="grid grid-cols-[1fr,1fr,auto] gap-2">
                    <Input
                      value={spec.name}
                      onChange={(e) => handleSpecificationChange(index, "name", e.target.value)}
                      placeholder="Name (e.g. Weight)"
                    />
                    <Input
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, "value", e.target.value)}
                      placeholder="Value (e.g. 500g)"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveSpecification(index)}
                      disabled={specifications.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddSpecification} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Specification
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images *</CardTitle>
                <CardDescription>
                  Upload images of your product. The first image will be the main image.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Product preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/80 py-1 text-center text-xs text-primary-foreground">
                          Main Image
                        </div>
                      )}
                    </div>
                  ))}
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-sm text-muted-foreground">Upload Image</span>
                    <Input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can upload multiple images at once. The first image will be used as the main product image.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>This is how your product will appear in listings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-md border">
                  <div className="aspect-square w-full bg-muted">
                    {imagePreviewUrls.length > 0 ? (
                      <img
                        src={imagePreviewUrls[0] || "/placeholder.svg"}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{name || "Product Name"}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {description || "Product description will appear here."}
                    </p>
                    <p className="mt-2 font-bold">
                      {price ? `RWF ${Number.parseFloat(price).toLocaleString()}` : "RWF 0"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Product..." : "Create Product"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

