"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Heart, Sparkles, Gift } from "lucide-react";
import TopNav from "@/components/nav/top-nav";

export default function BuilderIntro() {
  return (
    <>
      {/* Fixed Navigation */}
      <TopNav />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 py-20">
        <div className="container max-w-3xl text-center animate-fade-up">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">1단계 / 4단계</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
          미디어팩 만들기
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
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
              color: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            },
            {
              step: "2단계",
              title: "용량 확인",
              description: "SD카드 용량에 맞춰 콘텐츠를 조정해주세요",
              icon: <Gift className="w-6 h-6" />,
              color: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            },
            {
              step: "3단계",
              title: "메시지 작성",
              description: "받는 분께 전하고 싶은 따뜻한 메시지를 작성해주세요",
              icon: <Sparkles className="w-6 h-6" />,
              color: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            },
            {
              step: "4단계",
              title: "공유하기",
              description: "완성된 미디어팩을 SNS나 링크로 공유해주세요",
              icon: <ArrowRight className="w-6 h-6" />,
              color: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            }
          ].map((item, index) => (
            <Card key={index} className={`p-6 text-left ${item.color} border hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md`}>
              <div className="flex items-start gap-4">
                <div className="text-blue-600 dark:text-blue-400 mt-1">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{item.step}</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Estimated Time */}
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-300">
            ⏱️ 예상 소요 시간: <strong>약 3-5분</strong>
          </p>
        </div>

        {/* Start Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/builder/select">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto rounded-lg bg-[#e50914] hover:bg-[#f6121d] text-white transition-all duration-300"
            >
              시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <Link href="/">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 h-auto rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white border-gray-300 dark:border-gray-600 transition-all duration-300"
            >
              나중에 하기
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            문제가 있거나 도움이 필요하신가요? 언제든 
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">주변 스텝</a>에게 물어보세요.
          </p>
        </div>
        </div>
      </main>
    </>
  );
}