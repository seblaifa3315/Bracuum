import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"

export function LandingPage() {
  return (
    <main className="flex flex-col gap-24">

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container mx-auto px-6 py-24 text-center">
          <Badge variant="secondary" className="mb-4">
            New Arrival
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            The Ultimate Home Vacuum
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Powerful suction, compact design, and easy to clean – everything you need for a spotless home.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg">
              Buy Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Features That Matter
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Powerful Suction",
              description: "Removes dirt, dust, and pet hair effortlessly from all surfaces.",
            },
            {
              title: "Compact Design",
              description: "Fits easily under furniture and stores neatly in any closet.",
            },
            {
              title: "Easy to Clean",
              description: "Removable dustbin and washable filters for hassle-free maintenance.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition">
              <CardContent>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/10 py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">What Our Customers Say</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Sarah L.",
                text: "This vacuum changed my cleaning game! Lightweight yet powerful.",
              },
              {
                name: "Michael B.",
                text: "No more pet hair! My carpets have never looked better.",
              },
              {
                name: "Jessica R.",
                text: "Compact, easy to use, and so quiet. Highly recommend.",
              },
            ].map((review) => (
              <Card key={review.name} className="hover:shadow-lg transition">
                <CardContent>
                  <CardTitle>{review.name}</CardTitle>
                  <CardDescription>"{review.text}"</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Upgrade Your Cleaning?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Get your vacuum today and experience a cleaner, happier home.
        </p>
        <Button size="lg">
          Buy Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>

    </main>
  )
}
