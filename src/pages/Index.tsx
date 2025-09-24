import KolamGenerator from '@/components/KolamGenerator';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    const logoSrc = `$kolam-spark-studio\public\image.png`;
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background px-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-semibold mb-3">Not available on mobile</h1>
          <p className="text-muted-foreground">
            This experience isn't available on mobile right now. Please view it on a desktop.
          </p>
        </div>
      </div>
    );
  }

  return <KolamGenerator />;
};

export default Index;
