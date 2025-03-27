"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Home,
  MapPin,
  MessageSquare,
  Package,
  Send,
  ShoppingBag,
  Truck,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import type { Order } from "@/services/dashboard-service"
import { type Shipment, shipmentService } from "@/services/shipment-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState("")
  const [showMessages, setShowMessages] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrderAndShipment = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        // In a real app, you would fetch the order from your database
        // For this example, we'll use the shipment service to get shipment data
        const shipmentData = await shipmentService.getShipmentByOrderId(params.id)
        setShipment(shipmentData)

        // Fetch order data (this would come from your order service in a real app)
        // For now, we'll use mock data
        setOrder({
          id: params.id,
          userId: user.uid,
          userName: user.displayName || "User",
          items: [
            {
              productId: "1",
              productName: "Smartphone X",
              price: 120000,
              quantity: 1,
            },
            {
              productId: "2",
              productName: "Designer T-Shirt",
              price: 15000,
              quantity: 2,
            },
          ],
          status: shipmentData?.status === "delivered" ? "delivered" : "shipped",
          shippingAddress: {
            name: "John Doe",
            address: "123 Main St, Kigali",
            city: "Kigali",
            district: "Gasabo",
            phone: "+250 78 123 4567",
          },
          paymentMethod: "mobile_money",
          subtotal: 150000,
          shipping: 5000,
          total: 155000,
          createdAt: Date.now() - 86400000, // 1 day ago
          updatedAt: Date.now() - 43200000, // 12 hours ago
        })
      } catch (error) {
        console.error("Error fetching order data:", error)
        toast({
          title: "Error",
          description: "Failed to load order tracking information. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrderAndShipment()
  }, [user, params.id, router, toast])

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message to an API
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller.",
      })
      setMessageText("")
    }
  }

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ShoppingBag className="h-6 w-6" />
      case "processing":
        return <Package className="h-6 w-6" />
      case "shipped":
      case "in_transit":
        return <Truck className="h-6 w-6" />
      case "out_for_delivery":
        return <MapPin className="h-6 w-6" />
      case "delivered":
        return <Check className="h-6 w-6" />
      default:
        return <Clock className="h-6 w-6" />
    }
  }

  // Helper function to get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Order Placed"
      case "processing":
        return "Processing"
      case "shipped":
      case "in_transit":
        return "Shipped"
      case "out_for_delivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Truck className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-medium">Loading tracking information...</h2>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-medium">Order not found</h2>
          <p className="mt-2 text-muted-foreground">The requested order could not be found.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/orders">View All Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Create timeline from shipment events or use default if no shipment
  const timeline = shipment
    ? shipment.events.map((event) => ({
        status: event.status,
        date: new Date(event.timestamp).toLocaleDateString(),
        time: new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        completed: true,
        description: event.description,
        location: event.location,
      }))
    : [
        {
          status: "pending",
          date: new Date(order.createdAt).toLocaleDateString(),
          time: new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          completed: true,
          description: "Order placed",
        },
        {
          status: "processing",
          date: new Date(order.createdAt + 14400000).toLocaleDateString(), // +4 hours
          time: new Date(order.createdAt + 14400000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          completed: true,
          description: "Order processing",
        },
        {
          status: "shipped",
          date: new Date(order.createdAt + 86400000).toLocaleDateString(), // +24 hours
          time: new Date(order.createdAt + 86400000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          completed: true,
          description: "Order shipped",
        },
        {
          status: "out_for_delivery",
          date: new Date(order.createdAt + 259200000).toLocaleDateString(), // +3 days
          time: "Expected",
          completed: false,
          description: "Out for delivery",
        },
        {
          status: "delivered",
          date: new Date(order.createdAt + 345600000).toLocaleDateString(), // +4 days
          time: "Expected",
          completed: false,
          description: "Delivered",
        },
      ]

  // Mock messages data
  const messages = [
    {
      id: 1,
      sender: "customer",
      text: "Hi, is my order still on track for delivery on March 28?",
      timestamp: "March 25, 2025 • 11:30 AM",
    },
    {
      id: 2,
      sender: "seller",
      text: "Yes, your order has been shipped and is on schedule for delivery on March 28.",
      timestamp: "March 25, 2025 • 12:15 PM",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/dashboard/orders"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString()} •
              {shipment && ` Tracking Number: ${shipment.trackingNumber}`}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>
                Current status: <span className="font-medium text-primary">{getStatusText(order.status)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-muted"></div>
                <div className="space-y-8">
                  {timeline.map((step, index) => (
                    <div key={index} className="relative flex gap-6">
                      <div
                        className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                          step.completed
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted bg-background"
                        }`}
                      >
                        {getStatusIcon(step.status)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-medium">{getStatusText(step.status)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {step.date} • {step.time}
                        </p>
                        {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
                        {step.location && (
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="inline-block h-3 w-3 mr-1" /> {step.location}
                          </p>
                        )}
                        {step.status === "shipped" && shipment && (
                          <div className="mt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`https://track.delivery.com/${shipment.trackingNumber}`} target="_blank">
                                Track Package
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>{order.items.length} items in your order</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-md">
                      <img
                        src={`/placeholder.svg?height=80&width=80&text=${encodeURIComponent(item.productName)}`}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.productName}</h3>
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
              <CardTitle>Contact Seller</CardTitle>
              <CardDescription>Have questions about your order? Contact the seller directly.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" className="w-full" onClick={() => setShowMessages(!showMessages)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {showMessages ? "Hide Messages" : "View Message History"}
                    {showMessages ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                  </Button>
                </div>

                {showMessages && (
                  <div className="rounded-lg border p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex flex-col ${message.sender === "customer" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === "customer" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {message.text}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{message.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}

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
                <span>RWF {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>RWF {order.shipping.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>RWF {order.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Delivery Address</h3>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.name}
                  <br />
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.district}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Contact</h3>
                <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
              </div>
              <div>
                <h3 className="font-medium">Estimated Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  {shipment
                    ? new Date(shipment.estimatedDelivery).toLocaleDateString()
                    : new Date(order.createdAt + 345600000).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Download Invoice
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Report an Issue
              </Button>
              <Button variant="outline" className="w-full">
                Request Return
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

