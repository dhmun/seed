'use server';

import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase';
import type { Pack, Content } from '@/lib/supabase';
import { nanoid } from 'nanoid';

// Mock 데이터 저장소 (메모리)
let mockPackCounter = 1;
const mockPacks: Map<string, Pack & { contents: Content[] }> = new Map();

export interface CreatePackData {
  name: string;
  message: string;
  selectedContentIds: string[];
}

export interface PackWithContents extends Pack {
  contents: Content[];
}

export async function createPack(data: CreatePackData): Promise<{ slug: string; serial: number }> {
  try {
    // 입력 검증
    if (!data.name || data.name.length > 20) {
      throw new Error('미디어팩 이름은 1-20자 사이여야 합니다.');
    }

    if (!data.message || data.message.length > 50) {
      throw new Error('메시지는 1-50자 사이여야 합니다.');
    }

    if (!data.selectedContentIds || data.selectedContentIds.length < 3) {
      throw new Error('최소 3개의 콘텐츠를 선택해야 합니다.');
    }

    if (!isSupabaseConnected) {
      // Mock 데이터 사용
      const serial = mockPackCounter++;
      const shareSlug = nanoid(10);
      
      // Mock 콘텐츠 정의 (로컬)
      const mockContents = [
        { id: '1', kind: 'movie', title: '기생충', summary: '봉준호 감독의 아카데미 작품상 수상작', thumbnail_url: 'https://via.placeholder.com/300x400/3B82F6/ffffff?text=기생충', size_mb: 4500, is_active: true, created_at: new Date().toISOString() },
        { id: '2', kind: 'movie', title: '미나리', summary: '미국으로 이민 온 한국 가족의 따뜻한 이야기', thumbnail_url: 'https://via.placeholder.com/300x400/14B8A6/ffffff?text=미나리', size_mb: 3800, is_active: true, created_at: new Date().toISOString() },
        { id: '3', kind: 'drama', title: '오징어 게임', summary: '전 세계를 열광시킨 넷플릭스 오리지널', thumbnail_url: 'https://via.placeholder.com/300x400/F87171/ffffff?text=오징어게임', size_mb: 12000, is_active: true, created_at: new Date().toISOString() },
        { id: '4', kind: 'drama', title: '사랑의 불시착', summary: '북남 배경의 감동적인 로맨스', thumbnail_url: 'https://via.placeholder.com/300x400/9333EA/ffffff?text=사랑의불시착', size_mb: 15600, is_active: true, created_at: new Date().toISOString() }
      ] as Content[];
      const selectedContents = mockContents.filter(c => data.selectedContentIds.includes(c.id));
      
      const mockPack: Pack & { contents: Content[] } = {
        id: nanoid(),
        name: data.name,
        message: data.message,
        serial: serial,
        share_slug: shareSlug,
        og_image_url: null,
        created_at: new Date().toISOString(),
        contents: selectedContents
      };
      
      mockPacks.set(shareSlug, mockPack);
      
      return { slug: shareSlug, serial };
    }

    // 트랜잭션 시작 - 미디어팩 시리얼 번호 증가
    const { data: serialData, error: serialError } = await supabaseAdmin
      .rpc('increment_counter', { counter_key: 'pack_serial' });

    if (serialError) {
      console.error('Error incrementing counter:', serialError);
      throw new Error('시리얼 번호 생성에 실패했습니다.');
    }

    const serial = serialData as number;
    const shareSlug = nanoid(10); // 10자리 고유 ID

    // Pack 생성
    const { data: pack, error: packError } = await supabaseAdmin
      .from('packs')
      .insert({
        name: data.name,
        message: data.message,
        serial: serial,
        share_slug: shareSlug,
      })
      .select('id')
      .single();

    if (packError) {
      console.error('Error creating pack:', packError);
      throw new Error('미디어팩 생성에 실패했습니다.');
    }

    // Pack Items 생성
    const packItems = data.selectedContentIds.map(contentId => ({
      pack_id: pack.id,
      content_id: contentId,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('pack_items')
      .insert(packItems);

    if (itemsError) {
      console.error('Error creating pack items:', itemsError);
      // 롤백을 위해 생성된 pack 삭제
      await supabaseAdmin.from('packs').delete().eq('id', pack.id);
      throw new Error('미디어팩 아이템 생성에 실패했습니다.');
    }

    return { slug: shareSlug, serial };
  } catch (error) {
    console.error('createPack error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('미디어팩 생성 중 오류가 발생했습니다.');
  }
}

export async function getPackBySlug(slug: string): Promise<PackWithContents | null> {
  try {
    if (!isSupabaseConnected) {
      // Mock 데이터 사용
      const mockPack = mockPacks.get(slug);
      return mockPack || null;
    }

    // Pack 정보 가져오기
    const { data: pack, error: packError } = await supabaseAdmin
      .from('packs')
      .select('*')
      .eq('share_slug', slug)
      .single();

    if (packError || !pack) {
      console.error('Error fetching pack:', packError);
      return null;
    }

    // Pack에 포함된 콘텐츠 가져오기
    const { data: packItems, error: itemsError } = await supabaseAdmin
      .from('pack_items')
      .select(`
        content_id,
        contents (*)
      `)
      .eq('pack_id', pack.id);

    if (itemsError) {
      console.error('Error fetching pack items:', itemsError);
      return { ...pack, contents: [] };
    }

    const contents = packItems?.map((item: any) => item.contents).filter(Boolean) || [];

    return { ...pack, contents };
  } catch (error) {
    console.error('getPackBySlug error:', error);
    return null;
  }
}

export async function getPackStats() {
  try {
    const { data, error } = await supabaseAdmin
      .from('counters')
      .select('value')
      .eq('key', 'pack_serial')
      .single();

    if (error) {
      console.error('Error fetching pack stats:', error);
      return { totalPacks: 0 };
    }

    return { totalPacks: data?.value || 0 };
  } catch (error) {
    console.error('getPackStats error:', error);
    return { totalPacks: 0 };
  }
}

export async function updatePackOgImage(slug: string, ogImageUrl: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('packs')
      .update({ og_image_url: ogImageUrl })
      .eq('share_slug', slug);

    if (error) {
      console.error('Error updating OG image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('updatePackOgImage error:', error);
    return false;
  }
}