import { ProductCard } from '@/components/ProductCard';
import { mockProducts } from '@/lib/mockData';
import { Navbar } from '@/components/Navbar';

const Products = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Explore Products
          </h1>
          <p className="text-muted-foreground">
            Discover cutting-edge Web3 hardware and software
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Products;
