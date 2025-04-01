"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, DollarSign, Package, ShoppingCart, Truck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getUserProfile } from "@/lib/supabase/auth"
import { getProducts } from "@/lib/supabase/products"
import { getOrders } from "@/lib/supabase/orders"
import { getPartnerships } from "@/lib/supabase/partnerships"

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [partnerships, setPartnerships] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profile = await getUserProfile()
        setUserProfile(profile)

        // Fetch products (for wholesalers or dropshippers)
        if (profile?.user_type === "wholesaler" || profile?.user_type === "dropshipper") {
          const { data: productsData } = await getProducts({ limit: 3 })
          setProducts(productsData || [])
        }

        // Fetch orders
        const { data: ordersData } = await getOrders({ limit: 3 })
        setOrders(ordersData || [])

        // Fetch partnerships (for wholesalers or dropshippers)
        if (profile?.user_type === "wholesaler" || profile?.user_type === "dropshipper") {
          const partnershipsData = await getPartnerships({
            role: profile.user_type as "wholesaler" | "dropshipper",
            status: "active",
          })
          setPartnerships(partnershipsData || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const userType = userProfile?.user_type || "customer"

  // Calculate stats
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
  const activeOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "processing" || order.status === "shipped",
  ).length
  const newOrdersToday = orders.filter((order) => {
    const orderDate = new Date(order.created_at)
    const today = new Date()
    return orderDate.toDateString() === today.toDateString()
  }).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userProfile?.full_name || "User"}! Here's an overview of your {userType} account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF {totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {orders.length} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground">{newOrdersToday} new orders today</p>
          </CardContent>
        </Card>
        {userType === "dropshipper" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">From {partnerships.length} different suppliers</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter((p) => p.stock < 10).length} items low in stock
              </p>
            </CardContent>
          </Card>
        )}
        {userType === "dropshipper" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partnerships</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerships.length}</div>
              <p className="text-xs text-muted-foreground">
                {partnerships.filter((p) => p.status === "pending").length} pending requests
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipments</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter((order) => order.status === "shipped").length}</div>
              <p className="text-xs text-muted-foreground">
                {orders.filter((order) => order.status === "processing").length} pending shipments
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="recent-orders" className="w-full">
        <TabsList>
          <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
          {userType === "dropshipper" ? (
            <TabsTrigger value="products">Products</TabsTrigger>
          ) : (
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="recent-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>You have {orders.length} orders this month.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.slice(0, 3).map((order) => {
                  // Get first item image
                  const firstItem = order.order_items?.[0]
                  const primaryImage = firstItem?.products?.product_images?.find((img: any) => img.is_primary)
                  const imageUrl =
                    primaryImage?.url ||
                    firstItem?.products?.product_images?.[0]?.url ||
                    "/placeholder.svg?height=80&width=80&text=No+Image"

                  return (
                    <Card key={order.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Order #{order.id.slice(0, 8)}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Status:</div>
                          <div className="text-sm font-medium">
                            {order.status === "pending" ? (
                              <span className="text-yellow-500">Pending</span>
                            ) : order.status === "processing" ? (
                              <span className="text-yellow-500">Processing</span>
                            ) : order.status === "shipped" ? (
                              <span className="text-blue-500">Shipped</span>
                            ) : order.status === "delivered" ? (
                              <span className="text-green-500">Delivered</span>
                            ) : (
                              <span className="text-red-500">Cancelled</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Date:</div>
                          <div className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Total:</div>
                          <div className="text-sm font-medium">RWF {order.total.toLocaleString()}</div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href={`/order-tracking/${order.id}`}>
                            View Details
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>You have {products.length} products in your store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 3).map((product) => {
                  // Find primary image
                  const primaryImage = product.product_images?.find((img: any) => img.is_primary)
                  const imageUrl =
                    primaryImage?.url ||
                    product.product_images?.[0]?.url ||
                    "/placeholder.svg?height=200&width=200&text=No+Image"

                  return (
                    <Card key={product.id}>
                      <CardHeader className="pb-2">
                        <div className="aspect-square w-full overflow-hidden rounded-md">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">RWF {product.price.toLocaleString()}</p>
                        <div className="mt-2 flex items-center text-sm">
                          <span className={product.stock > 10 ? "text-green-500" : "text-yellow-500"}>
                            {product.stock > 10 ? "In Stock" : "Low Stock"}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href={`/dashboard/products/${product.id}`}>
                            Edit Product
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/products">View All Products</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Inventory</CardTitle>
              <CardDescription>You have {products.length} items in your inventory.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 3).map((product) => {
                  // Find primary image
                  const primaryImage = product.product_images?.find((img: any) => img.is_primary)
                  const imageUrl =
                    primaryImage?.url ||
                    product.product_images?.[0]?.url ||
                    "/placeholder.svg?height=200&width=200&text=No+Image"

                  return (
                    <Card key={product.id}>
                      <CardHeader className="pb-2">
                        <div className="aspect-square w-full overflow-hidden rounded-md">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">RWF {product.price.toLocaleString()}</p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span>Stock:</span>
                          <span className={product.stock > 10 ? "text-green-500" : "text-yellow-500"}>
                            {product.stock} units
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href={`/dashboard/inventory/${product.id}`}>
                            Manage Stock
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/inventory">View All Inventory</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

