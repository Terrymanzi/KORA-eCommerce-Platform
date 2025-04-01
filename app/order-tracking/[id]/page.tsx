"use client"

import { useState } from "react"
import Link from "next/link"
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

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [messageText, setMessageText] = useState("")
  const [showMessages, setShowMessages] = useState(false)

  // Mock order data - in a real app, this would come from an API
  const order = {
    id: params.id,
    status: "shipped",
    date: "March 24, 2025",
    estimatedDelivery: "March 28, 2025",
    trackingNumber: "RW" + params.id + "12345",
    customer: {
      name: "John Doe",
      address: "123 Main St, Kigali, Rwanda",
      phone: "+250 78 123 4567",
    },
    items: [
      {
        id: 1,
        name: "Smartphone X",
        price: 120000,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=Smartphone",
      },
      {
        id: 2,
        name: "Designer T-Shirt",
        price: 15000,
        quantity: 2,
        image: "/placeholder.svg?height=80&width=80&text=T-Shirt",
      },
    ],
    subtotal: 150000,
    shipping: 5000,
    total: 155000,
    timeline: [
      {
        status: "ordered",
        date: "March 24, 2025",
        time: "10:30 AM",
        completed: true,
      },
      {
        status: "processing",
        date: "March 24, 2025",
        time: "2:45 PM",
        completed: true,
      },
      {
        status: "shipped",
        date: "March 25, 2025",
        time: "9:15 AM",
        completed: true,
      },
      {
        status: "out_for_delivery",
        date: "March 28, 2025",
        time: "Expected",
        completed: false,
      },
      {
        status: "delivered",
        date: "March 28, 2025",
        time: "Expected",
        completed: false,
      },
    ],
    messages: [
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
    ],
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message to an API
      alert("Message sent: " + messageText)
      setMessageText("")
    }
  }

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ordered":
        return <ShoppingBag className="h-6 w-6" />
      case "processing":
        return <Package className="h-6 w-6" />
      case "shipped":
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
      case "ordered":
        return "Order Placed"
      case "processing":
        return "Processing"
      case "shipped":
        return "Shipped"
      case "out_for_delivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      default:
        return status
    }
  }

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
              Placed on {order.date} • Tracking Number: {order.trackingNumber}
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
                  {order.timeline.map((step, index) => (
                    <div key={step.status} className="relative flex gap-6">
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
                        {step.status === "shipped" && (
                          <div className="mt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`https://track.delivery.com/${order.trackingNumber}`} target="_blank">
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
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-md">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
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
                    {order.messages.map((message) => (
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
                  {order.customer.name}
                  <br />
                  {order.customer.address}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Contact</h3>
                <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
              </div>
              <div>
                <h3 className="font-medium">Estimated Delivery</h3>
                <p className="text-sm text-muted-foreground">{order.estimatedDelivery}</p>
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

