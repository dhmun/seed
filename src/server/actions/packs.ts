'use server';

import { supabaseAdmin } from '@/lib/supabase';
import type { Pack, Content, SpotifyTrack } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export interface CreatePackData {
  name: string;
  message: string;
  selectedContentIds: string[];
  selectedSpotifyIds?: string[];
}

export interface PackWithContents extends Pack {
  contents: Content[];
  spotifyTracks: SpotifyTrack[];
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

  const totalContentCount = (data.selectedContentIds?.length || 0) + (data.selectedSpotifyIds?.length || 0);
  if (totalContentCount < 3) {
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

    // 4. `pack_items` 테이블에 선택된 콘텐츠 및 Spotify 트랙 추가
    const packItems = [];

    // TMDb 콘텐츠 추가
    if (data.selectedContentIds && data.selectedContentIds.length > 0) {
      packItems.push(...data.selectedContentIds.map(contentId => ({
        pack_id: newPack.id,
        content_id: contentId,
        spotify_track_id: null,
      })));
    }

    // Spotify 트랙 추가
    if (data.selectedSpotifyIds && data.selectedSpotifyIds.length > 0) {
      packItems.push(...data.selectedSpotifyIds.map(spotifyId => ({
        pack_id: newPack.id,
        content_id: null,
        spotify_track_id: spotifyId,
      })));
    }

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

    // 2. 팩 ID로 관련 pack_items 가져오기
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('pack_items')
      .select('*')
      .eq('pack_id', pack.id);

    if (itemsError) {
      console.error('Error fetching pack items:', itemsError.message);
      return { ...pack, contents: [], spotifyTracks: [] };
    }

    // 3. content_id와 spotify_track_id 분리
    const contentIds = items.filter(item => item.content_id).map(item => item.content_id!);
    const spotifyTrackIds = items.filter(item => item.spotify_track_id).map(item => item.spotify_track_id!);

    // 4. TMDb 콘텐츠 조회
    let contents: Content[] = [];
    if (contentIds.length > 0) {
      const { data: contentsData, error: contentsError } = await supabaseAdmin
        .from('contents')
        .select('*')
        .in('id', contentIds);

      if (contentsError) {
        console.error('Error fetching contents:', contentsError.message);
      } else {
        contents = contentsData || [];
      }
    }

    // 5. Spotify 트랙 조회
    let spotifyTracks: SpotifyTrack[] = [];
    if (spotifyTrackIds.length > 0) {
      const { data: spotifyData, error: spotifyError } = await supabaseAdmin
        .from('spotify_tracks')
        .select('*')
        .in('id', spotifyTrackIds);

      if (spotifyError) {
        console.error('Error fetching spotify tracks:', spotifyError.message);
      } else {
        spotifyTracks = spotifyData || [];
      }
    }

    return { ...pack, contents, spotifyTracks };

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
