import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="container max-w-lg mx-auto text-center">
        <Card className="p-8">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          
          <h1 className="text-2xl font-heading font-bold mb-4">
            미디어팩을 찾을 수 없습니다
          </h1>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            요청하신 미디어팩이 존재하지 않거나 삭제되었을 수 있습니다.
            링크를 다시 확인해 주세요.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-primary-blue hover:bg-primary-blue/90">
                <Home className="w-4 h-4 mr-2" />
                홈으로 가기
              </Button>
            </Link>
            
            <Link href="/builder">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                새로 만들기
              </Button>
            </Link>
          </div>
        </Card>
        
        <p className="text-sm text-muted-foreground mt-6">
          문제가 지속되면 고객센터로 문의해 주세요.
        </p>
      </div>
    </main>
  );
}