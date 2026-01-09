"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";

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
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch all products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(data.data || []);
        } catch (err) {
            setError("Failed to fetch products");
        }
    };

    // Select a product to edit
    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setFormData(product);
        setError("");
        setSuccess("");
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        const inputElement = e.target as HTMLInputElement;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? inputElement.checked : type === "number" ? parseInt(value) : value,
        });
    };

    // Update product
    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/products/${selectedProduct.id}`, {
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
            setSelectedProduct(updatedProduct);
            setFormData(updatedProduct);

            // Refresh products list
            fetchProducts();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{maxWidth: "1200px", margin: "0 auto", padding: "20px"}}>
            <h1>Product Management</h1>

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px"}}>
                {/* Products List */}
                <div style={{border: "1px solid #ccc", padding: "20px", borderRadius: "8px"}}>
                    <h2>Products</h2>
                    <div style={{maxHeight: "600px", overflowY: "auto"}}>
                        {products.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleSelectProduct(product)}
                                style={{
                                    padding: "10px",
                                    marginBottom: "10px",
                                    border: selectedProduct?.id === product.id ? "2px solid blue" : "1px solid #ddd",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    backgroundColor: selectedProduct?.id === product.id ? "#e3f2fd" : "#f9f9f9",
                                }}
                            >
                                <strong>{product.name}</strong>
                                <p style={{margin: "5px 0 0 0", fontSize: "12px", color: "#666"}}>
                                    ${(product.price / 100).toFixed(2)} • ID: {product.id.substring(0, 8)}...
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Edit Form */}
                <div style={{border: "1px solid #ccc", padding: "20px", borderRadius: "8px"}}>
                    {selectedProduct ? (
                        <>
                            <h2>Edit Product</h2>
                            <form onSubmit={handleUpdateProduct}>
                                <div style={{marginBottom: "15px"}}>
                                    <label>Name:</label>
                                    <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} style={{width: "100%", padding: "8px", marginTop: "5px"}} />
                                </div>

                                <div style={{marginBottom: "15px"}}>
                                    <label>Description:</label>
                                    <textarea name="description" value={formData.description || ""} onChange={handleInputChange} style={{width: "100%", padding: "8px", marginTop: "5px", minHeight: "80px"}} />
                                </div>

                                <div style={{marginBottom: "15px"}}>
                                    <label>Price (in cents):</label>
                                    <input type="number" name="price" value={formData.price || 0} onChange={handleInputChange} style={{width: "100%", padding: "8px", marginTop: "5px"}} />
                                    <small>Current: ${((formData.price || 0) / 100).toFixed(2)}</small>
                                </div>

                                <div style={{marginBottom: "15px"}}>
                                    <label>SKU:</label>
                                    <input type="text" name="sku" value={formData.sku || ""} onChange={handleInputChange} style={{width: "100%", padding: "8px", marginTop: "5px"}} />
                                </div>

                                <div style={{marginBottom: "15px"}}>
                                    <label>
                                        <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={handleInputChange} /> Active
                                    </label>
                                </div>

                                <div style={{marginBottom: "15px"}}>
                                    <label>
                                        <input type="checkbox" name="preorderEnabled" checked={formData.preorderEnabled || false} onChange={handleInputChange} /> Pre-order Enabled
                                    </label>
                                </div>

                                <div style={{marginBottom: "15px"}}>
                                    <label>Pre-order Deposit (in cents):</label>
                                    <input type="number" name="preorderDepositAmount" value={formData.preorderDepositAmount || 0} onChange={handleInputChange} style={{width: "100%", padding: "8px", marginTop: "5px"}} />
                                </div>

                                {error && <div style={{color: "red", marginBottom: "10px"}}>{error}</div>}
                                {success && <div style={{color: "green", marginBottom: "10px"}}>{success}</div>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: loading ? "not-allowed" : "pointer",
                                        opacity: loading ? 0.6 : 1,
                                    }}
                                >
                                    {loading ? "Updating..." : "Update Product"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <p>Select a product to edit</p>
                    )}
                </div>
            </div>
        </div>
    );
}
