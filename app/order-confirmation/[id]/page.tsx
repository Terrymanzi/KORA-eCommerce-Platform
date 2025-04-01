"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Home, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { getOrderById } from "@/lib/supabase/orders"

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await getOrderById(params.id)
        setOrder(orderData)
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        })
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [params.id, router, toast])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <p className="mt-2 text-muted-foreground">The order you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Format date
  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Calculate estimated delivery date (3-5 days from order date)
  const estimatedDeliveryDate = new Date(order.created_at)
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + (order.shipping_fee === 5000 ? 3 : 1))
  const formattedDeliveryDate = estimatedDeliveryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center text-center mb-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Thank you for your order. We've received your order and will begin processing it soon.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Order #{order.id.slice(0, 8)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div>
                  <h3 className="font-medium">Order Date</h3>
                  <p className="text-muted-foreground">{orderDate}</p>
                </div>
                <div>
                  <h3 className="font-medium">Order Status</h3>
                  <p className="text-yellow-500 font-medium">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Payment Status</h3>
                  <p
                    className={
                      order.payment_status === "paid" ? "text-green-500 font-medium" : "text-yellow-500 font-medium"
                    }
                  >
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-4">
                  {order.order_items.map((item: any) => {
                    // Find primary image
                    const primaryImage = item.products.product_images?.find((img: any) => img.is_primary)
                    const imageUrl =
                      primaryImage?.url ||
                      item.products.product_images?.[0]?.url ||
                      "/placeholder.svg?height=80&width=80&text=No+Image"

                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-md">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={item.products.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.products.name}</h3>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">RWF {item.price.toLocaleString()}</div>
                          <p className="text-sm font-medium">RWF {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Shipping Address</h3>
                  <div className="mt-2 text-sm">
                    <p>
                      {order.shipping_address.firstName} {order.shipping_address.lastName}
                    </p>
                    <p>{order.shipping_address.address}</p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.district}
                    </p>
                    <p>Rwanda</p>
                    <p>{order.shipping_address.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Shipping Method</h3>
                  <p className="mt-2 text-sm">
                    {order.shipping_fee === 5000 ? "Standard Delivery (2-3 days)" : "Express Delivery (1 day)"}
                  </p>
                  <h3 className="font-medium mt-4">Estimated Delivery</h3>
                  <p className="mt-2 text-sm">{formattedDeliveryDate}</p>
                  {order.tracking_number && (
                    <>
                      <h3 className="font-medium mt-4">Tracking Number</h3>
                      <p className="mt-2 text-sm">{order.tracking_number}</p>
                    </>
                  )}
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
                <span>RWF {order.shipping_fee.toLocaleString()}</span>
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
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">1. Order Processing</h3>
                <p className="text-sm text-muted-foreground">
                  We're preparing your order for shipment. You'll receive an email when it's on its way.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">2. Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Your order will be delivered to the address you provided. Estimated delivery: {formattedDeliveryDate}.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">3. Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Once your order is delivered, you'll receive a confirmation email.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full" asChild>
                <Link href={`/order-tracking/${order.id}`}>Track Order</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>If you have any questions about your order, please contact our customer support team.</p>
              <p className="font-medium">Email: support@kora.rw</p>
              <p className="font-medium">Phone: +250 78 123 4567</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-bold mb-4">Continue Shopping</h2>
        <Button asChild>
          <Link href="/products">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Products
          </Link>
        </Button>
      </div>
    </div>
  )
}

