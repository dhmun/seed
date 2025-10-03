import TopNav from "@/components/nav/top-nav";
import HeroSlider, { HeroItem } from "@/components/hero/hero-slider";
import { supabase } from "@/lib/supabase";
import { Content } from "@/lib/supabase";

// Revalidate the page every hour
export const revalidate = 3600;

// Static campaign texts to be overlaid on the dynamic backgrounds
const campaignTexts = [
  {
    title: "당신의 선택이 누군가에게는 세상의 전부",
    subtitle: "한류 콘텐츠로 만드는 특별한 캠페인",
    description: "미디어 큐레이션으로 전하는 따뜻한 마음. 나만의 미디어팩을 만들어 희망의 씨앗을 나눠보세요.",
  },
  {
    title: "따뜻한 이야기로 채워진 특별한 컬렉션",
    subtitle: "콘텐츠로 만드는 희망의 미디어 팩",
    description: "국내외 감동적인 스토리와 메시지를 담은 큐레이션.",
  },
  {
    title: "세상을 바꾸는 작은 변화들",
    subtitle: "누군가에게는 세상의 전부",
    description: "희망과 변화의 이야기들을 모은 특별한 큐레이션.",
  }
];

export default async function Home() {
  // Fetch popular contents for the hero slider backgrounds
  const { data: contents, error } = await supabase
    .from('contents')
    .select('id, thumbnail_url, backdrop_url, release_date, vote_average')
    .not('backdrop_url', 'is', null)
    .order('vote_average', { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching curated contents:", error.message);
  }

  const orderedContents = contents || [];

  // Transform Supabase data, merging it with the static campaign text
  const heroItems: HeroItem[] = orderedContents.map((content: any, index: number) => ({
    // Use static text, cycling through the campaignTexts array
    ...campaignTexts[index % campaignTexts.length],
    // Use dynamic data for ID and images from the database
    id: content.id,
    thumbnailUrl: content.thumbnail_url,
    bgUrl: content.backdrop_url || content.thumbnail_url,
    year: content.release_date ? new Date(content.release_date).getFullYear().toString() : undefined,
    rating: content.vote_average ? content.vote_average.toFixed(1) : undefined,
  }));

  return (
    <main className="h-screen bg-[#141414] text-white overflow-hidden">
      {/* Fixed Navigation */}
      <TopNav />

      {/* Hero Slider with curated campaign text and backgrounds */}
      <HeroSlider items={heroItems} />
    </main>
  );
}
