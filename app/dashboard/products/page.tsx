"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Filter, Plus, Search } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getProducts, getCategories } from "@/lib/supabase/products"
import { getActivePartnerships, getProductsFromSuppliers } from "@/lib/supabase/dropshipping"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"

export default function ProductsPage() {
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadProducts() {
      try {
        // Get all categories
        const { data: categoriesData } = await getCategories()
        if (categoriesData) {
          setCategories(categoriesData)
        }

        // Get products based on user type
        let productsData
        if (user?.user_type === "wholesaler") {
          // Wholesalers see only their own products
          const { data } = await getProducts({ supplierId: user.id })
          productsData = data
        } else if (user?.user_type === "dropshipper") {
          // Dropshippers see only products from their active partnerships
          const { data: partnerships } = await getActivePartnerships(user.id)

          if (partnerships && partnerships.length > 0) {
            // Get wholesaler IDs from active partnerships
            const wholesalerIds = partnerships.map((p) => p.wholesaler_id)

            // Get products from these wholesalers
            const { data } = await getProductsFromSuppliers(wholesalerIds)
            productsData = data
          } else {
            productsData = []
          }
        } else if (user?.user_type === "admin") {
          // Admins see all products
          const { data } = await getProducts()
          productsData = data
        } else {
          // Customers or non-logged in users see all active products
          const { data } = await getProducts()
          productsData = data?.filter((p) => p.is_active) || []
        }

        setProducts(productsData || [])

        // Extract unique suppliers from products
        if (productsData) {
          const uniqueSuppliers = Array.from(new Set(productsData.map((p) => p.supplier?.id)))
            .map((id) => {
              const supplier = productsData.find((p) => p.supplier?.id === id)?.supplier
              return supplier
            })
            .filter(Boolean)

          setSuppliers(uniqueSuppliers)
        }
      } catch (error) {
        console.error("Error loading products:", error)
        toast({
          title: "Failed to load products",
          description: "There was an error loading the products",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [user, toast])

  // Filter products based on search term and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesSupplier = supplierFilter === "all" || product.supplier?.id === supplierFilter

    return matchesSearch && matchesCategory && matchesSupplier
  })

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          {user?.user_type === "wholesaler"
            ? "Manage your product catalog and add new products to your store."
            : user?.user_type === "dropshipper"
              ? "Browse products from your partner wholesalers."
              : "Browse products available on the platform."}
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
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                      <SelectItem value="all">All Suppliers</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.full_name}
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
        {(user?.user_type === "wholesaler" || user?.user_type === "admin") && (
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
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images.find((img: any) => img.is_primary)?.url || product.images[0].url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={`/placeholder.svg?height=200&width=200&text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <CardHeader className="p-4">
              <CardTitle className="line-clamp-1">{product.name}</CardTitle>
              <CardDescription>
                {product.category} • {product.supplier?.full_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex justify-between">
                <div className="font-medium">RWF {product.price.toLocaleString()}</div>
                <div
                  className={`text-sm ${
                    product.stock_quantity > 20
                      ? "text-green-500"
                      : product.stock_quantity > 10
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {product.stock_quantity} in stock
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4">
              {user?.user_type === "wholesaler" && product.supplier?.id === user.id ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/products/${product.id}`}>Edit Product</Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/products/${product.id}`}>View Details</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="text-muted-foreground">No products found</div>
          {user?.user_type === "dropshipper" && (
            <p className="text-sm text-muted-foreground mt-2">
              You don't have any active partnerships with wholesalers yet.
              <Link href="/dashboard/partnerships/find" className="ml-1 text-primary hover:underline">
                Find partners
              </Link>
            </p>
          )}
          {user?.user_type !== "dropshipper" && (
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
          )}
        </div>
      )}
    </div>
  )
}

