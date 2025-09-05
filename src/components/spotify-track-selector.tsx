'use client';

import { useState, useEffect, useCallback } from 'react';
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
}

export default function SpotifyTrackSelector({
  onSelectTracks,
  initialSelectedIds,
}: SpotifyTrackSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrackRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>(initialSelectedIds);

  useEffect(() => {
    setSelectedTrackIds(initialSelectedIds);
  }, [initialSelectedIds]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // 1. Spotify에서 검색 및 Supabase에 동기화
      const syncResult = await syncSpotifyTracks(searchQuery, 20);
      if (!syncResult.success) {
        toast.error(syncResult.message);
        return;
      }
      toast.success(syncResult.message);

      // 2. Supabase에서 동기화된 트랙 가져오기
      const { data, error } = await supabase
        .from('spotify_tracks')
        .select('*')
        .filter('id', 'in', `(${syncResult.data?.map((t: SpotifyTrackRow) => t.id).join(',')})`);
      
      if (error) {
        console.error('Error fetching synced tracks from Supabase:', error);
        toast.error('동기화된 트랙을 불러오는데 실패했습니다.');
        setSearchResults([]);
        return;
      }
      setSearchResults(data || []);

    } catch (error) {
      console.error('Spotify search and sync failed:', error);
      toast.error('스포티파이 검색 및 동기화 중 오류가 발생했습니다.');
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
      const newSelection = prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId];
      onSelectTracks(newSelection);
      return newSelection;
    });
  };

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
