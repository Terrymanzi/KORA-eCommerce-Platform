"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Clock, Download, MessageSquare, Package, Send, Truck, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getOrderById, updateOrder } from "@/lib/supabase/orders"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [messageText, setMessageText] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadOrder() {
      if (!user) return

      try {
        const { data, error } = await getOrderById(params.id)

        if (error) throw error

        // Check if user has access to this order
        if (user.user_type === "customer" && data.user_id !== user.id) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this order",
            variant: "destructive",
          })
          router.push("/dashboard/orders")
          return
        }

        setOrder(data)
      } catch (error) {
        console.error("Error loading order:", error)
        toast({
          title: "Failed to load order",
          description: "There was an error loading the order details",
          variant: "destructive",
        })
        router.push("/dashboard/orders")
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [params.id, user, router, toast])

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return

    setIsUpdating(true)

    try {
      const { data, error } = await updateOrder(order.id, { status: newStatus })

      if (error) throw error

      setOrder(data)

      toast({
        title: "Order updated",
        description: `Order status has been updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Failed to update order",
        description: "There was an error updating the order status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendMessage = () => {
    if (!messageText.trim()) return

    // In a real app, this would send a message to the other party
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully",
    })

    setMessageText("")
  }

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

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Order not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center">
        <Link
          href="/dashboard/orders"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Order #{order.id.substring(0, 8)}</h1>
        <p className="text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm">Current Status:</span>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-muted"></div>
                <div className="space-y-8">
                  <div className="relative flex gap-6">
                    <div
                      className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                        order.status !== "cancelled"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-background"
                      }`}
                    >
                      <Clock className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium">Order Placed</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} •{" "}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex gap-6">
                    <div
                      className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                        order.status === "processing" || order.status === "shipped" || order.status === "delivered"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-background"
                      }`}
                    >
                      <Package className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium">Processing</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.status === "processing" || order.status === "shipped" || order.status === "delivered"
                          ? "Your order is being processed"
                          : "Waiting for processing"}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex gap-6">
                    <div
                      className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                        order.status === "shipped" || order.status === "delivered"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-background"
                      }`}
                    >
                      <Truck className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium">Shipped</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.status === "shipped" || order.status === "delivered"
                          ? order.tracking_number
                            ? `Tracking Number: ${order.tracking_number}`
                            : "Your order has been shipped"
                          : "Waiting for shipment"}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex gap-6">
                    <div
                      className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                        order.status === "delivered"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-background"
                      }`}
                    >
                      <Check className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium">Delivered</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.status === "delivered" ? "Your order has been delivered" : "Waiting for delivery"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {user?.user_type === "dropshipper" && order.status === "pending" && (
                <Button onClick={() => handleUpdateStatus("processing")} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Process Order"}
                </Button>
              )}

              {user?.user_type === "wholesaler" && order.status === "processing" && (
                <Button onClick={() => handleUpdateStatus("shipped")} disabled={isUpdating}>
                  <Truck className="mr-2 h-4 w-4" />
                  {isUpdating ? "Updating..." : "Mark as Shipped"}
                </Button>
              )}

              {user?.user_type === "dropshipper" && order.status === "shipped" && (
                <Button onClick={() => handleUpdateStatus("delivered")} disabled={isUpdating}>
                  <Check className="mr-2 h-4 w-4" />
                  {isUpdating ? "Updating..." : "Mark as Delivered"}
                </Button>
              )}

              {user?.user_type === "customer" && order.status !== "cancelled" && order.status !== "delivered" && (
                <Button variant="outline" onClick={() => handleUpdateStatus("cancelled")} disabled={isUpdating}>
                  <X className="mr-2 h-4 w-4" />
                  {isUpdating ? "Cancelling..." : "Cancel Order"}
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Items included in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img
                          src={
                            item.product.images.find((img: any) => img.is_primary)?.url || item.product.images[0].url
                          }
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product?.name || "Product"}</h3>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">RWF {item.price.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">per item</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Contact the seller about this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Message History</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Type your message here..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button onClick={handleSendMessage} className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>RWF {order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>RWF 0</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>RWF {order.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium">Payment Status</span>
                {getPaymentBadge(order.payment_status)}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Delivery Address</h3>
                <p className="text-sm text-muted-foreground mt-1">{order.shipping_address}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Payment Method</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.payment_method.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </p>
              </div>
              {order.tracking_number && (
                <div>
                  <h3 className="text-sm font-medium">Tracking Number</h3>
                  <p className="text-sm text-muted-foreground mt-1">{order.tracking_number}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <h3 className="text-sm font-medium">Order Notes</h3>
                  <p className="text-sm text-muted-foreground mt-1">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Report an Issue
              </Button>
              {user?.user_type === "customer" && order.status === "delivered" && (
                <Button variant="outline" className="w-full">
                  Request Return
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

