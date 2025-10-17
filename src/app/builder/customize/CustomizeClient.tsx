'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  MessageSquare,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { getContentsByIds } from '@/server/actions/contents';
import { getSpotifyTracksByIds, type SpotifyTrackRow } from '@/server/actions/spotify';
import { createPack } from '@/server/actions/packs';
import { createPackSchema } from '@/lib/validations';
import type { Content } from '@/lib/supabase';

export default function CustomizeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedContents, setSelectedContents] = useState<Content[]>([]);
  const [selectedSpotifyTracks, setSelectedSpotifyTracks] = useState<SpotifyTrackRow[]>([]);
  const [selectedSpotifyTrackIds, setSelectedSpotifyTrackIds] = useState<string[]>([]);
  const [packName, setPackName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadSelectedContents() {
      try {
        const idsParam = searchParams.get('ids');
        const spotifyIdsParam = searchParams.get('spotifyIds');
        const capacityParam = searchParams.get('capacity');

        let contentIds: string[] = [];
        let spotifyIds: string[] = [];

        if (idsParam) {
          contentIds = idsParam.split(',').filter(id => id.trim());
          localStorage.setItem('selectedContentIds', JSON.stringify(contentIds));
        } else {
          const savedIds = localStorage.getItem('selectedContentIds');
          if (savedIds) {
            contentIds = JSON.parse(savedIds);
          }
        }

        if (spotifyIdsParam) {
          spotifyIds = spotifyIdsParam.split(',').filter(id => id.trim());
          localStorage.setItem('selectedSpotifyTrackIds', JSON.stringify(spotifyIds));
        } else {
          const savedSpotifyIds = localStorage.getItem('selectedSpotifyTrackIds');
          if (savedSpotifyIds) {
            spotifyIds = JSON.parse(savedSpotifyIds);
          }
        }

        if (capacityParam) {
          localStorage.setItem('targetCapacity', capacityParam);
        }

        if (contentIds.length === 0 && spotifyIds.length === 0) {
          toast.error('선택된 콘텐츠가 없습니다. 다시 선택해주세요.');
          router.push('/builder/select');
          return;
        }

        if (contentIds.length > 0) {
          const contents = await getContentsByIds(contentIds);

          if (contents.length !== contentIds.length) {
            toast.warning(`${contentIds.length - contents.length}개 콘텐츠를 불러오지 못했습니다.`);
          }

          setSelectedContents(contents);
        }

        if (spotifyIds.length > 0) {
          setSelectedSpotifyTrackIds(spotifyIds);
        }

      } catch (error) {
        console.error('Error loading contents:', error);
        toast.error('콘텐츠를 불러오는데 실패했습니다.');
        setTimeout(() => router.push('/builder/select'), 3000);
      } finally {
        setLoading(false);
      }
    }

    loadSelectedContents();
  }, [searchParams, router]);

  useEffect(() => {
    if (selectedSpotifyTrackIds.length > 0) {
      getSpotifyTracksByIds(selectedSpotifyTrackIds)
        .then((tracks) => {
          setSelectedSpotifyTracks(tracks);
        })
        .catch(error => {
          toast.error('선택한 음악 정보를 불러오는 데 실패했습니다.');
          console.error('Error loading spotify tracks:', error);
        });
    }
  }, [selectedSpotifyTrackIds]);

  const packNameError = packName.length > 20 ? '20자 이하로 입력해주세요.' : '';
  const messageError = message.length > 50 ? '50자 이하로 입력해주세요.' : '';
  const isValid = packName.length > 0 && message.length > 0 && !packNameError && !messageError;

  const handleNext = async () => {
    if (!isValid) {
      toast.error('모든 필드를 올바르게 입력해주세요.');
      return;
    }

    const selectedContentIds = selectedContents.map(c => c.id);

    if (selectedContentIds.length === 0 && selectedSpotifyTrackIds.length === 0) {
      toast.error('선택된 콘텐츠 정보가 없습니다.');
      return;
    }

    try {
      const totalContentIds = [...selectedContentIds, ...selectedSpotifyTrackIds];

      createPackSchema.parse({
        name: packName,
        message: message,
        selectedContentIds: totalContentIds
      });

      setSubmitting(true);

      try {
        const { slug, serial } = await createPack({
          name: packName,
          message: message,
          selectedContentIds: selectedContentIds,
          selectedSpotifyIds: selectedSpotifyTrackIds
        });

        const packResult = {
          slug,
          serial,
          name: packName,
          message: message,
          selectedContentIds: selectedContentIds,
          selectedSpotifyIds: selectedSpotifyTrackIds
        };

        localStorage.setItem('packResult', JSON.stringify(packResult));
        localStorage.removeItem('selectedContentIds');
        localStorage.removeItem('selectedSpotifyTrackIds');
        localStorage.removeItem('targetCapacity');

        router.push('/builder/result');

      } catch (error) {
        console.error('Pack creation error:', error);
        toast.error('미디어팩 생성에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setSubmitting(false);
      }
    } catch (error) {
      toast.error('입력 정보가 올바르지 않습니다.');
      console.error('Validation error:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/builder/select" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← 이전으로
          </Link>
          
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-blue/10 text-primary-blue border border-primary-blue/20 mb-4">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">3단계 / 4단계</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              미디어팩 꾸미기
            </h1>
            <p className="text-muted-foreground">
              미디어팩에 이름을 짓고, 받는 분께 전하고 싶은 메시지를 적어주세요.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  미디어팩 이름
                </label>
                <Input
                  placeholder="예: 힘내세요 응원팩, 감사 인사 모음"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  className={`text-lg ${packNameError ? 'border-destructive' : ''}`}
                  maxLength={20}
                  aria-label="미디어팩 이름"
                />
                <div className="flex justify-between text-xs mt-2">
                  {packNameError ? (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {packNameError}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      받는 분이 쉽게 알아볼 수 있는 이름을 지어주세요
                    </span>
                  )}
                  <span className={`text-muted-foreground ${packName.length > 15 ? 'text-orange-600' : ''}`}>
                    {packName.length}/20
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  메시지 (받는 분께 전하고 싶은 이야기)
                </label>
                <Textarea
                  placeholder="짧고 솔직한 마음을 전하세요. 예: 요즘 많이 힘들지? 항상 응원하고 있어!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${messageError ? 'border-destructive' : ''}`}
                  rows={6}
                  maxLength={50}
                  aria-label="메시지"
                />
                <div className="flex justify-between text-xs mt-2">
                  {messageError ? (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {messageError}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      너무 길지 않게, 진심을 담아 전해보세요
                    </span>
                  )}
                  <span className={`text-muted-foreground ${message.length > 40 ? 'text-orange-600' : ''}`}>
                    {message.length}/50
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!isValid || submitting}
                className="bg-primary-blue hover:bg-primary-blue/90"
              >
                {submitting ? '생성 중...' : '미디어팩 만들기'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <Card className="p-6">
              <h3 className="font-heading font-bold text-lg mb-4">
                선택된 콘텐츠 ({selectedContents.length + selectedSpotifyTracks.length}개)
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedContents.map((content) => (
                  <div key={content.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-12 h-16 bg-muted rounded overflow-hidden shrink-0">
                      <img
                        src={content.thumbnail_url}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{content.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{content.summary}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {content.kind === 'movie' ? '영화' : 
                           content.kind === 'drama' ? '드라마' :
                           content.kind === 'show' ? '예능' :
                           content.kind === 'kpop' ? 'K-POP' : '다큐'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {content.size_mb >= 1024 ? 
                            `${(content.size_mb / 1024).toFixed(1)}GB` : 
                            `${content.size_mb}MB`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {selectedSpotifyTracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden shrink-0">
                      {track.album_image_url ? (
                        <img
                          src={track.album_image_url}
                          alt={track.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">🎵</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{track.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {track.artist_names.join(', ')} • {track.album_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          음악
                        </Badge>
                        <span className="text-xs text-muted-foreground">5MB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <div>영화/TV: <strong>{selectedContents.length}</strong>개</div>
                  <div>음악: <strong>{selectedSpotifyTrackIds.length}</strong>개 ({selectedSpotifyTrackIds.length * 5}MB)</div>
                  <div className="mt-1">총 용량: <strong>
                    {(() => {
                      const contentSize = selectedContents.reduce((total, content) => total + content.size_mb, 0);
                      const spotifySize = selectedSpotifyTrackIds.length * 5;
                      const totalSize = contentSize + spotifySize;
                      return totalSize >= 1024 ?
                        `${(totalSize / 1024).toFixed(1)}GB` :
                        `${totalSize}MB`;
                    })()}
                  </strong></div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 lg:static lg:bg-transparent lg:border-t-0 lg:p-0 lg:mt-8">
          <div className="container max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <Link href="/builder/select">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  이전
                </Button>
              </Link>
              
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!isValid || submitting}
                className="bg-primary-blue hover:bg-primary-blue/90"
              >
                {submitting ? '생성 중...' : '미디어팩 만들기'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

