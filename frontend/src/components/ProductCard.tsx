import { ShoppingCart, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart, type Product } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleScan = () => {
    toast.info('Scan functionality coming soon!', {
      description: 'This will integrate with IoT scanning devices',
    });
  };

  return (
    <Card className="group overflow-hidden border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <Button
          size="sm"
          variant="secondary"
          className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleScan}
        >
          <Scan className="mr-1 h-4 w-4" />
          Scan
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="mb-1 text-xs text-muted-foreground">{product.category}</div>
        <h3 className="mb-2 font-semibold text-foreground">{product.name}</h3>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${product.price}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={() => addToCart(product)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
