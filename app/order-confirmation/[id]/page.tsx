"use client"

import { useState, useEffect } from "react"
<<<<<<< HEAD
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getOrderById } from "@/lib/supabase/orders"

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

        // Check if the order belongs to the current user
        if (data.user_id !== user.id) {
          router.push("/dashboard")
          return
        }

        setOrder(data)
      } catch (err) {
        console.error("Error loading order:", err)
        setError("Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadOrder()
    }
  }, [params.id, user, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
=======
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
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
      </div>
    )
  }

<<<<<<< HEAD
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
=======
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
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
      </div>
    )
  }

<<<<<<< HEAD
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-green-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">Order Confirmed</h3>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Thank you for your order! Your order has been received and is being processed.
          </p>
        </div>

        {order && (
          <>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Order number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.id}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date placed</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(order.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Order status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Shipping address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.shipping_address}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment method</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.payment_method.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-800"
                          : order.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total amount</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${order.total.toFixed(2)}</dd>
                </div>
              </dl>
            </div>

            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
            </div>

            <div className="border-t border-gray-200">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View All Orders
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue Shopping
          </Link>
        </div>
=======
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
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
      </div>
    </div>
  )
}

