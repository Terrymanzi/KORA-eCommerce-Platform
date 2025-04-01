"use client"

import { useState } from "react"
import Link from "next/link"
import { Filter, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "Smartphone X",
    price: 120000,
    category: "Electronics",
    supplier: "TechHub Rwanda",
    stock: 25,
    image: "/placeholder.svg?height=200&width=200&text=Smartphone",
  },
  {
    id: 2,
    name: "Designer T-Shirt",
    price: 15000,
    category: "Clothing",
    supplier: "Fashion House",
    stock: 50,
    image: "/placeholder.svg?height=200&width=200&text=T-Shirt",
  },
  {
    id: 3,
    name: "Coffee Maker",
    price: 45000,
    category: "Home & Kitchen",
    supplier: "HomeGoods Rwanda",
    stock: 10,
    image: "/placeholder.svg?height=200&width=200&text=Coffee+Maker",
  },
  {
    id: 4,
    name: "Leather Backpack",
    price: 35000,
    category: "Accessories",
    supplier: "LeatherCraft",
    stock: 15,
    image: "/placeholder.svg?height=200&width=200&text=Backpack",
  },
  {
    id: 5,
    name: "Wireless Earbuds",
    price: 30000,
    category: "Electronics",
    supplier: "TechHub Rwanda",
    stock: 30,
    image: "/placeholder.svg?height=200&width=200&text=Earbuds",
  },
  {
    id: 6,
    name: "Yoga Mat",
    price: 12000,
    category: "Sports",
    supplier: "FitLife",
    stock: 20,
    image: "/placeholder.svg?height=200&width=200&text=Yoga+Mat",
  },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")

  // Filter products based on search term and filters
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesSupplier = supplierFilter === "all" || product.supplier === supplierFilter

    return matchesSearch && matchesCategory && matchesSupplier
  })

  // Get unique categories and suppliers for filters
  const categories = ["all", ...new Set(mockProducts.map((p) => p.category))]
  const suppliers = ["all", ...new Set(mockProducts.map((p) => p.supplier))]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Manage your product catalog and add new products to your store.</p>
      </div>

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
                <SheetDescription>Filter products by category, supplier, and more.</SheetDescription>
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
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCategoryFilter("all")
                    setSupplierFilter("all")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <Button className="shrink-0" asChild>
          <Link href="/dashboard/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square w-full">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="p-4">
              <CardTitle className="line-clamp-1">{product.name}</CardTitle>
              <CardDescription>
                {product.category} • {product.supplier}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex justify-between">
                <div className="font-medium">RWF {product.price.toLocaleString()}</div>
                <div
                  className={`text-sm ${product.stock > 20 ? "text-green-500" : product.stock > 10 ? "text-yellow-500" : "text-red-500"}`}
                >
                  {product.stock} in stock
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/products/${product.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="text-muted-foreground">No products found</div>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}

