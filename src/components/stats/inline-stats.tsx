"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import RealTimeStats from "@/components/real-time-stats";

export default function InlineStats() {
  return (
    <section className="relative z-10 -mt-32 mb-16">
      <div className="container max-w-[1400px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-black/40 backdrop-blur-md border-zinc-800/50 p-8 rounded-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">실시간 참여 현황</h3>
              <p className="text-zinc-300">전 세계의 따뜻한 마음이 모여 희망의 씨앗을 키우고 있습니다</p>
            </div>
            
            {/* Real-time stats component with Netflix styling */}
            <div className="netflix-stats-wrapper">
              <RealTimeStats />
            </div>
          </Card>
        </motion.div>
      </div>

      <style jsx global>{`
        .netflix-stats-wrapper .real-time-stats {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        
        .netflix-stats-wrapper .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }
        
        .netflix-stats-wrapper .stat-item {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .netflix-stats-wrapper .stat-number {
          font-size: 2.5rem !important;
          font-weight: 700 !important;
          color: #e50914 !important;
          display: block;
          margin-bottom: 0.5rem;
        }
        
        .netflix-stats-wrapper .stat-label {
          color: #d1d5db !important;
          font-size: 1rem;
          font-weight: 500;
        }
        
        .netflix-stats-wrapper .stat-description {
          color: #9ca3af !important;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .netflix-stats-wrapper .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          .netflix-stats-wrapper .stat-item {
            padding: 1rem;
          }
          
          .netflix-stats-wrapper .stat-number {
            font-size: 1.875rem !important;
          }
        }
      `}</style>
    </section>
  );
}