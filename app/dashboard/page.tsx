"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowUpRight, DollarSign, Package, ShoppingCart, Truck, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getOrderStats } from "@/lib/supabase/orders"
import { getStoreByOwnerId } from "@/lib/supabase/stores"
import { getProducts } from "@/lib/supabase/products"
import { getPartnershipsByUserId } from "@/lib/supabase/partnerships"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalPartnerships: 0,
    pendingPartnerships: 0,
    hasStore: false,
  })
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadStats() {
      if (!user) return

      try {
        // Get order stats
        const { data: orderStats } = await getOrderStats(user.id, user.user_type as any)

        // Get store info if wholesaler or dropshipper
        let hasStore = false
        if (user.user_type === "wholesaler" || user.user_type === "dropshipper") {
          const { data: store } = await getStoreByOwnerId(user.id)
          hasStore = !!store
        }

        // Get product count and recent products if wholesaler
        let totalProducts = 0
        if (user.user_type === "wholesaler") {
          const { data: products } = await getProducts({ supplierId: user.id })
          totalProducts = products?.length || 0

          // Get recent products (last 3)
          const sortedProducts =
            products?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []
          setRecentProducts(sortedProducts.slice(0, 3))
        }

        // Get partnerships count
        let totalPartnerships = 0
        let pendingPartnerships = 0
        if (user.user_type === "wholesaler" || user.user_type === "dropshipper") {
          const { data: partnerships } = await getPartnershipsByUserId(
            user.id,
            user.user_type as "wholesaler" | "dropshipper",
          )

          totalPartnerships = partnerships?.filter((p) => p.status === "active").length || 0
          pendingPartnerships = partnerships?.filter((p) => p.status === "pending").length || 0
        }

        setStats({
          totalOrders: orderStats?.totalOrders || 0,
          pendingOrders: orderStats?.pendingOrders || 0,
          totalRevenue: orderStats?.totalRevenue || 0,
          totalProducts,
          totalPartnerships,
          pendingPartnerships,
          hasStore,
        })
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
        toast({
          title: "Failed to load stats",
          description: "There was an error loading your dashboard statistics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadStats()
    }
  }, [user, toast])

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user ? `, ${user.full_name}` : ""}! Here's an overview of your {user?.user_type} account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all your orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Pending or processing</p>
          </CardContent>
        </Card>
        {user?.user_type === "dropshipper" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partnerships</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPartnerships}</div>
              <p className="text-xs text-muted-foreground">Active partnerships</p>
            </CardContent>
          </Card>
        ) : user?.user_type === "wholesaler" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">In your inventory</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        )}
        {user?.user_type === "dropshipper" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Store Status</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hasStore ? "Active" : "Not Set Up"}</div>
              <p className="text-xs text-muted-foreground">
                {stats.hasStore ? "Your store is live" : "Create your store"}
              </p>
            </CardContent>
          </Card>
        ) : user?.user_type === "wholesaler" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partnership Requests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPartnerships}</div>
              <p className="text-xs text-muted-foreground">Pending requests</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Wishlist items</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user?.user_type === "customer" && (
              <>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/products">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Browse Products
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/orders">
                    <Package className="mr-2 h-4 w-4" />
                    View Orders
                  </Link>
                </Button>
              </>
            )}

            {user?.user_type === "wholesaler" && (
              <>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/products/add">
                    <Package className="mr-2 h-4 w-4" />
                    Add Product
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/partnerships/requests">
                    <Users className="mr-2 h-4 w-4" />
                    Partnership Requests
                    {stats.pendingPartnerships > 0 && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {stats.pendingPartnerships}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Manage Orders
                  </Link>
                </Button>
              </>
            )}

            {user?.user_type === "dropshipper" && (
              <>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/partnerships/find">
                    <Users className="mr-2 h-4 w-4" />
                    Find Wholesalers
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/store">
                    <Truck className="mr-2 h-4 w-4" />
                    {stats.hasStore ? "Manage Store" : "Create Store"}
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Manage Orders
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recent-orders" className="w-full">
        <TabsList>
          <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
          {user?.user_type === "dropshipper" ? (
            <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          ) : user?.user_type === "wholesaler" ? (
            <TabsTrigger value="products">Products</TabsTrigger>
          ) : (
            <TabsTrigger value="saved">Saved Items</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="recent-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your most recent orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.totalOrders > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((order) => (
                    <Card key={order}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Order #{order}23456</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Status:</div>
                          <div className="text-sm font-medium">
                            {order === 1 ? (
                              <span className="text-yellow-500">Processing</span>
                            ) : order === 2 ? (
                              <span className="text-blue-500">Shipped</span>
                            ) : (
                              <span className="text-green-500">Delivered</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Date:</div>
                          <div className="text-sm font-medium">
                            {order === 1 ? "Today" : order === 2 ? "Yesterday" : "3 days ago"}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Total:</div>
                          <div className="text-sm font-medium">RWF {order * 5000}</div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href={`/dashboard/orders/${order}`}>
                            View Details
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-muted-foreground">You don't have any orders yet</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </div>
              )}
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
              <CardDescription>Products in your inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentProducts.map((product) => (
                    <Card key={product.id}>
                      <CardHeader className="pb-2">
                        <div className="aspect-square w-full overflow-hidden rounded-md">
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
                      </CardHeader>
                      <CardContent className="pb-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">RWF {product.price.toLocaleString()}</p>
                        <div className="mt-2 flex items-center text-sm">
                          <span className={product.stock_quantity > 10 ? "text-green-500" : "text-yellow-500"}>
                            {product.stock_quantity > 10 ? "In Stock" : "Low Stock"}
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
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-muted-foreground">You don't have any products yet</p>
                  <Button className="mt-4" asChild>
                    <Link href="/dashboard/products/add">Add Your First Product</Link>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/products">View All Products</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Partnerships</CardTitle>
              <CardDescription>Active partnerships with wholesalers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.totalPartnerships > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((partnership) => (
                    <Card key={partnership}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Wholesaler Name {partnership}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Products:</div>
                          <div className="text-sm font-medium">{partnership * 5}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Commission:</div>
                          <div className="text-sm font-medium">{partnership * 2}%</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Status:</div>
                          <div className="text-sm font-medium text-green-500">Active</div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href={`/dashboard/partnerships/${partnership}`}>
                            View Details
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-muted-foreground">You don't have any active partnerships yet</p>
                  <Button className="mt-4" asChild>
                    <Link href="/dashboard/partnerships/find">Find Wholesalers</Link>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/partnerships">View All Partnerships</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Items</CardTitle>
              <CardDescription>Products you've saved for later</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-muted-foreground">You don't have any saved items yet</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

