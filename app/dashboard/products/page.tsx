"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Filter, Plus, Search } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { dashboardService } from "@/services/dashboard-service"
import type { Product } from "@/services/product-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")
  const { user, userData } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user || !userData) {
        router.push("/login")
        return
      }

      try {
        let productsList: Product[] = []

        if (userData.role === "dropshipper") {
          // For dropshippers, fetch all products (or products from their partners)
          // This is simplified - in a real app, you'd fetch products from partners
          productsList = await dashboardService.getWholesalerProducts(user.uid)
        } else if (userData.role === "wholesaler") {
          // For wholesalers, fetch only their products
          productsList = await dashboardService.getWholesalerProducts(user.uid)
        }

        setProducts(productsList)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [user, userData, router, toast])

  // Get unique categories for filters
  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  // Filter products based on search term and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Loading your product catalog...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          {userData?.role === "wholesaler"
            ? "Manage your product catalog and add new products to your inventory."
            : "Browse and manage products in your store."}
        </p>
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
                <SheetDescription>Filter products by category and more.</SheetDescription>
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
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCategoryFilter("all")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {userData?.role === "wholesaler" && (
          <Button className="shrink-0" asChild>
            <Link href="/dashboard/products/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square w-full">
              <img
                src={product.images[0] || "/placeholder.svg"}
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
          <p className="text-sm text-muted-foreground">
            {products.length === 0
              ? userData?.role === "wholesaler"
                ? "Add your first product to get started."
                : "Connect with suppliers to add products to your store."
              : "Try adjusting your search or filter criteria."}
          </p>
          {products.length === 0 && userData?.role === "wholesaler" && (
            <Button className="mt-4" asChild>
              <Link href="/dashboard/products/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

