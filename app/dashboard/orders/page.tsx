"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Filter, Package, Search, ShoppingCart, Truck } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getOrdersByUserId, getOrdersByDropshipperId, getOrderItemsBySupplier } from "@/lib/supabase/orders"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadOrders() {
      if (!user) return

      try {
        let ordersData: any[] = []

        if (user.user_type === "customer") {
          // Customers see their own orders
          const { data } = await getOrdersByUserId(user.id)
          ordersData = data || []
        } else if (user.user_type === "dropshipper") {
          // Dropshippers see orders from their store
          const { data } = await getOrdersByDropshipperId(user.id)
          ordersData = data || []
        } else if (user.user_type === "wholesaler") {
          // Wholesalers see order items for their products
          const { data } = await getOrderItemsBySupplier(user.id)

          // Group order items by order
          const orderMap = new Map()
          data?.forEach((item) => {
            if (!orderMap.has(item.order.id)) {
              orderMap.set(item.order.id, {
                ...item.order,
                items: [item],
                total: item.price * item.quantity,
              })
            } else {
              const order = orderMap.get(item.order.id)
              order.items.push(item)
              order.total += item.price * item.quantity
            }
          })

          ordersData = Array.from(orderMap.values())
        }

        // Sort orders by date (newest first)
        ordersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setOrders(ordersData)
        setFilteredOrders(ordersData)
      } catch (error) {
        console.error("Error loading orders:", error)
        toast({
          title: "Failed to load orders",
          description: "There was an error loading your orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user, toast])

  useEffect(() => {
    // Filter orders based on search term and status filter
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter((order) => order.id.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter, orders])

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Shipped
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Function to get payment status badge color
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Paid
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          {user?.user_type === "customer"
            ? "View and track your orders"
            : user?.user_type === "dropshipper"
              ? "Manage orders from your store"
              : "Manage orders for your products"}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
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
                <SheetDescription>Filter orders by status and date</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Status</h3>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("all")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Tabs defaultValue="all" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
              All
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
              Pending
            </TabsTrigger>
            <TabsTrigger value="processing" onClick={() => setStatusFilter("processing")}>
              Processing
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setStatusFilter("delivered")}>
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
            {user?.user_type === "customer" && (
              <Button className="mt-4" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                    <CardDescription>Placed on {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Status:</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">Payment:</span>
                      {getPaymentBadge(order.payment_status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  {/* Show order items if available */}
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{item.product?.name || `Product #${index + 1}`}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-sm font-medium">RWF {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          + {order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Amount:</span>
                      <span className="text-sm font-medium">RWF {order.total.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Show shipping address for dropshippers and wholesalers */}
                  {(user?.user_type === "dropshipper" || user?.user_type === "wholesaler") && (
                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-medium mb-1">Shipping Address:</h4>
                      <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/orders/${order.id}`}>View Details</Link>
                </Button>

                {/* Show different action buttons based on user type and order status */}
                {user?.user_type === "dropshipper" && order.status === "pending" && <Button>Process Order</Button>}

                {user?.user_type === "wholesaler" && order.status === "processing" && (
                  <Button>
                    <Truck className="mr-2 h-4 w-4" />
                    Mark as Shipped
                  </Button>
                )}

                {user?.user_type === "customer" && order.status === "delivered" && (
                  <Button variant="outline">
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Receipt
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

