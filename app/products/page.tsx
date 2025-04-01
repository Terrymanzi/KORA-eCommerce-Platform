"use client"

import { useState } from "react"
import Link from "next/link"
import { Filter, Search, ShoppingBag, ShoppingCart, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "Smartphone X",
    price: 120000,
    category: "Electronics",
    supplier: "TechHub Rwanda",
    rating: 4.5,
    image: "/placeholder.svg?height=200&width=200&text=Smartphone",
  },
  {
    id: 2,
    name: "Designer T-Shirt",
    price: 15000,
    category: "Clothing",
    supplier: "Fashion House",
    rating: 4.2,
    image: "/placeholder.svg?height=200&width=200&text=T-Shirt",
  },
  {
    id: 3,
    name: "Coffee Maker",
    price: 45000,
    category: "Home & Kitchen",
    supplier: "HomeGoods Rwanda",
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=200&text=Coffee+Maker",
  },
  {
    id: 4,
    name: "Leather Backpack",
    price: 35000,
    category: "Accessories",
    supplier: "LeatherCraft",
    rating: 4.3,
    image: "/placeholder.svg?height=200&width=200&text=Backpack",
  },
  {
    id: 5,
    name: "Wireless Earbuds",
    price: 30000,
    category: "Electronics",
    supplier: "TechHub Rwanda",
    rating: 4.1,
    image: "/placeholder.svg?height=200&width=200&text=Earbuds",
  },
  {
    id: 6,
    name: "Yoga Mat",
    price: 12000,
    category: "Sports",
    supplier: "FitLife",
    rating: 4.6,
    image: "/placeholder.svg?height=200&width=200&text=Yoga+Mat",
  },
  {
    id: 7,
    name: "Smart Watch",
    price: 85000,
    category: "Electronics",
    supplier: "TechHub Rwanda",
    rating: 4.4,
    image: "/placeholder.svg?height=200&width=200&text=Smart+Watch",
  },
  {
    id: 8,
    name: "Desk Lamp",
    price: 18000,
    category: "Home & Kitchen",
    supplier: "HomeGoods Rwanda",
    rating: 4.0,
    image: "/placeholder.svg?height=200&width=200&text=Desk+Lamp",
  },
  {
    id: 9,
    name: "Running Shoes",
    price: 40000,
    category: "Sports",
    supplier: "FitLife",
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=200&text=Running+Shoes",
  },
  {
    id: 10,
    name: "Bluetooth Speaker",
    price: 25000,
    category: "Electronics",
    supplier: "TechHub Rwanda",
    rating: 4.2,
    image: "/placeholder.svg?height=200&width=200&text=Speaker",
  },
  {
    id: 11,
    name: "Denim Jeans",
    price: 22000,
    category: "Clothing",
    supplier: "Fashion House",
    rating: 4.3,
    image: "/placeholder.svg?height=200&width=200&text=Jeans",
  },
  {
    id: 12,
    name: "Stainless Steel Water Bottle",
    price: 8000,
    category: "Accessories",
    supplier: "HomeGoods Rwanda",
    rating: 4.5,
    image: "/placeholder.svg?height=200&width=200&text=Water+Bottle",
  },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 150000])
  const [sortBy, setSortBy] = useState("featured")

  // Get unique categories and suppliers for filters
  const categories = ["all", ...Array.from(new Set(mockProducts.map((p) => p.category)))]
  const suppliers = ["all", ...Array.from(new Set(mockProducts.map((p) => p.supplier)))]

  // Filter products based on search term, category, supplier, and price range
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesSupplier = supplierFilter === "all" || product.supplier === supplierFilter
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

    return matchesSearch && matchesCategory && matchesSupplier && matchesPrice
  })

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return a.price - b.price
      case "price-high-low":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      default: // featured
        return 0
    }
  })

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
                    <h3 className="text-sm font-medium">Supplier</h3>
                    <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier} value={supplier}>
                            {supplier === "all" ? "All Suppliers" : supplier}
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
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
                        <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({product.rating})</span>
                  </div>
                  <p className="font-bold">RWF {product.price.toLocaleString()}</p>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/products/${product.id}`}>View</Link>
                </Button>
                <Button size="icon" variant="secondary">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="sr-only">Add to cart</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {sortedProducts.length === 0 && (
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

