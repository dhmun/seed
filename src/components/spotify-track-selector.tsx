'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Check } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { syncSpotifyTracks } from '@/server/actions/spotify_sync';
import { supabase } from '@/lib/supabase';

import { Database } from '@/lib/supabase'; // Import Database type

type SpotifyTrackRow = Database['public']['Tables']['spotify_tracks']['Row'];

interface SpotifyTrackSelectorProps {
  onSelectTracks: (selectedIds: string[]) => void;
  initialSelectedIds: string[];
  currentContentsSizeMB?: number;
  capacityMB?: number;
  targetCapacity?: string;
}

export default function SpotifyTrackSelector({
  onSelectTracks,
  initialSelectedIds,
  currentContentsSizeMB = 0,
  capacityMB = 16 * 1024, // 16GB default
  targetCapacity = '16GB',
}: SpotifyTrackSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrackRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>(initialSelectedIds);

  useEffect(() => {
    setSelectedTrackIds(initialSelectedIds);
  }, [initialSelectedIds]);

  // 컴포넌트 마운트 시 인기 트랙 로드
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      // 검색어가 없을 때 인기 트랙들을 보여주기
      try {
        const { data, error } = await supabase
          .from('spotify_tracks')
          .select('*')
          .order('popularity', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error fetching popular tracks:', error);
        setSearchResults([]);
      }
      return;
    }

    setLoading(true);
    try {
      // 1. 먼저 기존 데이터베이스에서 검색
      const { data: existingTracks, error: searchError } = await supabase
        .from('spotify_tracks')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,artist_names.cs.{${searchQuery}}`)
        .order('popularity', { ascending: false })
        .limit(20);

      if (searchError) throw searchError;

      if (existingTracks && existingTracks.length > 0) {
        // 기존 데이터에서 찾았으면 바로 표시
        setSearchResults(existingTracks);
        setLoading(false);
        return;
      }

      // 2. 기존 데이터에 없으면 Spotify에서 검색 및 동기화
      const syncResult = await syncSpotifyTracks(searchQuery, 20);
      if (!syncResult.success) {
        toast.error(syncResult.message);
        return;
      }
      toast.success(`${syncResult.data?.length || 0}개의 새로운 트랙을 찾았습니다!`);

      // 3. 새로 동기화된 트랙 가져오기
      const { data: newTracks, error: newTracksError } = await supabase
        .from('spotify_tracks')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,artist_names.cs.{${searchQuery}}`)
        .order('popularity', { ascending: false })
        .limit(20);
      
      if (newTracksError) throw newTracksError;
      setSearchResults(newTracks || []);

    } catch (error) {
      console.error('Spotify search failed:', error);
      toast.error('스포티파이 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // 검색어 입력 시 디바운싱
  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, handleSearch]);

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds(prev => {
      const isCurrentlySelected = prev.includes(trackId);
      
      if (!isCurrentlySelected) {
        // 선택하려는 경우 용량 체크
        const newTrackCount = prev.length + 1;
        const newSpotifySize = newTrackCount * 5; // 각 트랙 5MB
        const totalSize = currentContentsSizeMB + newSpotifySize;
        const usagePercentage = (totalSize / capacityMB) * 100;
        
        if (usagePercentage > 100) {
          toast.error(`용량을 초과했습니다. ${targetCapacity} 이하로 선택해주세요.`);
          return prev;
        }
      }
      
      const newSelection = isCurrentlySelected
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId];
      return newSelection;
    });
  };

  // 이전 선택된 ID들을 추적
  const prevSelectedIds = useRef<string[]>(selectedTrackIds);
  
  // selectedTrackIds가 변경될 때마다 부모에게 알리기 (무한 루프 방지)
  useEffect(() => {
    if (JSON.stringify(prevSelectedIds.current) !== JSON.stringify(selectedTrackIds)) {
      prevSelectedIds.current = selectedTrackIds;
      onSelectTracks(selectedTrackIds);
    }
  }, [selectedTrackIds, onSelectTracks]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          스포티파이 음악 검색
        </h3>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="음악 제목 또는 아티스트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? '검색 중...' : '검색'}
          </Button>
        </div>
      </Card>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {searchResults.map((track) => {
            const isSelected = selectedTrackIds.includes(track.id);
            return (
              <Card
                key={track.id}
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected
                    ? 'ring-2 ring-primary-blue bg-primary-blue/5 border-primary-blue'
                    : 'hover:shadow-md'
                }`}
                onClick={() => toggleTrackSelection(track.id)}
              >
                <div className="relative mb-3">
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    {track.album_image_url ? (
                      <Image
                        src={track.album_image_url}
                        alt={track.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary-blue rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm line-clamp-2">{track.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {track.artist_names.join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {track.album_name}
                  </p>
                  {track.preview_url && (
                    <audio controls src={track.preview_url} className="w-full mt-2" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {loading && searchResults.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">스포티파이에서 음악을 검색하고 있습니다...</p>
        </div>
      )}

      {!loading && searchQuery.trim() && searchResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
