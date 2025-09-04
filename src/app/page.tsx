import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Gift, Sparkles } from "lucide-react";
import RealTimeStats from "@/components/real-time-stats";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen px-4 py-20">
        <div className="container max-w-4xl text-center animate-fade-up">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">희망의 씨앗 캠페인</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 bg-gradient-to-r from-primary via-primary-blue to-mint bg-clip-text text-transparent leading-tight">
            당신의 선택이<br />
            누군가에게는<br />
            <span className="text-coral">세상의 전부</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            미디어 큐레이션으로 전하는 따뜻한 마음.<br />
            나만의 미디어팩을 만들어 희망의 씨앗을 나눠보세요.
          </p>

          {/* CTA Button */}
          <div className="mb-16">
            <Link href="/builder">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto rounded-2xl animate-scale-hover bg-primary-blue hover:bg-primary-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Gift className="w-5 h-5 mr-2" />
                나만의 미디어팩 만들기
              </Button>
            </Link>
          </div>

          {/* Real-time Stats */}
          <RealTimeStats />
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 bg-warm-ivory/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              간단한 4단계로 완성
            </h2>
            <p className="text-lg text-muted-foreground">
              몇 분만 투자하면 특별한 미디어팩을 만들 수 있어요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "콘텐츠 선택",
                description: "영화, 드라마, 예능, K-POP 등 다양한 콘텐츠에서 선택",
                icon: <Heart className="w-8 h-8" />,
                color: "text-primary-blue"
              },
              {
                step: "02",
                title: "용량 체크",
                description: "16GB/32GB SD카드에 맞춰 용량을 확인하며 선택",
                icon: <Users className="w-8 h-8" />,
                color: "text-mint"
              },
              {
                step: "03",
                title: "메시지 작성",
                description: "받는 분께 전하고 싶은 따뜻한 메시지를 작성",
                icon: <Gift className="w-8 h-8" />,
                color: "text-coral"
              },
              {
                step: "04",
                title: "공유하기",
                description: "SNS와 링크로 완성된 미디어팩을 공유",
                icon: <Sparkles className="w-8 h-8" />,
                color: "text-primary"
              }
            ].map((item, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-scale-hover">
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs px-2 py-1 mb-4">
                    {item.step}
                  </Badge>
                  <div className={`${item.color} flex justify-center mb-3`}>
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-muted-foreground border-t">
        <div className="container max-w-4xl mx-auto">
          <p className="mb-2">
            본 캠페인은 상징적 체험을 제공하는 온라인 참여형 프로젝트입니다.
          </p>
          <p>
            실제 전송 행위와는 무관하며, 개인정보는 수집하지 않습니다.
          </p>
        </div>
      </footer>
    </main>
  );
}
