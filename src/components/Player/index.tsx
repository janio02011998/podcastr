import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Slider from 'rc-slider';

import { usePlayer } from '../../ctx/PlayerContext';

import 'rc-slider/assets/index.css';
import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import { addBusinessDays } from 'date-fns/esm';

export function Player() {

    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);

    const {
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        setPlayingState,
        togglePlay,
        toggleLoop,
        playPrevious,
        playNext,
        hasPrevious,
        hasNext,
        isShuffling,
        toggleShuffle,
        clearPlayerState,
    } = usePlayer();


    useEffect(() => {
        if (!audioRef.current) {
            return;
        }

        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    function setupProgressListener() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime))
        });
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount)
    }

    function handleEpisodeEnded() {
        if (hasNext) {
            playNext();
        } else {
            clearPlayerState()
        }
    }

    const episode = episodeList[currentEpisodeIndex];

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src='/assets/playing.svg' alt="tocando agora" />
                <strong>Tocando agora</strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <Image
                        width={592}
                        height={592}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <div className={styles.descriptionPlayer}>
                        <strong>{episode.title}</strong>
                        <span>{episode.members}</span>
                    </div>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={{ backgroundColor: '#04d361' }}
                                railStyle={{ backgroundColor: '#9f75ff' }}
                                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
                            />
                        ) : (
                            <div className={styles.emptySlider} />

                        )}
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>
                {episode && (
                    <audio
                        src={episode.url}
                        ref={audioRef}
                        autoPlay
                        onEnded={handleEpisodeEnded}
                        loop={isLooping}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                        onLoadedMetadata={setupProgressListener}
                    />
                )}
                <div className={styles.buttons}>
                    <button
                        type='button'
                        disabled={!episode || episodeList.length === 1}
                        onClick={toggleShuffle}
                        className={isShuffling ? styles.isActive : ''}
                    >
                        <img src='/assets/shuffle.svg' alt="Embaralhar" />
                    </button>

                    <button type='button' disabled={!episode || !hasPrevious} onClick={playPrevious}
                        className={currentEpisodeIndex === 0 ? styles.isNotActive : ''}
                    >
                        <img src='/assets/play-previous.svg' alt="Tocar anterior" />
                    </button>

                    <button
                        type='button'
                        className={styles.playButton}
                        disabled={!episode}
                        onClick={togglePlay}
                    >
                        {isPlaying
                            ? <img src='/assets/pause.svg' alt="Tocar próxima" />
                            : <img src='/assets/play.svg' alt="Tocar próxima" />
                        }
                    </button>
                    <button
                        type='button'
                        disabled={!episode || !hasNext}
                        onClick={playNext}
                        className={currentEpisodeIndex === episodeList.length - 1 ? styles.isNotActive : ''}
                    >
                        <img src='/assets/play-next.svg' alt="Tocar" />
                    </button>
                    <button
                        type='button'
                        disabled={!episode}
                        onClick={toggleLoop}
                        className={isLooping ? styles.isActive : ''}
                    >
                        <img src='/assets/repeat.svg' alt="Repetir" />
                    </button>
                </div>
            </footer>
        </div >
    );
}