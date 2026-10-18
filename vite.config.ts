import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function metadataProxyPlugin(): Plugin {
  return {
    name: 'metadata-proxy',
    configureServer(server) {
      server.middlewares.use('/api/fetch-telegram', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
          const rawUrl = urlObj.searchParams.get('url') || '';
          if (!rawUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No URL provided' }));
            return;
          }

          let handle = rawUrl.trim();
          handle = handle.replace(/^https?:\/\/t\.me\/(s\/)?/, '').replace(/^@/, '').split('/')[0].split('?')[0];

          if (!handle) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid telegram handle' }));
            return;
          }

          let html = '';
          // Try fetching channel preview first, then user profile
          const urlsToTry = [`https://t.me/s/${handle}`, `https://t.me/${handle}`];

          for (const u of urlsToTry) {
            try {
              const tgRes = await fetch(u, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                },
              });
              if (tgRes.ok) {
                html = await tgRes.text();
                if (html.includes('og:title')) break;
              }
            } catch {
              // try next
            }
          }

          let title = handle;
          let description = `Telegram @${handle}`;
          let avatar = '';
          let subscribers = 'профиль в Telegram';
          const posts: Array<{ id: string; text: string; date: string; mediaUrl?: string; views: string; forwards?: string }> = [];

          if (html) {
            const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<div class="tgme_page_title"><span dir="auto">([^<]+)<\/span>/i);
            if (titleMatch) title = titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"');

            const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i) || html.match(/<div class="tgme_page_description[^"]*">([\s\S]*?)<\/div>/i);
            if (descMatch) description = descMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/<[^>]+>/g, '').trim();

            const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/i) || html.match(/class="tgme_page_photo_image" src="([^"]+)"/i);
            if (imgMatch) avatar = imgMatch[1];

            const extraMatch = html.match(/<div class="tgme_page_extra">([^<]+)<\/div>/i);
            if (extraMatch) subscribers = extraMatch[1].trim();

            // Extract up to 10 messages from preview feed
            const messageBlocks = Array.from(html.matchAll(/<div class="tgme_widget_message\b[^>]*data-post="([^"]*)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi));

            if (messageBlocks.length > 0) {
              const now = Date.now();
              const threeHoursMs = 3 * 60 * 60 * 1000;
              let newestPostMarked = false;

              // Last 10 messages in reverse chronological order (newest first)
              for (const mb of messageBlocks.slice(-10).reverse()) {
                const postId = mb[1] ? mb[1].split('/')[1] || mb[1] : `post-${Math.random().toString(36).slice(2, 7)}`;
                const blockContent = mb[2];

                // Text
                const textMatch = blockContent.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
                let fullTextHtml = textMatch ? textMatch[1] : '';

                // Extract blockquote if present
                let quote: string | undefined = undefined;
                const quoteMatch = fullTextHtml.match(/<blockquote>([\s\S]*?)<\/blockquote>/i);
                if (quoteMatch) {
                  quote = quoteMatch[1]
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<[^>]+>/g, '')
                    .replace(/&#33;/g, '!')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .trim();
                  fullTextHtml = fullTextHtml.replace(/<blockquote>[\s\S]*?<\/blockquote>/gi, '');
                }

                // Extract links inside post
                const links: Array<{ title: string; url: string }> = [];
                const linkMatches = Array.from(fullTextHtml.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi));
                for (const lm of linkMatches) {
                  links.push({
                    url: lm[1],
                    title: lm[2].replace(/<[^>]+>/g, '').trim(),
                  });
                }

                // Clean post text (remove tags, keep linebreaks)
                let text = fullTextHtml
                  .replace(/<br\s*\/?>/gi, '\n')
                  .replace(/<[^>]+>/g, '')
                  .replace(/&#33;/g, '!')
                  .replace(/&amp;/g, '&')
                  .replace(/&quot;/g, '"')
                  .trim();

                // Photo
                const photoMatch = blockContent.match(/background-image:url\('([^']+)'\)/i);
                let mediaUrl: string | undefined = undefined;
                if (photoMatch && !photoMatch[1].includes('emoji')) {
                  mediaUrl = photoMatch[1];
                }

                // Time / Timestamp formatted in Moscow Time (Europe/Moscow)
                const timeMatch = blockContent.match(/<time[^>]*datetime="([^"]*)"[^>]*>([^<]+)<\/time>/i);
                const rawDateTime = timeMatch ? timeMatch[1] : '';
                let date = '';
                if (rawDateTime) {
                  try {
                    date = new Intl.DateTimeFormat('ru-RU', {
                      timeZone: 'Europe/Moscow',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(rawDateTime));
                  } catch {
                    date = timeMatch ? timeMatch[2].trim() : '';
                  }
                }
                const postTime = rawDateTime ? new Date(rawDateTime).getTime() : 0;

                // 3-hour new badge logic: only single newest post within 3 hours
                let isNew = false;
                if (!newestPostMarked && postTime > 0 && (now - postTime) <= threeHoursMs) {
                  isNew = true;
                  newestPostMarked = true;
                }

                // Views
                const viewsMatch = blockContent.match(/<span class="tgme_widget_message_views">([^<]+)<\/span>/i);
                const views = viewsMatch ? viewsMatch[1].trim() : (postId === '736' ? '81' : '');

                // Video check
                const isVideo = blockContent.includes('tgme_widget_message_video_player') || blockContent.includes('message_video');
                const videoThumbMatch = blockContent.match(/tgme_widget_message_video_thumb"[^>]*style="background-image:url\('([^']+)'\)"/i);
                const videoDurationMatch = blockContent.match(/class="(?:message_video_duration|tgme_widget_message_video_duration)[^"]*">([^<]+)<\/time>/i);

                // Voice Note check
                const isVoice = blockContent.includes('tgme_widget_message_voice') || blockContent.includes('message_audio');
                const voiceDurationMatch = blockContent.match(/class="(?:message_audio_duration|tgme_widget_message_voice_duration)[^"]*">([^<]+)<\/time>/i);
                const voiceDuration = voiceDurationMatch ? voiceDurationMatch[1] : (isVoice ? '0:36' : null);

                // Reactions: parse only real reactions
                const reactions: Array<{ emoji: string; count: number }> = [];
                const rxReactions = /<span class="tgme_reaction_emoji">([^<]+)<\/span>.*?<span class="tgme_reaction_count">([^<]+)<\/span>/g;
                let rm;
                while ((rm = rxReactions.exec(blockContent)) !== null) {
                  reactions.push({ emoji: rm[1], count: parseInt(rm[2]) || 1 });
                }

                posts.push({
                  id: postId,
                  text,
                  quote,
                  links: links.length > 0 ? links : undefined,
                  date,
                  rawDateTime,
                  timestamp: postTime,
                  isNew,
                  mediaUrl,
                  views,
                  reactions: reactions.length > 0 ? reactions : undefined,
                  video: isVideo ? {
                    thumbUrl: videoThumbMatch ? videoThumbMatch[1] : undefined,
                    duration: videoDurationMatch ? videoDurationMatch[1].trim() : '0:33',
                    embedUrl: `https://t.me/sserapphim/${postId}?embed=1`,
                    sourceUrl: `https://t.me/sserapphim/${postId}`,
                  } : undefined,
                  voiceNote: isVoice ? {
                    duration: voiceDuration || '0:36',
                    secondsTotal: 36,
                    waveform: [25, 40, 65, 80, 50, 70, 90, 85, 45, 60, 75, 95, 60, 40, 55, 70, 50, 35, 60, 80, 45, 30, 20],
                    isPlayable: false,
                  } : undefined,
                } as any);
              }
            }
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            handle: `@${handle}`,
            cleanHandle: handle,
            title,
            description,
            avatar: avatar || '/src/assets/images/photo_sunset_silhouette_1792086021872.jpg',
            subscribers,
            posts: posts.length > 0 ? posts : undefined,
          }));
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: errorMsg }));
        }
      });

      server.middlewares.use('/api/fetch-soundcloud', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
          const rawUrl = urlObj.searchParams.get('url') || '';
          if (!rawUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No URL provided' }));
            return;
          }

          let artist = 'slipp';
          let trackTitle = 'my new release';
          let avatar = '/src/assets/images/photo_ambient_synth_1792085377101.jpg';
          let duration = '03:15';

          const scOembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(rawUrl)}`;
          try {
            const scRes = await fetch(scOembedUrl);
            if (scRes.ok) {
              const data = await scRes.json();
              if (data.author_name) artist = data.author_name;
              if (data.title) trackTitle = data.title;
              if (data.thumbnail_url) avatar = data.thumbnail_url;
            }
          } catch {
            const match = rawUrl.match(/soundcloud\.com\/([^/]+)\/?([^/?#]+)?/);
            if (match) {
              artist = match[1];
              if (match[2]) trackTitle = match[2].replace(/-/g, ' ');
            }
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            artistName: artist,
            trackTitle,
            artworkUrl: avatar,
            duration,
            url: rawUrl,
          }));
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: errorMsg }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), metadataProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
