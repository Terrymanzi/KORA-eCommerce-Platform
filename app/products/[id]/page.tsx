"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Heart, ShoppingCart, Star, Truck, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [color, setColor] = useState("black")

  // Mock product data - in a real app, this would come from an API
  const product = {
    id: Number.parseInt(params.id),
    name: "Smartphone X",
    price: 120000,
    description:
      "The latest smartphone with cutting-edge features and technology. Experience the future of mobile computing with this powerful device.",
    longDescription:
      "The Smartphone X represents the pinnacle of mobile technology, combining sleek design with powerful performance. Featuring a stunning 6.5-inch AMOLED display, the latest processor, and a revolutionary camera system, this device sets a new standard for smartphones. The 5000mAh battery ensures all-day usage, while the fast charging capability gets you back to 50% in just 30 minutes. With 128GB of storage expandable up to 1TB, you'll never run out of space for your photos, videos, and apps. The device is water and dust resistant with an IP68 rating, making it perfect for any environment. Experience the future of mobile computing with the Smartphone X.",
    category: "Electronics",
    supplier: "TechHub Rwanda",
    rating: 4.5,
    reviews: 128,
    stock: 25,
    colors: ["black", "white", "blue"],
    images: [
      "/placeholder.svg?height=500&width=500&text=Smartphone+Front",
      "/placeholder.svg?height=500&width=500&text=Smartphone+Back",
      "/placeholder.svg?height=500&width=500&text=Smartphone+Side",
      "/placeholder.svg?height=500&width=500&text=Smartphone+Camera",
    ],
    specifications: [
      { name: "Display", value: "6.5-inch AMOLED" },
      { name: "Processor", value: "Octa-core 2.8GHz" },
      { name: "RAM", value: "8GB" },
      { name: "Storage", value: "128GB" },
      { name: "Camera", value: "48MP + 12MP + 8MP" },
      { name: "Battery", value: "5000mAh" },
      { name: "OS", value: "Android 13" },
    ],
    features: [
      "Fast charging capability",
      "Water and dust resistant (IP68)",
      "Expandable storage up to 1TB",
      "Dual SIM support",
      "5G connectivity",
    ],
    relatedProducts: [
      {
        id: 5,
        name: "Wireless Earbuds",
        price: 30000,
        image: "/placeholder.svg?height=200&width=200&text=Earbuds",
      },
      {
        id: 7,
        name: "Smart Watch",
        price: 85000,
        image: "/placeholder.svg?height=200&width=200&text=Smart+Watch",
      },
      {
        id: 10,
        name: "Bluetooth Speaker",
        price: 25000,
        image: "/placeholder.svg?height=200&width=200&text=Speaker",
      },
    ],
  }

  const handleAddToCart = () => {
    // In a real app, this would add the product to a cart context or send to an API
    alert(`Added ${quantity} ${product.name} (${color}) to cart`)
  }

  const handleBuyNow = () => {
    // In a real app, this would add the product to cart and redirect to checkout
    window.location.href = "/checkout"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/products" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border">
            <img
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex gap-2 overflow-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`relative overflow-hidden rounded-md border ${
                  selectedImage === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="h-20 w-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
            <div className="mt-4 text-3xl font-bold">RWF {product.price.toLocaleString()}</div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            </div>

            <div>
              <h3 className="font-medium">Color</h3>
              <RadioGroup value={color} onValueChange={setColor} className="mt-2 flex gap-2">
                {product.colors.map((colorOption) => (
                  <div key={colorOption} className="flex items-center gap-2">
                    <RadioGroupItem value={colorOption} id={`color-${colorOption}`} className="sr-only" />
                    <Label
                      htmlFor={`color-${colorOption}`}
                      className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ${
                        colorOption === "black"
                          ? "bg-black"
                          : colorOption === "white"
                            ? "bg-white border"
                            : colorOption === "blue"
                              ? "bg-blue-500"
                              : ""
                      } ${color === colorOption ? "ring-2 ring-primary ring-offset-2" : ""}`}
                    >
                      {color === colorOption && (
                        <Check className={`h-4 w-4 ${colorOption === "white" ? "text-black" : "text-white"}`} />
                      )}
                      <span className="sr-only">{colorOption}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <h3 className="font-medium">Quantity</h3>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
                <span className="ml-4 text-sm text-muted-foreground">{product.stock} available</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" className="w-full" onClick={handleBuyNow}>
              Buy Now
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Add to Wishlist</span>
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span>Free delivery within Kigali</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Estimated delivery: 2-3 business days</div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <div className="space-y-4">
              <p>{product.longDescription}</p>
              <h3 className="text-lg font-medium">Key Features</h3>
              <ul className="list-inside list-disc space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Technical Specifications</h3>
              <div className="rounded-lg border">
                {product.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className={`flex justify-between p-3 ${
                      index !== product.specifications.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <span className="font-medium">{spec.name}</span>
                    <span className="text-muted-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-5xl font-bold">{product.rating}</div>
                  <div className="mt-1 flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">Based on {product.reviews} reviews</div>
                </div>
                <div className="flex-1">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <div className="text-sm">{rating} stars</div>
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-yellow-400"
                            style={{
                              width: `${
                                rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button>Write a Review</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Related Products</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {product.relatedProducts.map((relatedProduct) => (
            <Card key={relatedProduct.id} className="overflow-hidden">
              <Link href={`/products/${relatedProduct.id}`}>
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={relatedProduct.image || "/placeholder.svg"}
                    alt={relatedProduct.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>
              <CardContent className="p-4">
                <CardTitle className="line-clamp-1">{relatedProduct.name}</CardTitle>
                <CardDescription>RWF {relatedProduct.price.toLocaleString()}</CardDescription>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href={`/products/${relatedProduct.id}`}>View Product</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

