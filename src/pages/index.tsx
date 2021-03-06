import { GetStaticProps } from 'next';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import Image from 'next/image';

import { api } from '../services/api';
import { usePlayer } from '../ctx/PlayerContext';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';
import React from 'react';
import Head from 'next/head';

type Episode = {
  id: string;
  title: string;
  thumbnail: string,
  members: string;
  duration: number,
  durationAs: string,
  url: string,
  publishedAt: string,
}

type HomeProps = {
  allEpisodes: Array<Episode>;
  latestEpisodes: Array<Episode>;
}

export default function Home({ allEpisodes, latestEpisodes }: HomeProps) {
  const { playList } = usePlayer();
  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homePage}>
     

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image
                  width={192}
                  height={192}
                  objectFit="cover"
                  alt={episode.title}
                  src={episode.thumbnail}
                />
                {/* <img src={episode.thumbnail} alt={episode.title} /> */}

                <div className={styles.episodeDetails}>

                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAs}</span>

                </div>

                <button type='button' onClick={() => playList(episodeList, index)}>
                  <img src='/assets/play-green.svg' alt='Tocar episódio' />
                </button>

              </li>
            );
          })}
        </ul>
      </section>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 100 }}>
                    <Image
                      width={160}
                      height={160}
                      objectFit="cover"
                      alt={episode.title}
                      src={episode.thumbnail}
                    />
                    {/* <img src={episode.thumbnail} alt="" /> */}

                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAs}</td>
                  <td>
                    <button type='button' onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                      <img src='/assets/play-green.svg' alt='Tocar episódio' />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      members: episode.members,
      thumbnail: episode.thumbnail,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      durationAs: convertDurationToTimeString(Number(episode.file.duration)),
      duration: episode.file.duration,
      url: episode.file.url
    };
  });

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8,
  }
}
