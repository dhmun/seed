'use server';

import { supabaseAdmin } from '@/lib/supabase';
import type { Pack, Content } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export interface CreatePackData {
  name: string;
  message: string;
  selectedContentIds: string[];
}

export interface PackWithContents extends Pack {
  contents: Content[];
}

export async function createPack(data: CreatePackData): Promise<{ slug: string; serial: number; }> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not initialized.');
  }

  // 1. 입력 데이터 검증
  if (!data.name || data.name.length > 20) {
    throw new Error('미디어팩 이름은 1-20자 사이여야 합니다.');
  }
  if (!data.message || data.message.length > 50) {
    throw new Error('메시지는 1-50자 사이여야 합니다.');
  }
  if (!data.selectedContentIds || data.selectedContentIds.length < 3) {
    throw new Error('최소 3개의 콘텐츠를 선택해야 합니다.');
  }

  try {
    // 2. 새로운 팩 시리얼 번호 가져오기
    const { data: serialData, error: rpcError } = await supabaseAdmin.rpc('increment_counter', { counter_key: 'pack_serial' });
    if (rpcError) throw new Error(`Failed to increment pack serial: ${rpcError.message}`);
    const serial = serialData;

    // 3. `packs` 테이블에 새로운 팩 생성
    const shareSlug = nanoid(10);
    const { data: newPack, error: packError } = await supabaseAdmin
      .from('packs')
      .insert({
        name: data.name,
        message: data.message,
        serial: serial,
        share_slug: shareSlug,
      })
      .select()
      .single();

    if (packError) throw new Error(`Failed to create pack: ${packError.message}`);

    // 4. `pack_items` 테이블에 선택된 콘텐츠 목록 추가
    const packItems = data.selectedContentIds.map(contentId => ({
      pack_id: newPack.id,
      content_id: contentId,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('pack_items')
      .insert(packItems);

    if (itemsError) {
      // 롤백을 위해 방금 만든 팩을 삭제할 수도 있지만, 우선 에러를 던집니다.
      throw new Error(`Failed to add items to pack: ${itemsError.message}`);
    }

    return { slug: shareSlug, serial };

  } catch (error) {
    console.error('createPack error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('미디어팩 생성 중 알 수 없는 오류가 발생했습니다.');
  }
}

export async function getPackBySlug(slug: string): Promise<PackWithContents | null> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not initialized.');
  }

  try {
    // 1. 슬러그로 팩 정보 가져오기
    const { data: pack, error: packError } = await supabaseAdmin
      .from('packs')
      .select('*')
      .eq('share_slug', slug)
      .single();

    if (packError || !pack) {
      if (packError && packError.code !== 'PGRST116') { // PGRST116: 0개의 행이 반환됨 (찾지 못한 경우)
        console.error('Error fetching pack by slug:', packError.message);
      }
      return null;
    }

    // 2. 팩 ID로 관련 콘텐츠 정보 가져오기 (중첩 쿼리)
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('pack_items')
      .select(`
        contents (*)
      `)
      .eq('pack_id', pack.id);

    if (itemsError) {
      console.error('Error fetching pack contents:', itemsError.message);
      // 팩은 찾았지만 콘텐츠를 못찾아도 팩 정보는 반환할 수 있도록 처리
      return { ...pack, contents: [] };
    }

    // Supabase 중첩 쿼리 결과에서 contents 객체만 추출
    const contents = items.map(item => (item as any).contents).filter(Boolean) as Content[];

    return { ...pack, contents };

  } catch (error) {
    console.error('getPackBySlug error:', error);
    return null;
  }
}

export async function getPackStats() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not initialized.');
  }

  try {
    // 실제 생성된 팩의 개수를 카운트
    const { count, error } = await supabaseAdmin
      .from('packs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching pack stats:', error.message);
      return { totalPacks: 0 };
    }

    return { totalPacks: count || 0 };
  } catch (error) {
    console.error('getPackStats error:', error);
    return { totalPacks: 0 };
  }
}

export async function updatePackOgImage(slug: string, ogImageUrl: string): Promise<boolean> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not initialized.');
  }

  try {
    const { error } = await supabaseAdmin
      .from('packs')
      .update({ og_image_url: ogImageUrl })
      .eq('share_slug', slug);

    if (error) {
      console.error('Error updating OG image:', error.message);
      return false;
    }
    return true;

  } catch (error) {
    console.error('updatePackOgImage error:', error);
    return false;
  }
}
