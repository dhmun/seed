import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Heart, Sparkles, Gift } from "lucide-react";

export default function BuilderIntro() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="container max-w-3xl text-center animate-fade-up">
        {/* Back to Home */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← 홈으로 돌아가기
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">1단계 / 4단계</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 bg-gradient-to-r from-primary via-primary-blue to-coral bg-clip-text text-transparent">
          미디어팩 만들기
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          간단한 4단계를 통해 특별한 미디어팩을 만들어보세요.<br />
          당신만의 선택이 누군가에게 특별한 선물이 될 거예요.
        </p>

        {/* Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            {
              step: "1단계",
              title: "콘텐츠 선택",
              description: "다양한 카테고리에서 마음에 드는 콘텐츠를 선택해주세요",
              icon: <Heart className="w-6 h-6" />,
              color: "border-primary-blue/20 bg-primary-blue/5"
            },
            {
              step: "2단계",
              title: "용량 확인",
              description: "SD카드 용량에 맞춰 콘텐츠를 조정해주세요",
              icon: <Gift className="w-6 h-6" />,
              color: "border-mint/20 bg-mint/5"
            },
            {
              step: "3단계",
              title: "메시지 작성",
              description: "받는 분께 전하고 싶은 따뜻한 메시지를 작성해주세요",
              icon: <Sparkles className="w-6 h-6" />,
              color: "border-coral/20 bg-coral/5"
            },
            {
              step: "4단계",
              title: "공유하기",
              description: "완성된 미디어팩을 SNS나 링크로 공유해주세요",
              icon: <ArrowRight className="w-6 h-6" />,
              color: "border-primary/20 bg-primary/5"
            }
          ].map((item, index) => (
            <Card key={index} className={`p-6 text-left ${item.color} border-2 hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-start gap-4">
                <div className="text-primary-blue mt-1">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground mb-1">{item.step}</div>
                  <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Estimated Time */}
        <div className="mb-8">
          <p className="text-muted-foreground">
            ⏱️ 예상 소요 시간: <strong>약 3-5분</strong>
          </p>
        </div>

        {/* Start Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/builder/select">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto rounded-2xl animate-scale-hover bg-primary-blue hover:bg-primary-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <Link href="/">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 h-auto rounded-2xl animate-scale-hover"
            >
              나중에 하기
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            문제가 있거나 도움이 필요하신가요? 언제든 
            <a href="#" className="text-primary-blue hover:underline ml-1">도움말</a>을 확인해보세요.
          </p>
        </div>
      </div>
    </main>
  );
}