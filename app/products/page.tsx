"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Filter, Search, ShoppingBag, ShoppingCart, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { getProducts, getProductCategories } from "@/lib/supabase/products"
import { addToCart } from "@/lib/supabase/cart"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 150000])
  const [sortBy, setSortBy] = useState("featured")
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getProductCategories()
        setCategories(["all", ...categoriesData])
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const { data } = await getProducts({
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          search: searchTerm || undefined,
          sortBy:
            sortBy === "price-low-high"
              ? "price"
              : sortBy === "price-high-low"
                ? "price"
                : sortBy === "rating"
                  ? "rating"
                  : undefined,
          sortOrder: sortBy === "price-low-high" ? "asc" : "desc",
        })

        // Filter by price range
        const filteredData = data.filter(
          (product: any) => product.price >= priceRange[0] && product.price <= priceRange[1],
        )

        setProducts(filteredData)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [searchTerm, categoryFilter, supplierFilter, priceRange, sortBy, toast])

  const handleAddToCart = async (productId: string, storeId: string) => {
    try {
      await addToCart(productId, storeId, 1)
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product to cart.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Browse our wide selection of products from trusted suppliers in Rwanda.</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Filter products by category, supplier, and price.</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Category</h3>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category === "all" ? "All Categories" : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Price Range</h3>
                    <div className="pt-4">
                      <Slider
                        defaultValue={[0, 150000]}
                        max={150000}
                        step={1000}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">RWF {priceRange[0].toLocaleString()}</p>
                      <p className="text-sm">RWF {priceRange[1].toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCategoryFilter("all")
                      setSupplierFilter("all")
                      setPriceRange([0, 150000])
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              // Find primary image
              const primaryImage = product.product_images?.find((img: any) => img.is_primary)
              const imageUrl =
                primaryImage?.url ||
                product.product_images?.[0]?.url ||
                "/placeholder.svg?height=200&width=200&text=No+Image"

              return (
                <Card key={product.id} className="overflow-hidden">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <h3 className="font-medium line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.rating || 0})</span>
                      </div>
                      <p className="font-bold">RWF {product.price.toLocaleString()}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/products/${product.id}`}>View</Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleAddToCart(product.id, product.supplier_id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span className="sr-only">Add to cart</span>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium">No products found</h3>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("")
                setCategoryFilter("all")
                setSupplierFilter("all")
                setPriceRange([0, 150000])
              }}
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

