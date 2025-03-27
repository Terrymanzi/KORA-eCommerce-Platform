"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Heart, ShoppingCart, Star, Truck, Home } from "lucide-react"

import { productService, type Product } from "@/services/product-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [color, setColor] = useState("black")
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await productService.getProductById(params.id)
        if (!productData) {
          toast({
            title: "Product not found",
            description: "The requested product could not be found.",
            variant: "destructive",
          })
          router.push("/products")
          return
        }

        setProduct(productData)

        // Set default color if available
        if (productData.colors && productData.colors.length > 0) {
          setColor(productData.colors[0])
        }

        // Fetch related products from the same category
        const categoryProducts = await productService.getProductsByCategory(productData.category)
        const filtered = categoryProducts.filter((p) => p.id !== productData.id).slice(0, 3)
        setRelatedProducts(filtered)
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, router, toast])

  const handleAddToCart = () => {
    // In a real app, this would add the product to a cart context or send to an API
    toast({
      title: "Added to cart",
      description: `Added ${quantity} ${product?.name} (${color}) to cart`,
    })
  }

  const handleBuyNow = () => {
    // In a real app, this would add the product to cart and redirect to checkout
    router.push("/checkout")
  }

  const handleAddReview = async (rating: number) => {
    if (!product) return

    try {
      await productService.addProductReview(product.id, rating)
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      // Refresh product data to show updated rating
      const updatedProduct = await productService.getProductById(product.id)
      if (updatedProduct) {
        setProduct(updatedProduct)
      }
    } catch (error) {
      console.error("Error adding review:", error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again later.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-medium">Loading product details...</h2>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-medium">Product not found</h2>
          <p className="mt-2 text-muted-foreground">The requested product could not be found.</p>
          <Button className="mt-4" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
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
                      i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating || 0} ({product.reviews || 0} reviews)
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

            {product.colors && product.colors.length > 0 && (
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
            )}

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
              <p>{product.longDescription || product.description}</p>
              {product.features && product.features.length > 0 && (
                <>
                  <h3 className="text-lg font-medium">Key Features</h3>
                  <ul className="list-inside list-disc space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Technical Specifications</h3>
              {product.specifications && product.specifications.length > 0 ? (
                <div className="rounded-lg border">
                  {product.specifications.map((spec, index) => (
                    <div
                      key={index}
                      className={`flex justify-between p-3 ${
                        index !== product.specifications!.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <span className="font-medium">{spec.name}</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No specifications available for this product.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-5xl font-bold">{product.rating || 0}</div>
                  <div className="mt-1 flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">Based on {product.reviews || 0} reviews</div>
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
              <div className="space-y-2">
                <h3 className="font-medium">Rate this product</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button key={rating} variant="outline" size="sm" onClick={() => handleAddReview(rating)}>
                      {rating} <Star className="ml-1 h-3 w-3" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Related Products</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="overflow-hidden">
                <Link href={`/products/${relatedProduct.id}`}>
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={relatedProduct.images[0] || "/placeholder.svg"}
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
      )}
    </div>
  )
}

