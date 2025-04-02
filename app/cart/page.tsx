"use client"

<<<<<<< HEAD
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"

export default function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const { cartItems, loading: cartLoading, updateItem, removeItem, subtotal } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
=======
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { getCart, updateCartItemQuantity, removeCartItem, clearCart } from "@/lib/supabase/cart"

export default function CartPage() {
  const [cart, setCart] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await getCart()
        setCart(cartData)
      } catch (error) {
        console.error("Error fetching cart:", error)
        toast({
          title: "Error",
          description: "Failed to load your cart. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [toast])

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateCartItemQuantity(itemId, newQuantity)

      // Update local state
      const updatedItems = cart.items.map((item: any) => {
        if (item.id === itemId) {
          return { ...item, quantity: newQuantity }
        }
        return item
      })

      const subtotal = updatedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
      const itemCount = updatedItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

      setCart({
        ...cart,
        items: updatedItems,
        subtotal,
        itemCount,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeCartItem(itemId)

      // Update local state
      const updatedItems = cart.items.filter((item: any) => item.id !== itemId)
      const subtotal = updatedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
      const itemCount = updatedItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

      setCart({
        ...cart,
        items: updatedItems,
        subtotal,
        itemCount,
      })

      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()

      // Update local state
      setCart({
        ...cart,
        items: [],
        subtotal: 0,
        itemCount: 0,
      })

      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
      </div>
    )
  }

  return (
<<<<<<< HEAD
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Looks like you haven't added any products to your cart yet.</p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 sm:py-5 sm:grid sm:grid-cols-5 sm:gap-4 sm:px-6 items-center">
                  <dt className="text-sm font-medium text-gray-500 sm:col-span-1">
                    {item.product.primary_image ? (
                      <Image
                        src={item.product.primary_image || "/placeholder.svg"}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Link href={`/products/${item.product_id}`} className="font-medium hover:text-indigo-600">
                      {item.product.name}
                    </Link>
                    <p className="text-gray-500 mt-1">${item.price_at_addition.toFixed(2)}</p>
                  </dd>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">
                    <div className="flex items-center">
                      <button
                        onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </dd>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1 text-right">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">${(item.price_at_addition * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
            <div className="mt-6">
              <Link
                href="/checkout"
                className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Checkout
              </Link>
              <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                <p>
                  or{" "}
                  <Link href="/products" className="text-indigo-600 font-medium hover:text-indigo-500">
                    Continue Shopping<span aria-hidden="true"> &rarr;</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
=======
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/products" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
        <p className="text-muted-foreground">
          {cart?.itemCount > 0
            ? `You have ${cart.itemCount} item${cart.itemCount !== 1 ? "s" : ""} in your cart.`
            : "Your cart is empty."}
        </p>
      </div>

      {cart?.items.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item: any) => {
                  // Find primary image
                  const primaryImage = item.products.product_images?.find((img: any) => img.is_primary)
                  const imageUrl =
                    primaryImage?.url ||
                    item.products.product_images?.[0]?.url ||
                    "/placeholder.svg?height=80&width=80&text=No+Image"

                  return (
                    <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-0">
                      <div className="h-20 w-20 overflow-hidden rounded-md">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={item.products.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.products.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Sold by: {item.stores?.name || "Unknown Seller"}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">RWF {item.price.toLocaleString()}</div>
                        <div className="mt-1 text-sm font-medium">
                          RWF {(item.price * item.quantity).toLocaleString()}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-2 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleClearCart}>
                  Clear Cart
                </Button>
              </CardFooter>
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
                  <span>RWF {cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>RWF {cart.subtotal.toLocaleString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added any products to your cart yet.</p>
          <Button className="mt-6" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        </div>
      )}
    </div>
  )
}

