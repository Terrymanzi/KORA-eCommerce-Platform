"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, BarChart3, DollarSign, Package, ShoppingCart, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    newUsers: 0,
    pendingOrders: 0,
    pendingProducts: 0,
    revenueGrowth: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users count
        const { count: usersCount, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        if (usersError) throw usersError

        // Fetch recent users
        const { data: users, error: recentUsersError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentUsersError) throw recentUsersError

        // Fetch orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })

        if (ordersError) throw ordersError

        // Fetch pending orders count
        const { count: pendingOrdersCount, error: pendingOrdersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")

        if (pendingOrdersError) throw pendingOrdersError

        // Fetch recent orders
        const { data: orders, error: recentOrdersError } = await supabase
          .from("orders")
          .select(`
            *,
            profiles!inner (
              id,
              full_name,
              user_type
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentOrdersError) throw recentOrdersError

        // Fetch products count
        const { count: productsCount, error: productsError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })

        if (productsError) throw productsError

        // Fetch recent products
        const { data: products, error: recentProductsError } = await supabase
          .from("products")
          .select(`
            *,
            product_images (
              id,
              url,
              is_primary
            ),
            profiles!supplier_id (
              id,
              full_name
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentProductsError) throw recentProductsError

        // Calculate total revenue
        const { data: allOrders, error: allOrdersError } = await supabase.from("orders").select("total")

        if (allOrdersError) throw allOrdersError

        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0)

        // Calculate new users in the last week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const { count: newUsersCount, error: newUsersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", oneWeekAgo.toISOString())

        if (newUsersError) throw newUsersError

        // Set stats
        setStats({
          totalUsers: usersCount || 0,
          totalOrders: ordersCount || 0,
          totalProducts: productsCount || 0,
          totalRevenue: totalRevenue,
          newUsers: newUsersCount || 0,
          pendingOrders: pendingOrdersCount || 0,
          pendingProducts: 0, // We don't have a pending status for products
          revenueGrowth: 12.5, // Placeholder, would need to calculate from historical data
        })

        setRecentUsers(users || [])
        setRecentOrders(orders || [])
        setRecentProducts(products || [])
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error)
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the KORA admin dashboard. Here's an overview of your platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats.newUsers} new users this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingOrders} pending orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingProducts} pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats.revenueGrowth}% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground" />
              <span className="ml-4 text-muted-foreground">Revenue chart will be displayed here</span>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest activities on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentOrders.slice(0, 3).map((order, index) => (
                <div key={order.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      New order #{order.id.slice(0, 8)} placed by {order.profiles.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {recentUsers.slice(0, 2).map((user, index) => (
                <div key={user.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      New {user.user_type} registered: {user.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Recently registered users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url || "/placeholder.svg"}
                            alt={user.full_name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground">
                              {user.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.user_type}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/users">View All Users</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Recently placed orders on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">RWF {order.total.toLocaleString()}</div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="sr-only">View order</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>Recently added products on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProducts.map((product) => {
                  // Find primary image
                  const primaryImage = product.product_images?.find((img: any) => img.is_primary)
                  const imageUrl =
                    primaryImage?.url ||
                    product.product_images?.[0]?.url ||
                    "/placeholder.svg?height=40&width=40&text=No+Image"

                  return (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 overflow-hidden rounded-md">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Added {new Date(product.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">RWF {product.price.toLocaleString()}</div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                            <span className="sr-only">View product</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/products">View All Products</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

