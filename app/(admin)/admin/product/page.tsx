"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Package, DollarSign, Tag, ToggleLeft, Clock} from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    sku: string | null;
    isActive: boolean;
    preorderEnabled: boolean;
    preorderDepositAmount: number | null;
    createdAt: string;
    updatedAt: string;
}

export default function ProductsAdminPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch the product
    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            const firstProduct = data.data?.[0];
            if (firstProduct) {
                setProduct(firstProduct);
                setFormData(firstProduct);
            }
        } catch (err) {
            setError("Failed to fetch product");
        }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        const inputElement = e.target as HTMLInputElement;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? inputElement.checked : type === "number" ? parseInt(value) || 0 : value,
        });
    };

    // Update product
    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update product");
            }

            const updatedProduct = await res.json();
            setSuccess("Product updated successfully!");
            setProduct(updatedProduct);
            setFormData(updatedProduct);
            
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading product...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-background p-8 overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Product Settings</h1>
                <p className="text-muted-foreground">Manage your product details and availability</p>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-6 max-w-3xl">
                {/* Product Information Card */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-card-foreground">Product Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                                Product Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name || ""}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                placeholder="Enter product name"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description || ""}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                                placeholder="Enter product description"
                            />
                        </div>

                        <div>
                            <label htmlFor="sku" className="block text-sm font-medium text-foreground mb-2">
                                SKU
                            </label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    id="sku"
                                    name="sku"
                                    value={formData.sku || ""}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                    placeholder="Product SKU"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-card-foreground">Pricing</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                                Price (in cents)
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price || 0}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                min="0"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                Display price: ${((formData.price || 0) / 100).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pre-order Settings Card */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-card-foreground">Pre-order Settings</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <p className="font-medium text-foreground">Enable Pre-orders</p>
                                <p className="text-sm text-muted-foreground">Allow customers to pre-order this product</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="preorderEnabled"
                                    checked={formData.preorderEnabled || false}
                                    onChange={handleInputChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {formData.preorderEnabled && (
                            <div>
                                <label htmlFor="preorderDepositAmount" className="block text-sm font-medium text-foreground mb-2">
                                    Pre-order Deposit (in cents)
                                </label>
                                <input
                                    type="number"
                                    id="preorderDepositAmount"
                                    name="preorderDepositAmount"
                                    value={formData.preorderDepositAmount || 0}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                    min="0"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Display amount: ${((formData.preorderDepositAmount || 0) / 100).toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Availability Card */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ToggleLeft className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-card-foreground">Availability</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                            <p className="font-medium text-foreground">Product Active</p>
                            <p className="text-sm text-muted-foreground">Make this product visible to customers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive || false}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData(product)}
                        disabled={loading}
                    >
                        Reset Changes
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="min-w-[120px]"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}