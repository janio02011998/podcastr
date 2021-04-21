import styles from './styles.module.scss';

export function Player() {

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src='/assets/playing.svg' alt="tocando agora" />

                <strong>Tocando agora</strong>


            </header>
            <div className={styles.emptyPlayer}>
                <strong>Selecione um podcast para ouvir</strong>
            </div>
            <footer>

            </footer>
        </div>
    );
}