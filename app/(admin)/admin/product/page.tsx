"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Package, DollarSign, Tag, ToggleLeft, Clock, MapPin, Mail, Phone} from "lucide-react";

interface ReturnShippingAddress {
    name: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    sku: string | null;
    isActive: boolean;
    preorderEnabled: boolean;
    preorderDepositAmount: number | null;
    contactEmail: string | null;
    contactPhone: string | null;
    returnShippingAddress: ReturnShippingAddress | null;
    createdAt: string;
    updatedAt: string;
}

const DEFAULT_RETURN_ADDRESS: ReturnShippingAddress = {
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
};

export default function ProductsAdminPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ contactEmail?: string; contactPhone?: string }>({});

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

    // Format phone number as +1 (XXX) XXX-XXXX
    const formatPhoneNumber = (value: string): string => {
        const digits = value.replace(/\D/g, "");
        // Strip leading "1" country code so we always work with 10 local digits
        const local = digits.startsWith("1") ? digits.slice(1) : digits;
        if (local.length === 0) return "";
        if (local.length <= 3) return `+1 (${local}`;
        if (local.length <= 6) return `+1 (${local.slice(0, 3)}) ${local.slice(3)}`;
        return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 10)}`;
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        const inputElement = e.target as HTMLInputElement;

        let finalValue: string | number | boolean = value;
        if (type === "checkbox") {
            finalValue = inputElement.checked;
        } else if (type === "number") {
            finalValue = parseInt(value) || 0;
        } else if (name === "contactPhone") {
            finalValue = formatPhoneNumber(value);
        }

        setFormData({
            ...formData,
            [name]: finalValue,
        });
    };

    // Handle return address field change
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        const currentAddress = (formData.returnShippingAddress as ReturnShippingAddress | null) || DEFAULT_RETURN_ADDRESS;
        setFormData({
            ...formData,
            returnShippingAddress: {
                ...currentAddress,
                [name]: value,
            },
        });
    };

    // Validate contact fields
    const validateContactFields = (): boolean => {
        const errors: { contactEmail?: string; contactPhone?: string } = {};
        const email = formData.contactEmail;
        const phone = formData.contactPhone;

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.contactEmail = "Please enter a valid email address";
        }
        if (phone) {
            const digits = phone.replace(/\D/g, "");
            if (digits.length !== 11) {
                errors.contactPhone = "Phone number must have 10 digits";
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Update product
    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        if (!validateContactFields()) return;

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
                <div className="bg-card border border-border rounded-ui p-6">
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
                                className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
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
                                className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
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
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                    placeholder="Product SKU"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-card border border-border rounded-ui p-6">
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
                                className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                min="0"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                Display price: ${((formData.price || 0) / 100).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pre-order Settings Card */}
                <div className="bg-card border border-border rounded-ui p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-card-foreground">Pre-order Settings</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-ui">
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
                                    className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
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
                <div className="bg-card border border-border rounded-ui p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ToggleLeft className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-card-foreground">Availability</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-ui">
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

                {/* Contact Information Card */}
                <div className="bg-card border border-border rounded-ui p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-card-foreground">Contact Information</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Displayed on the landing page in the contact section and footer.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-foreground mb-2">
                                Contact Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    id="contactEmail"
                                    name="contactEmail"
                                    value={formData.contactEmail || ""}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        if (fieldErrors.contactEmail) setFieldErrors((prev) => ({...prev, contactEmail: undefined}));
                                    }}
                                    className={`w-full pl-10 pr-4 py-2 bg-background border rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground ${fieldErrors.contactEmail ? "border-destructive" : "border-input"}`}
                                    placeholder="contact@bracuum.com"
                                />
                            </div>
                            {fieldErrors.contactEmail && (
                                <p className="text-sm text-destructive mt-1">{fieldErrors.contactEmail}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="contactPhone" className="block text-sm font-medium text-foreground mb-2">
                                Contact Phone
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="tel"
                                    id="contactPhone"
                                    name="contactPhone"
                                    value={formData.contactPhone || ""}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        if (fieldErrors.contactPhone) setFieldErrors((prev) => ({...prev, contactPhone: undefined}));
                                    }}
                                    className={`w-full pl-10 pr-4 py-2 bg-background border rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground ${fieldErrors.contactPhone ? "border-destructive" : "border-input"}`}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                            {fieldErrors.contactPhone && (
                                <p className="text-sm text-destructive mt-1">{fieldErrors.contactPhone}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Return Shipping Address Card */}
                <div className="bg-card border border-border rounded-ui p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-card-foreground">Return Shipping Address</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        This address is shown to customers when they request a return.
                    </p>

                    {(() => {
                        const addr = (formData.returnShippingAddress as ReturnShippingAddress | null) || DEFAULT_RETURN_ADDRESS;
                        return (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="addr-name" className="block text-sm font-medium text-foreground mb-2">
                                        Recipient Name
                                    </label>
                                    <input
                                        type="text"
                                        id="addr-name"
                                        name="name"
                                        value={addr.name}
                                        onChange={handleAddressChange}
                                        className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                        placeholder="e.g. Bracuum Returns"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="addr-line1" className="block text-sm font-medium text-foreground mb-2">
                                        Address Line 1
                                    </label>
                                    <input
                                        type="text"
                                        id="addr-line1"
                                        name="line1"
                                        value={addr.line1}
                                        onChange={handleAddressChange}
                                        className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                        placeholder="Street address"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="addr-line2" className="block text-sm font-medium text-foreground mb-2">
                                        Address Line 2 <span className="text-muted-foreground font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="addr-line2"
                                        name="line2"
                                        value={addr.line2}
                                        onChange={handleAddressChange}
                                        className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                        placeholder="Suite, unit, etc."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="addr-city" className="block text-sm font-medium text-foreground mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            id="addr-city"
                                            name="city"
                                            value={addr.city}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="addr-state" className="block text-sm font-medium text-foreground mb-2">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            id="addr-state"
                                            name="state"
                                            value={addr.state}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                            placeholder="State"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="addr-zip" className="block text-sm font-medium text-foreground mb-2">
                                            ZIP Code
                                        </label>
                                        <input
                                            type="text"
                                            id="addr-zip"
                                            name="zip"
                                            value={addr.zip}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                            placeholder="ZIP"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="addr-country" className="block text-sm font-medium text-foreground mb-2">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            id="addr-country"
                                            name="country"
                                            value={addr.country}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                            placeholder="Country"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-ui">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-ui">
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